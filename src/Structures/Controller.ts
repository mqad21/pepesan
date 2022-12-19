import { AnyMessageContent, proto, WAMessage } from "@adiwajshing/baileys"
import { MessageResponse } from "../Types"
import { parseJid } from "../Utils"
import { Handler } from "./Handler"

export class Controller {

    private handler: Handler

    constructor(handler: Handler) {
        this.handler = handler
    }

    protected async reply(response: MessageResponse | MessageResponse[] | string | string[] | any[]) {
        const messages: (WAMessage | undefined)[] = []
        const contents = this.handler.getMessageContent(response)
        for (const content of contents) {
            const message = await this.handler.reply(content)
            messages.push(message)
        }
        return messages
    }

    protected async send(number: string, response: MessageResponse | MessageResponse[] | string | string[] | any[]) {
        const messages: (WAMessage | undefined)[] = []
        const contents = this.handler.getMessageContent(response)
        const jid = parseJid(number)
        for (const content of contents) {
            const message = await this.handler.send(jid, content)
            messages.push(message)
        }
        return messages
    }

    protected async setState(state: string) {
        return await this.handler.request.stateObject?.setState(state)
    }

    protected async deleteState() {
        return await this.handler.request.stateObject?.deleteState()
    }

    async getMedia() {
        return await this.handler.getMedia()
    }

    protected async addToGroup(userJid: string, groupJid: string) {
        return await this.handler.addToGroup(userJid, groupJid)
    }

    protected async forwardMessage(jid: string, quoted?: WAMessage) {
        return await this.handler.forwardMessage(jid, quoted)
    }

    protected async sendQuoted(jid: string, response: MessageResponse, quoted: WAMessage) {
        return await this.handler.sendQuoted(jid, response.getMessageContent(), quoted)
    }

    protected async checkParticipant(userJid: string, groupJid: string) {
        return await this.handler.checkParticipant(userJid, groupJid)
    }

    protected getResponseFromRequest() {
        return this.handler.getResponseFromRequest()
    }

}