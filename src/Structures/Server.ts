import { WASocket } from '@whiskeysockets/baileys'
import express, { Router } from 'express'
import { ServerRoute } from '../Types'
import Pepesan from './Pepesan'
import { getAllClients, getQrImage, getQrString, getStatus, newConnection, removeConnection } from './Server/ConnectionController'
import { sendMessage } from './Server/MessageController'
import http from 'http'

export default class Server {

    private static instance: Server
    public pepesan?: Pepesan
    public httpServer?: http.Server

    static init(pepesan: Pepesan) {
        Server.getInstance().pepesan = pepesan
        return Server.getInstance()
    }

    static getInstance() {
        if (!Server.instance) {
            Server.instance = new Server()
        }
        return Server.instance
    }

    public getSocket(id: string): WASocket | undefined {
        return this.pepesan?.socks.get(id)
    }

    public sendSuccessResponse(res: any, data?: any, message?: string) {
        res.send({
            success: true,
            data,
            message
        }).status(200)
    }

    public sendErrorResponse(res: any, error: any, status: number = 500) {
        res.send({
            success: false,
            message: error
        }).status(status)
    }

    public start() {
        if (!this.pepesan) {
            throw new Error('Pepesan is not initialized')
        }
        const app = express()
        app.use(express.json())
        app.use(this.authMiddleware.bind(this))
        if (this.pepesan.serverConfig.customRoute) {
            app.use(this.pepesan.serverConfig.prefixPath!, this.pepesan.serverConfig.customRoute!)
        }
        app.use(this.pepesan.serverConfig.prefixPath!, this.getRouter())
        this.httpServer = app.listen(this.pepesan.serverConfig.port, () => console.log(`Server is running on port ${this.pepesan?.serverConfig.port}`))
    }

    private getRoutes(): ServerRoute[] {
        return [
            {
                path: '/clients',
                method: 'get',
                handler: getAllClients
            },
            {
                path: '/qr/:id?',
                method: 'get',
                handler: getQrString
            },
            {
                path: '/qr-image/:id?',
                method: 'get',
                handler: getQrImage
            },
            {
                path: '/status/:id?',
                method: 'get',
                handler: getStatus
            },
            {
                path: '/connect/:id?',
                method: 'post',
                handler: newConnection
            },
            {
                path: '/disconnect/:id?',
                method: 'post',
                handler: removeConnection
            },
            {
                path: '/send/:id?',
                method: 'post',
                handler: sendMessage
            }
        ]
    }

    public getRouter() {
        const router = Router()
        for (const route of this.getRoutes()) {
            router[route.method](route.path, route.handler)
        }
        return router
    }

    private authMiddleware(req: any, res: any, next: any) {
        const authKey = this.pepesan!.serverConfig.authKey
        if (!authKey) {
            return next()
        }
        const key = req.query.authKey || req.headers['x-auth-key']
        if (key !== authKey) {
            return this.sendErrorResponse(res, 'Unauthorized', 401)
        }
        return next()
    }

}