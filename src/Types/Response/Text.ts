import { AnyMessageContent } from "@whiskeysockets/baileys"
import { MessageResponse } from "."

export class Text extends MessageResponse {
    content: string

    constructor(content: string) {
        super()
        this.content = content
    }

    static fromString(content: string) {
        return new StringText(content)
    }

    getMessageContent(): AnyMessageContent | undefined {
        return { text: this.content }
    }
}

export class StringText extends Text {

    constructor(content: string) {
        super(content)
    }

}