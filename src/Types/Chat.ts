import { WASocket, proto } from "@whiskeysockets/baileys"
import { Router } from "../Structures"
import { State } from "../Structures/State"
import { Audio, Button, Document, Image, List, MenuResponse, MessageResponse, Sticker, Text, Video } from "./Response"
import { Route } from "./Routes"

export class Response {

    static clientId

    static getResponseClass(responseClass: any) {
        responseClass.prototype.clientId = this.clientId
        return responseClass
    }

    static get image() {
        return this.getResponseClass(Image) as typeof Image
    }

    static get text() {
        return this.getResponseClass(Text) as typeof Text
    }

    static get sticker() {
        return this.getResponseClass(Sticker) as typeof Sticker
    }

    static get audio() {
        return this.getResponseClass(Audio) as typeof Audio
    }

    static get video() {
        return this.getResponseClass(Video) as typeof Video
    }

    static get button() {
        return this.getResponseClass(Button) as typeof Button
    }

    static get list() {
        return this.getResponseClass(List) as typeof List
    }

    static get menu() {
        return this.getResponseClass(MenuResponse.Menu) as typeof MenuResponse.Menu
    }

    static get document() {
        return this.getResponseClass(Document) as typeof Document
    }

}

export type Request = {
    id?: string | null
    clientId?: string | null
    key?: proto.IMessageKey | null
    text?: string
    menu?: string
    button?: ButtonObject
    list?: ListObject
    jid: string | null
    number?: string
    name?: string | null
    state?: string | null
    stateObject?: State
    type?: RequestType
    message?: proto.IWebMessageInfo
    document?: proto.Message.IDocumentMessage
    image?: proto.Message.IImageMessage
    video?: proto.Message.IVideoMessage
    audio?: proto.Message.IAudioMessage
    sticker?: proto.Message.IStickerMessage
    contact?: proto.Message.IContactMessage
    location?: proto.Message.ILocationMessage
    route?: Route
}

export type RequestType = 'image' | 'video' | 'document' | 'sticker' | 'audio'

export type MessageHandler = {
    router: Router,
    socket?: WASocket
}

export type ButtonObject = { text: string, value: string }

export type ListObject = { text: string, value: string, description: string }

export type MenuObject = { text: string, value: string, code?: string }

export type ExternalRequest = {
    jid: string,
    text?: string,
    media?: string | Buffer,
    type?: RequestType | 'text'
}