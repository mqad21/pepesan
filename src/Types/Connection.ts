import { ConnectionState, WAMessage } from "@whiskeysockets/baileys"
import { Model } from "../Structures"
import { Dialect } from "sequelize"

export type Config = {
    id?: string,
    version?: [number, number, number],
    printQRInTerminal?: boolean,
    sessionPath?: string,
    browserName?: string,
    allowedNumbers?: string[], // set to null wheter is allowed for all numbers
    blockedNumbers?: string[], // e.g.: ["6281234567890", "6289876543210"]
    onOpen?: (state: Partial<ConnectionState>) => void
    onClose?: (state: Partial<ConnectionState>) => void
    onReconnect?: (state: Partial<ConnectionState>) => void
    onQR?: (state: Partial<ConnectionState>) => void,
    onMessage?: (message: WAMessage) => Promise<void>,
    db?: DbConfig,
    models?: typeof Model[],
    menuTemplate?: string,
    menuHeader?: string,
    stateType?: 'db' | 'file',
    statePath?: string,
    statePrefixLength?: number,
    readBeforeReply?: boolean,
    typingBeforeReply?: boolean,
    reusableMenu?: boolean,
}

export type DbConfig = {
    dialect?: Dialect
    host?: string
    port?: number
    name?: string
    user?: string
    pass?: string
    path?: string // path to .sqlite file
    syncAlter?: boolean
    timezone?: string
}