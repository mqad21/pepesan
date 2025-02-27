import { Boom } from "@hapi/boom"
import makeWASocket, { AnyMessageContent, AuthenticationState, ConnectionState, DisconnectReason, proto, useMultiFileAuthState, UserFacingSocketConfig, WAMessage, WASocket } from "@whiskeysockets/baileys"
import fs from 'fs'
import path from 'path'
import { Handler, Router } from "."
import { Database } from "../Database"
import { Model } from "../Structures"
import { Config, ConnectionEvent, DbConfig, ExternalRequest, MessageResponse, RequestType, Response, ServerConfig, UserInfo } from "../Types"
import { isValidJid, parseJid, parseNumber, sleep } from "../Utils"
import Server from "./Server"
import { Extension } from "./Extension"

const connectionAttempts = new Map<string, number>()

export default class Pepesan {
    id: string
    version?: [number, number, number]
    sessionPath: string
    printQRInTerminal: boolean
    browserName: string
    isEventRegistered: boolean
    allowedJids?: string[]
    blockedJids?: string[]
    onOpen?: ConnectionEvent
    onClose?: ConnectionEvent
    onReconnect?: ConnectionEvent
    onQR?: ConnectionEvent
    onMessage?: (clientId: string, message: WAMessage) => Promise<void>
    error?: string
    auth?: AuthenticationState
    saveCreds: () => Promise<void> = async () => { }
    router: Router
    handler?: Handler
    dbConfig: DbConfig
    models?: typeof Model[]
    socks: Map<string, WASocket>
    clientIds: Set<string>
    connectionStates: Map<string, Partial<ConnectionState>> = new Map()
    userInfos: Map<string, UserInfo> = new Map()
    serverConfig: ServerConfig
    maxRetries: number
    extensions: Extension[] = []
    enableHttpServer: boolean

    constructor(router: Router, config: Config = {}) {
        this.id = config.id ?? 'Pepesan'
        this.clientIds = config.clientIds ?? new Set(['default'])
        this.socks = new Map()
        this.version = config.version
        this.sessionPath = config.sessionPath ?? './session'
        this.browserName = config.browserName ?? 'Pepesan'
        this.allowedJids = config.allowedNumbers?.map((number: string) => parseJid(number))
        this.blockedJids = config.blockedNumbers?.map((number: string) => parseJid(number))
        this.printQRInTerminal = config.printQRInTerminal ?? true
        this.isEventRegistered = false
        this.maxRetries = config.maxRetries ?? 5
        this.onOpen = config.onOpen
        this.onClose = config.onClose
        this.onReconnect = config.onReconnect
        this.onQR = config.onQR
        this.onMessage = config.onMessage
        this.router = router

        this.dbConfig = {
            ...config.db,
            path: config.db?.path ?? 'data.sqlite',
            timezone: config.db?.dialect === 'sqlite' ? '+00:00' : config.db?.timezone ?? '+00:00',
        }

        this.enableHttpServer = config.enableHttpServer ?? true
        this.serverConfig = {
            ...config.server,
            port: config.server?.port ?? 3000,
            prefixPath: config.server?.prefixPath ?? '/api'
        }

        this.models = config.models

        config.stateType = config.stateType ?? 'db'
        config.statePath = config.statePath ?? './state'
        config.statePrefixLength = config.statePrefixLength ?? 9
        config.readBeforeReply = config.readBeforeReply ?? true
        config.typingBeforeReply = config.typingBeforeReply ?? false
        config.reusableMenu = config.reusableMenu ?? true

        if (!fs.existsSync(config.statePath)) {
            fs.mkdirSync(config.statePath)
        }

        this.initDefaultClientIds()

        this.initDatabase()

        this.initServer()

        if (this.enableHttpServer) {
            this.startServer()
        }

        global.CONFIG = config
    }

    get server() {
        return Server.getInstance()
    }

