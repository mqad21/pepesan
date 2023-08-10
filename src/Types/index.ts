import { WASocket } from '@whiskeysockets/baileys'
import { Database } from '../Database'

declare global {
    var sock: WASocket
    var db: Database
}

export * from './Connection'
export * from './Routes'
export * from './Middleware'
export * from './Chat'
export * from './Response'