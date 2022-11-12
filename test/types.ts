import { AnyMessageContent } from "@adiwajshing/baileys"
import { MessageResponse, Response } from "../dist"
import { getMessageContents } from "./utils"

interface IRouterTest {
    message: MessageInfoTest
    state?: string
    expectedText?: string | string[],
}

export class RouterTest implements IRouterTest {
    message: MessageInfoTest
    expectedText?: string | string[]
    state?: string
    number?: string
    userMessage?: string

    constructor(routerTest: IRouterTest) {
        this.message = routerTest.message
        this.state = routerTest.state
        if (!this.message.jid) this.message.jid = "6281234567890@s.whatsapp.net"
        this.expectedText = routerTest.expectedText
        this.initNumber()
        this.initUserMessage()
    }

    private initUserMessage() {
        this.userMessage = `User ${this.number}${this.state ? ` with state ${this.state}` : ''} send: ${this.message.text}`
    }

    private initNumber() {
        this.number = this.message?.jid?.split("@s.whatsapp.net")[0]
    }

    get isBotReply(): boolean {
        return this.expectedReturn !== undefined
    }

    get botShouldReply(): string {
        return this.getBotShouldReply(this.expectedReturn)
    }

    getBotShouldReply(returnValue: MessageResponse | MessageResponse[] | undefined) {
        return returnValue ? 'Bot should reply' : 'Bot should not reply'
    }

    get botReply(): string {
        return `Reply message: ${this.expectedText}`
    }

    get expectedReturn(): MessageResponse | MessageResponse[] | undefined {
        if (!this.expectedText) return

        if (Array.isArray(this.expectedText)) {
            return this.expectedText.map((expectedText: string) => Response.text.fromString(expectedText))
        }

        return Response.text.fromString(this.expectedText)
    }

    get messageContent(): AnyMessageContent | AnyMessageContent[] | undefined {
        return getMessageContents(this.expectedReturn)
    }

}

export type MessageInfoTest = {
    jid?: string
    text: string
    name?: string
}