    initDefaultClientIds(): void {
        fs.readdir(this.sessionPath, (e, files) => {
            try {
                if (e) {
                    console.error(e)
                }
                for (const file of files) {
                    const fileDir = path.join(this.sessionPath, file)
                    if (fs.lstatSync(fileDir).isDirectory()) {
                        this.clientIds.add(file)
                    }
                }
            } catch (e: any) {
                console.error(e)
            }
        })
    }

    async connect(): Promise<void> {
        for (const clientId of this.clientIds) {
            await this.connectClient(clientId)
        }
    }

    async connectClient(id: string = 'default'): Promise<void> {
        try {
            const sessionPath = path.join(this.sessionPath, id)
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
            const socketOptions: UserFacingSocketConfig = {
                printQRInTerminal: this.printQRInTerminal,
                version: this.version,
                auth: state,
                browser: [this.browserName, '', ''],
            }
            this.auth = state
            this.saveCreds = async () => {
                try {
                    await saveCreds()
                } catch (e) {
                    console.error(e)
                }
            }
            const sock = makeWASocket(socketOptions)
            this.socks.set(id, sock)
            this.initEvents(id)
            this.connectionStates.set(id, {})

            const userInfo = this.getUserInfo(sock)
            this.userInfos.set(id, userInfo)
            console.log("✅ Client with id " + id + " connected " + "(attempt " + (connectionAttempts.get(id) ?? 0) + ")")
        } catch (e) {
            console.error(e)
        }

    }

    private getUserInfo(sock: WASocket): UserInfo {
        return {
            number: parseNumber(sock.user?.id ?? ''),
            name: sock.user?.name ?? '',
            imgUrl: sock.user?.imgUrl ?? '',
            status: sock.user?.status ?? '',
        } as UserInfo
    }

    async disconnect(deleteSession: boolean = false): Promise<void> {
        for (const clientId of this.clientIds) {
            await this.disconnectClient(clientId, deleteSession)
        }
    }

    async disconnectClient(id: string = 'default', deleteSession: boolean = false): Promise<void> {
        try {
            if (deleteSession) {
                try {
                    const sessionPath = path.join(this.sessionPath, id)
                    fs.readdir(sessionPath, (e, files) => {
                        try {
                            if (e) {
                                console.error(e)
                            }
                            for (const file of files) {
                                const fileDir = path.join(sessionPath, file)
                                if (file !== '.gitignore') {
                                    try {
                                        fs.unlinkSync(fileDir)
                                    } catch (e: any) {
                                        console.error(e)
                                    }
                                }
                            }
                            fs.rmSync(sessionPath, { recursive: true, force: true })
                        } catch (e: any) {
                            console.error(e)
                        }
                    })
                } catch (e) {
                    console.error(e)
                }
            }
            const sock = this.socks.get(id)
            if (sock) {
                await sock.logout()
            }
            this.socks.delete(id)
            this.connectionStates.delete(id)
            console.log("❌ Client with id " + id + " disconnected")
        } catch (e) {
            console.error(e)
        }
    }

    private getMessageContentFromExternalRequest(request: ExternalRequest): AnyMessageContent | undefined {
        let response: MessageResponse | undefined
        const type = request.type ?? 'text'
        switch (type) {
            case 'image':
                response = request.media ? typeof request.media === 'string' ? Response.image.fromURL(request.media, request.text) : Response.image.fromBuffer(request.media, request.text) : undefined
                break;
            case 'video':
                response = request.media ? typeof request.media === 'string' ? Response.video.fromURL(request.media, request.text) : Response.video.fromBuffer(request.media, request.text) : undefined
                break;
            case 'document':
                response = request.media ? typeof request.media === 'string' ? Response.document.fromURL(request.media, request.text) : Response.document.fromBuffer(request.media, request.text) : undefined
                break;
            case 'audio':
                response = request.media ? typeof request.media === 'string' ? Response.audio.fromURL(request.media) : Response.audio.fromBuffer(request.media) : undefined
                break;
            case 'sticker':
                response = request.media ? typeof request.media === 'string' ? Response.sticker.fromURL(request.media) : Response.sticker.fromBuffer(request.media) : undefined
                break;
            case 'text':
                response = Response.text.fromString(request.text ?? '')
                break;
            default:
                response = undefined
        }
        return response?.getMessageContent() as AnyMessageContent
    }

