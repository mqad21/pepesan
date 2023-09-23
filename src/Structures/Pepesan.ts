import { Boom } from "@hapi/boom"
import makeWASocket, { AnyMessageContent, AuthenticationState, ConnectionState, DisconnectReason, useMultiFileAuthState, UserFacingSocketConfig, WAMessage, WASocket } from "@whiskeysockets/baileys"
import fs from 'fs'
import path from 'path'
import { Handler, Router } from "."
import { Database } from "../Database"
import { Model } from "../Structures"
import { Config, ConnectionEvent, DbConfig, ExternalRequest, ServerConfig } from "../Types"
import { isValidJid, parseJid } from "../Utils"
import Server from "./Server"

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
    serverConfig: ServerConfig
    maxRetries: number

    constructor(router: Router, config: Config = {}) {
        this.id = config.id ?? 'Pepesan'
        this.clientIds = config.clientIds ?? new Set(['default'])
        this.socks = new Map()
        this.version = config.version ?? [2, 2323, 4]
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
        this.startServer()
        global.CONFIG = config
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
            console.log("✅ Client with id " + id + " connected " + "(attempt " + (connectionAttempts.get(id) ?? 0) + ")")
        } catch (e) {
            console.error(e)
        }

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
                                    fs.unlinkSync(fileDir)
                                }
                            }
                            fs.unlinkSync(sessionPath)
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
                await sock.ws.close()
            }
            this.socks.delete(id)
            this.connectionStates.delete(id)
            console.log("❌ Client with id " + id + " disconnected")
            this.initServer()
        } catch (e) {
            console.error(e)
        }
    }

    async execute(request: ExternalRequest, clientId: string = 'default'): Promise<AnyMessageContent[] | undefined> {
        try {
            const sock = this.socks.get(clientId)
            this.handler = new Handler(clientId, { router: this.router, socket: sock })
            if (!isValidJid(request.jid)) {
                this.handler.reply = async () => { return undefined }
            }
            const messageInfo = {
                key: {
                    fromMe: false,
                    remoteJid: request.jid
                },
                message: {
                    conversation: request.text
                }
            }
            await this.handler.setMessageInfo(messageInfo)
            return this.handler.getMessageContents()
        } catch (e) {
            console.error(e)
            return
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
                if (state.connection === 'close' && retry < this.maxRetries) {
                    const shouldReconnect = (state?.lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
                    // reconnect if not logged out
                    if (shouldReconnect) {
                        this.onReconnect?.(id, state)
                    } else {
                        this.onClose?.(id, state)
                        await this.disconnectClient(id, true)
                    }
                    await this.connectClient(id)
                    connectionAttempts.set(id, retry + 1)
                } else if (state.connection === 'close' && retry >= this.maxRetries) {
                    this.onClose?.(id, state)
                    await this.disconnectClient(id, true)
                } else if (state.connection === 'open') {
                    this.onOpen?.(id, state)
                }

                if (state.qr) {
                    this.onQR?.(id, state)
                }

            } catch (e) {
                console.error(e)
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
                console.error(e)
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

}