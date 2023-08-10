import { AnyMessageContent } from "@whiskeysockets/baileys"
import { MessageResponse } from "."

export class Audio extends MessageResponse {

    ptt?: boolean

    constructor(ptt?: boolean) {
        super()
        this.ptt = ptt ?? false
    }

    static fromURL(url: string, ptt?: boolean) {
        return new URLAudio(url, ptt)
    }

    static fromBuffer(buffer: Buffer, ptt?: boolean) {
        return new BufferAudio(buffer, ptt)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLAudio extends Audio {
    url: string

    constructor(url: string, ptt?: boolean) {
        super(ptt)
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { audio: { url: this.url }, mimetype: 'audio/mp4' }
    }

}

export class BufferAudio extends Audio {
    buffer: Buffer

    constructor(buffer: Buffer, ptt?: boolean) {
        super(ptt)
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { audio: this.buffer, mimetype: 'audio/mp4', ptt: this.ptt }
    }

}