    async execute(request: ExternalRequest, clientId: string = 'default'): Promise<AnyMessageContent[] | undefined> {
        try {
            const sock = this.socks.get(clientId)
            this.handler = new Handler(clientId, { router: this.router, socket: sock })
            if (!isValidJid(request.jid)) {
                this.handler.reply = async () => { return undefined }
            }

            const messageInfo: proto.IWebMessageInfo = {
                key: {
                    fromMe: false,
                    remoteJid: request.jid
                },
                message: {
                    conversation: request.text ?? ''
                }
            }

            await this.handler.setMessageInfo(messageInfo)
            return this.handler.getMessageContents()
        } catch (e) {
            console.error(e)
            return
        }
    }

    async send(request: ExternalRequest, number: string, clientId: string = 'default'): Promise<void> {
        try {
            const sock = this.socks.get(clientId)
            if (!sock) throw new Error('Socket is undefined')

            const jid = parseJid(number)

            if (global.CONFIG.typingBeforeReply) {
                await sock.sendPresenceUpdate("composing", jid)
            }

            await sleep(500)

            const messageContent = this.getMessageContentFromExternalRequest(request)
            if (!messageContent) throw new Error('Message content is undefined')

            await sock.sendMessage(jid, messageContent)
        } catch (e) {
            console.error(e)
        }
    }

    private initEvents(id: string = 'default'): void {
        const sock = this.socks.get(id)

        if (!sock) return

        sock.ev.on('creds.update', this.saveCreds)

        sock.ev.on('connection.update', async (connectionState: Partial<ConnectionState>) => {
            try {
                const state = connectionState
                this.connectionStates.set(id, state)
                const retry = connectionAttempts.get(id) ?? 0
                if (state.connection === 'close') {
                    const shouldReconnect = (state?.lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
                    console.log('connection closed due to ', state?.lastDisconnect?.error, ', reconnecting ', shouldReconnect)
                    // reconnect if not logged out
                    if (shouldReconnect) {
                        await this.connectClient(id)
                        this.onReconnect?.(id, state)
                        connectionAttempts.set(id, retry + 1)
                    } else {
                        this.onClose?.(id, state)
                        await this.disconnectClient(id, true)
                    }
                } else if (state.connection === 'open') {
                    this.onOpen?.(id, state)
                }

                if (state.qr) {
                    this.onQR?.(id, state)
                }

            } catch (e) {
                console.error("🚫 Error on connection update: " + e)
            }
        })

        sock.ev.on('messages.upsert', async ({ messages }: { messages: WAMessage[] }) => {
            try {
                const messageInfos = messages
                if (messageInfos && messageInfos.length) {
                    const messageInfo = messageInfos[0]
                    if (!messageInfo.key.fromMe) {
                        const jid = messageInfo.key.remoteJid ?? ''
                        if (!jid.includes('@g.us') && !jid.includes('status@broadcast') && this.isAllowedJid(jid)) {
                            this.handler = new Handler(id, { router: this.router, socket: sock })
                            await this.handler.setMessageInfo(messageInfo)
                            await this.handler.run()
                        }
                    }
                    this.onMessage?.(id, messageInfo)
                }
                return
            } catch (e) {
                console.error("🚫 Error on message upsert: " + e)
            }
        })
    }

    private initDatabase(): void {
        const db = new Database(this.dbConfig, this.models)
        global.db = db
    }

    private initServer(): Server {
        return Server.init(this)
    }

    private startServer(): void {
        Server.getInstance().start()
    }

    private isAllowedJid(jid: string): boolean {
        if (this.allowedJids !== undefined) {
            return this.allowedJids.includes(jid)
        }
        if (this.blockedJids !== undefined) {
            return !this.blockedJids.includes(jid)
        }
        return true
    }

    addExtension(extension: Extension): void {
        extension.setPepesan(this)
        extension.setRouter(this.router)
    }

}