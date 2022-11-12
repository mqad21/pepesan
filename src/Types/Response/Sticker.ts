import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."

export class Sticker extends MessageResponse {

    constructor() {
        super()
    }

    static fromURL(url: string) {
        return new URLSticker(url)
    }

    static fromBuffer(buffer: Buffer) {
        return new BufferSticker(buffer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLSticker extends Sticker {
    url: string

    constructor(url: string) {
        super()
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { sticker: { url: this.url } }
    }

}

export class BufferSticker extends Sticker {
    buffer: Buffer

    constructor(buffer: Buffer) {
        super()
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { sticker: this.buffer }
    }

}