import { ConnectionState, WAMessage } from "@whiskeysockets/baileys"
import { Model } from "../Structures"
import { Dialect } from "sequelize"
import { Router } from "express"

export type ConnectionEvent = (clientId: string, state: Partial<ConnectionState>) => void

export type Config = {
    id?: string,
    version?: [number, number, number],
    printQRInTerminal?: boolean,
    sessionPath?: string,
    browserName?: string,
    allowedNumbers?: string[], // set to null wheter is allowed for all numbers
    blockedNumbers?: string[], // e.g.: ["6281234567890", "6289876543210"]
    onOpen?: ConnectionEvent
    onClose?: ConnectionEvent
    onReconnect?: ConnectionEvent
    onQR?: ConnectionEvent,
    onMessage?: (clientId: string, message: WAMessage) => Promise<void>,
    db?: DbConfig,
    enableHttpServer?: boolean,
    server?: ServerConfig,
    models?: typeof Model[],
    menuTemplate?: string,
    menuHeader?: string,
    stateType?: 'db' | 'file',
    statePath?: string,
    statePrefixLength?: number,
    readBeforeReply?: boolean,
    typingBeforeReply?: boolean,
    reusableMenu?: boolean,
    clientIds?: Set<string>,
    maxRetries?: number,
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

export type ServerConfig = {
    port?: number
    prefixPath?: string
    authKey?: string
    customRoute?: typeof Router
}

export type ServerMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace'

export type ServerRoute = {
    path: string,
    method: ServerMethod,
    handler: (req: any, res: any) => void
}

export type UserInfo = {
    number: string,
    name?: string,
    imgUrl?: string,
    status?: string
} & Record<string, any>