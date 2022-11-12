import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse } from "."
import { getBufferFromUrl } from "../../Utils"
import type { Readable } from 'stream'

export class Video extends MessageResponse {
    caption?: string
    thumbnail?: Buffer

    constructor(caption?: string, thumbnail?: string | Buffer) {
        super()
        this.caption = caption
        if (thumbnail) {
            if (thumbnail instanceof Buffer) {
                this.thumbnail = thumbnail
            } else {
                getBufferFromUrl(thumbnail!).then(buffer => {
                    this.thumbnail = buffer
                })
            }
        }
    }

    static fromURL(url: string, caption?: string, thumbnail?: string | Buffer) {
        return new URLVideo(url, caption, thumbnail)
    }

    static fromBuffer(buffer: Buffer, caption?: string, thumbnail?: string | Buffer) {
        return new BufferVideo(buffer, caption, thumbnail)
    }

    static fromStream(stream: Readable, caption?: string, thumbnail?: string | Buffer) {
        return new StreamVideo(stream, caption, thumbnail)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLVideo extends Video {
    url: string

    constructor(url: string, caption?: string, thumbnail?: string | Buffer) {
        super(caption, thumbnail)
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        // @ts-ignore
        return { video: { url: this.url }, caption: this.caption, jpegThumbnail: this.thumbnail }
    }

}

export class StreamVideo extends Video {
    stream: Readable

    constructor(stream: Readable, caption?: string, thumbnail?: string | Buffer) {
        super(caption, thumbnail)
        this.stream = stream
    }

    getMessageContent(): AnyMessageContent | undefined {
        // @ts-ignore
        return { video: { stream: this.stream }, caption: this.caption, jpegThumbnail: this.thumbnail }
    }

}

export class BufferVideo extends Video {
    buffer: Buffer

    constructor(buffer: Buffer, caption?: string, thumbnail?: string | Buffer) {
        super(caption, thumbnail)
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        // @ts-ignore
        return { video: this.buffer, caption: this.caption, jpegThumbnail: this.thumbnail }
    }

}