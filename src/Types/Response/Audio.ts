import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."

export class Audio extends MessageResponse {

    static fromURL(url: string) {
        return new URLAudio(url)
    }

    static fromBuffer(buffer: Buffer) {
        return new BufferAudio(buffer)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLAudio extends Audio {
    url: string

    constructor(url: string) {
        super()
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { audio: { url: this.url }, mimetype: 'audio/mp4' }
    }

}

export class BufferAudio extends Audio {
    buffer: Buffer

    constructor(buffer: Buffer) {
        super()
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { audio: this.buffer, mimetype: 'audio/mp4' }
    }

}