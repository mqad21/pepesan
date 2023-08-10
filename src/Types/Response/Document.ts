import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."

export class Document extends MessageResponse {

    mimetype: string

    constructor(mimetype?: string) {
        super()
        this.mimetype = mimetype ?? ''
    }

    static fromURL(url: string, mimetype?: string) {
        return new URLDocument(url, mimetype)
    }

    static fromBuffer(buffer: Buffer, mimetype?: string) {
        return new BufferDocument(buffer, mimetype)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLDocument extends Document {
    url: string

    constructor(url: string, mimetype?: string) {
        super(mimetype)
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { document: { url: this.url }, mimetype: this.mimetype }
    }

}

export class BufferDocument extends Document {
    buffer: Buffer

    constructor(buffer: Buffer, mimetype?: string) {
        super(mimetype)
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { document: this.buffer, mimetype: this.mimetype }
    }

}