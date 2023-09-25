import { ExternalRequest } from "../../Types"
import { parseJid } from "../../Utils"
import Server from "../Server"

const getServer = () => {
    const server = Server.getInstance()
    if (!server.pepesan) {
        throw new Error('Pepesan is not initialized')
    }
    return server
}

export const sendMessage = async (req, res) => {
    try {
        const server = getServer()
        const { pepesan } = server
        const id = req.params?.id ?? 'default'

        const message = req.body?.message as ExternalRequest

        const number = req.body?.number as string

        if (!message) {
            throw new Error('Parameter message is required')
        }

        if (!number) {
            throw new Error('Parameter number is required')
        }

        await pepesan?.send(message, number, id)
        return getServer().sendSuccessResponse(res, null, 'Messages sent')
    } catch (error: any) {
        return getServer().sendErrorResponse(res, error.message)
    }
}