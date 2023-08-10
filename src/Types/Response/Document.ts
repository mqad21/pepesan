import { AnyMessageContent } from "@whiskeysockets/baileys"
import { MessageResponse } from "."

export class Document extends MessageResponse {

    mimetype: string
    fileName: string

    constructor(mimetype?: string, fileName?: string) {
        super()
        this.mimetype = mimetype ?? ''
        this.fileName = fileName ?? 'document'
    }

    static fromURL(url: string, mimetype?: string, fileName?: string) {
        return new URLDocument(url, mimetype, fileName)
    }

    static fromBuffer(buffer: Buffer, mimetype?: string, fileName?: string) {
        return new BufferDocument(buffer, mimetype, fileName)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLDocument extends Document {
    url: string

    constructor(url: string, mimetype?: string, fileName?: string) {
        super(mimetype, fileName)
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { document: { url: this.url }, mimetype: this.mimetype }
    }

}

export class BufferDocument extends Document {
    buffer: Buffer

    constructor(buffer: Buffer, mimetype?: string, fileName?: string) {
        super(mimetype, fileName)
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { document: this.buffer, mimetype: this.mimetype, fileName: this.fileName }
    }

}