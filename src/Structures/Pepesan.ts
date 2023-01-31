import makeWASocket, { AuthenticationState, ConnectionState, DisconnectReason, fetchLatestBaileysVersion, proto, useMultiFileAuthState, UserFacingSocketConfig, WAMessage, WASocket } from "@adiwajshing/baileys"
import { Boom } from "@hapi/boom"
import fs from 'fs'
import path from 'path'
import { Handler, Router } from "."
import { Database } from "../Database"
import { Model } from "../Structures"
import { Config, DbConfig } from "../Types"
import { parseJid } from "../Utils"

export default class Pepesan {
    id: string
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

    constructor(router: Router, config?: Config) {
        this.id = config?.id ?? 'Pepesan'
        this.sessionPath = config?.sessionPath ?? './session'
        this.browserName = config?.browserName ?? 'Pepesan'
        this.allowedJids = config?.allowedNumbers?.map((number: string) => parseJid(number))
        this.blockedJids = config?.blockedNumbers?.map((number: string) => parseJid(number))
        this.printQRInTerminal = config?.printQRInTerminal ?? true
        this.isEventRegistered = false
        this.onOpen = config?.onOpen
        this.onClose = config?.onClose
        this.onReconnect = config?.onReconnect
        this.onQR = config?.onQR
        this.onMessage = config?.onMessage
        this.router = router
        this.dbConfig = {
            ...config?.db,
            path: config?.db?.path ?? 'data.sqlite'
        }
        this.models = config?.models
        this.initDatabase()
    }

    async connect(): Promise<void> {
        try {
            const { version } = await fetchLatestBaileysVersion()
            const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath)
            const socketOptions: UserFacingSocketConfig = {
                printQRInTerminal: this.printQRInTerminal,
                version,
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
            await this.sock?.ws?.terminate()
        } catch (e) {
            console.error(e)
        } finally {
            if (deleteSession) {
                this.sock?.logout()
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
        }
    }

    private initEvents(): void {
        global.sock?.ev.on('creds.update', this.saveCreds)

        global.sock?.ev.on('connection.update', async (connectionState: Partial<ConnectionState>) => {
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

        global.sock?.ev.on('messages.upsert', async ({ messages }: { messages: WAMessage[] }) => {
            try {
                const messageInfos = messages
                if (messageInfos && messageInfos.length) {
                    const messageInfo = messageInfos[0]
                    if (!messageInfo.key.fromMe) {
                        const jid = messageInfo.key.remoteJid ?? ''
                        if (!jid.includes('@g.us') && !jid.includes('status@broadcast') && this.isAllowedJid(jid)) {
                            this.handler = new Handler(this.id, { router: this.router })
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