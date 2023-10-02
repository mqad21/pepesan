import { getConnectionStatusString } from "../../Utils"
import Server from "../Server"
import QRCode from "qrcode"

const getServer = () => {
    const server = Server.getInstance()
    if (!server.pepesan) {
        throw new Error('Pepesan is not initialized')
    }
    return server
}

const getQr = (req: any) => {
    const server = getServer()
    const { pepesan } = server
    const id = req.params?.id ?? 'default'

    if (!pepesan) {
        throw new Error('Pepesan is not initialized')
    }

    const qr = pepesan.connectionStates.get(id)?.qr

    if (!qr) {
        throw new Error('QR is not available')
    }

    return qr
}

export const getConnectionStatus = (req) => {
    const server = getServer()
    const { pepesan } = server
    const id = req.params?.id ?? 'default'

    if (!pepesan) {
        throw new Error('Pepesan is not initialized')
    }

    const connectionState = pepesan.connectionStates.get(id)

    if (!connectionState) {
        throw new Error('Client has not been created')
    }

    const status = getConnectionStatusString(connectionState)

    return {
        status,
        isConnected: status === 'Connected',
    }
}


export const getQrString = async (req, res) => {
    try {
        const status = getConnectionStatus(req)
        if (status.isConnected) {
            return getServer().sendSuccessResponse(res, null, 'Client is already connected')
        }
        const qr = getQr(req)
        return getServer().sendSuccessResponse(res, qr)
    } catch (error: any) {
        return getServer().sendErrorResponse(res, error.message)
    }
}

export const getQrImage = async (req, res) => {
    try {
        const status = getConnectionStatus(req)
        if (status.isConnected) {
            return getServer().sendSuccessResponse(res, null, 'Client is already connected')
        }
        const qr = getQr(req)
        const image = await QRCode.toBuffer(qr)
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': image.length
        })
        return res.end(image)
    } catch (error: any) {
        return getServer().sendErrorResponse(res, error.message)
    }
}

export const getStatus = async (req, res) => {
    try {
        const status = getConnectionStatus(req)
        return getServer().sendSuccessResponse(res, status)
    } catch (error: any) {
        return getServer().sendErrorResponse(res, error.message)
    }
}

export const newConnection = async (req, res) => {
    try {
        const id = req.params?.id ?? 'default'
        const server = getServer()
        const { pepesan } = server
        if (!pepesan) {
            throw new Error('Pepesan is not initialized')
        }
        await pepesan.connectClient(id)
        return getServer().sendSuccessResponse(res, { id }, 'Client with id ' + id + ' has been created')
    } catch (error: any) {
        return getServer().sendErrorResponse(res, error.message)
    }
}

export const removeConnection = async (req, res) => {
    try {
        const id = req.params?.id ?? 'default'
        const removeSession = req.query.removeSession || false
        const server = getServer()
        const { pepesan } = server
        if (!pepesan) {
            throw new Error('Pepesan is not initialized')
        }
        await pepesan.disconnectClient(id, removeSession)
        return getServer().sendSuccessResponse(res, null, 'Client with id ' + id + ' has been removed')
    } catch (error: any) {
        return getServer().sendErrorResponse(res, error.message)
    }
}