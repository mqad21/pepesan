import { AnyMessageContent, DownloadableMessage, downloadContentFromMessage, downloadMediaMessage, getContentType, GroupParticipant, MessageType, proto, WAMessage } from "@adiwajshing/baileys"
import { ButtonObject, Callback, ListObject, MessageHandler, MessageResponse, Request, RequestType, Response, Route } from "../Types"
import { filterAsync, findAsyncSequential, getObjectType, getParamsName, getTextFromMessage, isTextMatch } from "../Utils"
import StringExtractor from "../Utils/StringExtractor"
import { Controller } from "./Controller"
import { Router } from "./Router"
import { State } from "./State"

export class Handler {
    public clientId: string
    private _messageInfo?: proto.IWebMessageInfo
    private _router?: Router
    private _stateObject?: State
    private _matchRoute?: Route
    private _state?: string | null

    constructor(clientId: string, messageHandler: MessageHandler) {
        this.clientId = clientId
        this._router = messageHandler.router
    }

    private get text(): string {
        return getTextFromMessage(this.message)
    }

    private get button(): ButtonObject {
        return {
            text: this.message?.buttonsResponseMessage?.selectedDisplayText!,
            value: this.message?.buttonsResponseMessage?.selectedButtonId!,
        }
    }

    private get list(): ListObject {
        return {
            text: this.message?.listResponseMessage?.title!,
            value: this.message?.listResponseMessage?.singleSelectReply?.selectedRowId!,
            description: this.message?.listResponseMessage?.description!
        }
    }

    private get jid(): string | null {
        return this._messageInfo?.key?.remoteJid ?? null
    }

    private get number(): string | undefined {
        if (!this.jid) return
        return this.jid.split("@")[0]
    }

    private get name(): string | null | undefined {
        return this._messageInfo?.pushName
    }

    private get messageType(): MessageType | undefined {
        return getContentType(this.message!)
    }

    private get type(): RequestType {
        return this.messageType?.substr(0, this.messageType?.indexOf('Message')) as RequestType
    }

    private get message(): proto.IMessage | undefined {
        return this._messageInfo?.message ?? undefined
    }

    get request(): Request {
        return {
            clientId: this.clientId,
            text: this.text,
            button: this.button,
            list: this.list,
            jid: this.jid,
            number: this.number,
            name: this.name,
            state: this._state,
            stateObject: this._stateObject,
            type: this.type,
            message: this._messageInfo,
            document: this.message?.documentMessage ?? undefined,
            image: this.message?.imageMessage ?? undefined,
            video: this.message?.videoMessage ?? undefined,
            audio: this.message?.audioMessage ?? undefined,
            sticker: this.message?.stickerMessage ?? undefined,
            contact: this.message?.contactMessage ?? undefined,
            location: this.message?.locationMessage ?? undefined,
            route: this._matchRoute
        }
    }

    private async initState() {
        const state = new State(this.jid!)
        this._state = await state.get()
        this._stateObject = state
    }

    async setMessageInfo(messageInfo: proto.IWebMessageInfo) {
        this._messageInfo = messageInfo
        await this.initState()
        return this
    }

    private async getMatchRoute(): Promise<Route | undefined> {
        const matchRoutes = await this.getMatchRoutes()

        if (!matchRoutes) return
        return findAsyncSequential(matchRoutes, async (route: Route) => {
            for await (const middleware of route.middlewares!) {
                this._matchRoute = route
                const result = await middleware(this.request, () => true)
                if (result === false) return false

                const type = getObjectType(result, 2)

                if (type === 'MessageResponse') {
                    route.callback = function () {
                        return result
                    }
                    return route
                } else {
                    route.callback = route.originCallback
                }
            }
            return true
        })
    }

    private getMatchRoutes(): Promise<Route[]> {
        return filterAsync(this._router?.routes, async (route: Route) => {
            const { path } = route
            if (route.type === 'keyword') return this.isKeywordMatch(path, this.text)
            if (route.type === 'state') return await this.isStateMatch(path)
            if (route.type === 'button') return await this.isButtonMatch(path, this.request.button)
            if (route.type === 'list') return await this.isListMatch(path, this.request.list)
            return false
        })
    }

    private isKeywordMatch(path: string, text: string) {
        return isTextMatch(text, path)
    }

    private async isStateMatch(path: string) {
        return isTextMatch(this._state!, path)
    }

    private async isButtonMatch(path: string, button?: ButtonObject) {
        if (!button) return false
        return isTextMatch(button.text, path) || isTextMatch(button.value, path)
    }

    private async isListMatch(path: string, list?: ListObject) {
        if (!list) return false
        return isTextMatch(list.text, path) || isTextMatch(list.value, path)
    }

