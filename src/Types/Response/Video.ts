import { AnyMessageContent } from "@whiskeysockets/baileys"
import { MessageResponse } from "."
import { getBufferFromUrl } from "../../Utils"
import type { Readable } from 'stream'

export class Video extends MessageResponse {
    caption?: string
    thumbnail?: Buffer
    gifPlayback?: boolean

    constructor(caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        super()
        this.caption = caption
        this.gifPlayback = gifPlayback ?? false
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

    static fromURL(url: string, caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        return new URLVideo(url, caption, thumbnail, gifPlayback)
    }

    static fromBuffer(buffer: Buffer, caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        return new BufferVideo(buffer, caption, thumbnail, gifPlayback)
    }

    static fromStream(stream: Readable, caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        return new StreamVideo(stream, caption, thumbnail, gifPlayback)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return
    }

}

export class URLVideo extends Video {
    url: string

    constructor(url: string, caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        super(caption, thumbnail, gifPlayback)
        this.url = url
    }

    getMessageContent(): AnyMessageContent | undefined {
        // @ts-ignore
        return { video: { url: this.url }, caption: this.caption, jpegThumbnail: this.thumbnail, gifPlayback: this.gifPlayback }
    }

}

export class StreamVideo extends Video {
    stream: Readable

    constructor(stream: Readable, caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        super(caption, thumbnail, gifPlayback)
        this.stream = stream
    }

    getMessageContent(): AnyMessageContent | undefined {
        // @ts-ignore
        return { video: { stream: this.stream }, caption: this.caption, jpegThumbnail: this.thumbnail, gifPlayback: this.gifPlayback }
    }

}

export class BufferVideo extends Video {
    buffer: Buffer

    constructor(buffer: Buffer, caption?: string, thumbnail?: string | Buffer, gifPlayback?: boolean) {
        super(caption, thumbnail, gifPlayback)
        this.buffer = buffer
    }

    getMessageContent(): AnyMessageContent | undefined {
        // @ts-ignore
        return { video: this.buffer, caption: this.caption, jpegThumbnail: this.thumbnail, gifPlayback: this.gifPlayback }
    }

}