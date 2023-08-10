import makeWASocket, { AnyMessageContent, AuthenticationState, ConnectionState, DisconnectReason, fetchLatestBaileysVersion, proto, useMultiFileAuthState, UserFacingSocketConfig, WAMessage, WASocket } from "@adiwajshing/baileys"
import { Boom } from "@hapi/boom"
import fs from 'fs'
import path from 'path'
import { Handler, Router } from "."
import { Database } from "../Database"
import { Model } from "../Structures"
import { Config, DbConfig, ExternalRequest, Response } from "../Types"
import { parseJid } from "../Utils"

export default class Pepesan {
    id: string
    version?: [number, number, number]
    sessionPath: string
    printQRInTerminal: boolean
    browserName: string
    isEventRegistered: boolean
    allowedJids?: string[]
    blockedJids?: string[]
    onOpen?: (state: Partial<ConnectionState>) => void
    onClose?: (state: Partial<ConnectionState>) => void
    onReconnect?: (state: Partial<ConnectionState>) => void
    onQR?: (state: Partial<ConnectionState>) => void
    onMessage?: (message: WAMessage) => Promise<void>
    error?: string
    auth?: AuthenticationState
    saveCreds: () => Promise<void> = async () => { }
    state?: Partial<ConnectionState>
    router: Router
    handler?: Handler
    dbConfig?: DbConfig
    models?: typeof Model[]
    sock?: WASocket

    constructor(router: Router, config: Config = {}) {
        this.id = config.id ?? 'Pepesan'
        this.version = config.version ?? [2, 2323, 4]
        this.sessionPath = config.sessionPath ?? './session'
        this.browserName = config.browserName ?? 'Pepesan'
        this.allowedJids = config.allowedNumbers?.map((number: string) => parseJid(number))
        this.blockedJids = config.blockedNumbers?.map((number: string) => parseJid(number))
        this.printQRInTerminal = config.printQRInTerminal ?? true
        this.isEventRegistered = false
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
        this.models = config.models

        config.stateType = config.stateType ?? 'db'
        config.statePath = config.statePath ?? './state'
        config.statePrefixLength = config.statePrefixLength ?? 9
        config.readBeforeReply = config.readBeforeReply ?? true
        config.reusableMenu = config.reusableMenu ?? true

        if (!fs.existsSync(config.statePath)) {
            fs.mkdirSync(config.statePath)
        }

        this.initDatabase()
        global.CONFIG = config
    }

    async connect(): Promise<void> {
        try {
            // const { version } = await fetchLatestBaileysVersion()
            const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath)
            const socketOptions: UserFacingSocketConfig = {
                printQRInTerminal: this.printQRInTerminal,
                version: this.version,
                auth: state,
                browser: [this.browserName, '', '']
            }
            this.auth = state
            this.saveCreds = saveCreds
            this.sock = makeWASocket(socketOptions)
            global.sock = this.sock
            this.initEvents()
        } catch (e) {
            console.error(e)
        }

    }

    async disconnect(deleteSession: boolean = false): Promise<void> {
        try {
            this.sock?.ws?.terminate()
            if (deleteSession) {
                try {
                    await this.sock?.logout()
                } catch (e) {
                    console.error(e)
                }
                fs.readdir(this.sessionPath, (e, files) => {
                    if (e) {
                        console.error(e)
                    }
                    for (const file of files) {
                        const fileDir = path.join(this.sessionPath, file)
                        if (file !== '.gitignore') {
                            fs.unlinkSync(fileDir)
                        }
                    }
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    async execute(request: ExternalRequest): Promise<AnyMessageContent[] | undefined> {
        try {
            this.handler = new Handler(this.id, { router: this.router, socket: this.sock })
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

    private initEvents(): void {
        this.sock?.ev.on('creds.update', this.saveCreds)

        this.sock?.ev.on('connection.update', async (connectionState: Partial<ConnectionState>) => {
            try {
                this.state = connectionState
                if (this.state.connection === 'close') {
                    const shouldReconnect = (this.state?.lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
                    // reconnect if not logged out
                    if (shouldReconnect) {
                        await this.connect()
                        this.onReconnect?.(this.state)
                    } else {
                        this.onClose?.(this.state)
                        await this.disconnect(true)
                        await this.connect()
                    }
                } else if (this.state.connection === 'open') {
                    this.onOpen?.(this.state)
                }

                if (this.state.qr) {
                    this.onQR?.(this.state)
                }

            } catch (e) {
                console.error(e)
            }
        })

        this.sock?.ev.on('messages.upsert', async ({ messages }: { messages: WAMessage[] }) => {
            try {
                const messageInfos = messages
                if (messageInfos && messageInfos.length) {
                    const messageInfo = messageInfos[0]
                    if (!messageInfo.key.fromMe) {
                        const jid = messageInfo.key.remoteJid ?? ''
                        if (!jid.includes('@g.us') && !jid.includes('status@broadcast') && this.isAllowedJid(jid)) {
                            this.handler = new Handler(this.id, { router: this.router, socket: this.sock })
                            await this.handler.setMessageInfo(messageInfo)
                            await this.handler.run()
                        }
                    }
                    this.onMessage?.(messageInfo)
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