    private async callback() {
        try {
            const returnValue = await this.getReturnValue()
            const messageContents = this.getMessageContent(returnValue)
            for (const content of messageContents) {
                await this.reply(content)
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    private async getReturnValue(): Promise<Response | void | string> {
        const matchRoute = await this.getMatchRoute()

        if (!matchRoute) return

        let text, returnValue
        switch (matchRoute.type) {
            case 'state':
                text = this._state
                break
            case 'button':
                text = this.button.value
                break
            case 'list':
                text = this.list.value
                break
            default:
                text = this.text
                break
        }
        let requestParams = StringExtractor(matchRoute.path, { ignoreCase: true })(text!) ?? {}

        if (Array.isArray(matchRoute?.callback)) {
            const [ControllerClass, method] = matchRoute?.callback!
            const controller = new ControllerClass(this)

            const callback = controller[method as keyof Controller] as Callback
            const callbackParams = getParamsName(callback)
            callbackParams.shift()

            requestParams = callbackParams.map((param: string) => requestParams[param]) ?? []

            returnValue = await (controller[method as keyof Controller] as Callback)(this.request, ...requestParams)
        } else {
            const callback = matchRoute?.callback as Callback
            const callbackParams = getParamsName(callback)
            callbackParams.shift()

            requestParams = callbackParams.map((param: string) => requestParams[param]) ?? []

            returnValue = await matchRoute?.callback!(this.request)
        }

        return returnValue
    }

    getMessageContent(returnValue: any): AnyMessageContent[] {
        const type = getObjectType(returnValue, 2)

        const messageContents: AnyMessageContent[] = []
        if (typeof returnValue === 'string') {
            const messageContent = Response.text.fromString(returnValue).getMessageContent()
            messageContent && messageContents.push(messageContent)
        } else if (type === 'MessageResponse') {
            const messageContent = (returnValue as MessageResponse).getMessageContent()
            messageContent && messageContents.push(messageContent)
        } else if (Array.isArray(returnValue)) {
            (returnValue as any[]).forEach((value: any) => {
                const messageContent = this.getMessageContent(value)
                messageContents.push(...messageContent)
            })
        }

        return messageContents
    }

    private async getContentMessage(): Promise<Buffer | undefined> {
        try {
            const stream = await downloadContentFromMessage(
                this._messageInfo?.message?.documentMessage as DownloadableMessage,
                this.type
            )
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            return buffer
        } catch (e) {
            console.error(e)
            return
        }
    }

    private async getMediaMessage(): Promise<Buffer | undefined> {
        try {
            const buffer = await downloadMediaMessage(
                this._messageInfo!,
                'buffer',
                {},
            )
            return buffer as Buffer
        } catch (e) {
            console.error(e)
            return
        }
    }

    async getMedia(): Promise<Buffer | undefined> {
        const contentMessage = await this.getContentMessage()
        if (contentMessage) return contentMessage
        const mediaMessage = await this.getMediaMessage()
        if (mediaMessage) return mediaMessage
        return
    }

    async reply(message?: AnyMessageContent) {
        return await this.send(this.jid, message)
    }

    async send(jid: string | null, message?: AnyMessageContent) {
        if (jid && message) return await sock?.sendMessage(jid, message)
        return
    }

    async addToGroup(userJid: string, groupJid: string) {
        return await sock?.groupParticipantsUpdate(groupJid, [userJid], 'add')
    }

    async checkParticipant(userJid: string, groupJid: string): Promise<boolean> {
        const groupMetaData = await sock?.groupMetadata(groupJid)
        return groupMetaData.participants.findIndex((participant: GroupParticipant) => participant.id === userJid) !== -1
    }

    async forwardMessage(jid: string, quoted?: WAMessage) {
        return await sock?.sendMessage(jid, { forward: this._messageInfo! }, { quoted })
    }

    async sendQuoted(jid: string, message?: AnyMessageContent, quoted?: WAMessage) {
        if (jid && message) return await sock?.sendMessage(jid, message, { quoted })
        return
    }

    async getResponseFromRequest(): Promise<MessageResponse> {
        const media = await this.getMedia()
        if (media) {
            switch (this.request.type) {
                case 'image':
                    return Response.image.fromBuffer(media!, this.request.text)
                case 'video':
                    return Response.video.fromBuffer(media!, this.request.text, Buffer.from(this.request.video?.jpegThumbnail!), this.request.video?.gifPlayback!)
                case 'sticker':
                    return Response.sticker.fromBuffer(media!)
                case 'audio':
                    return Response.audio.fromBuffer(media!, this.request.audio?.ptt!)
                default:
                    return Response.text.fromString(this.request.text!)
            }
        }
        return Response.text.fromString(this.request.text!)
    }

    async run() {
        await this.callback()
    }

}
