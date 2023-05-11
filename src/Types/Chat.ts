import { WASocket, proto } from "@adiwajshing/baileys"
import { Router } from "../Structures"
import { State } from "../Structures/State"
import { Audio, Button, Image, List, Menu, Sticker, Text, Video } from "./Response"
import { Route } from "./Routes"

export class Response {

    static get image() {
        return Image
    }

    static get text() {
        return Text
    }

    static get sticker() {
        return Sticker
    }

    static get audio() {
        return Audio
    }

    static get video() {
        return Video
    }

    static get button() {
        return Button
    }

    static get list() {
        return List
    }

    static get menu() {
        return Menu
    }

}

export type Request = {
    id?: string | null
    clientId?: string | null
    key?: proto.IMessageKey | null
    text?: string
    menu?: number
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