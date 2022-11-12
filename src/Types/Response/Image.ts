import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."

export class Image extends MessageResponse {
    caption?: string

    constructor(caption?: string) {
        super()
        this.caption = caption
    }

    static fromURL(url: string, caption?: string) {
        return new URLImage(url, caption)
    }

    static fromBuffer(buffer: Buffer, caption?: string) {
        return new BufferImage(buffer, caption)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLImage extends Image {
    url: string

    constructor(url: string, caption?: string) {
        super(caption)
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { image: { url: this.url }, caption: this.caption }
    }

}

export class BufferImage extends Image {
    buffer: Buffer

    constructor(buffer: Buffer, caption?: string) {
        super(caption)
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { image: this.buffer, caption: this.caption }
    }

}