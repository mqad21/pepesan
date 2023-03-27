import { AnyMessageContent } from "@adiwajshing/baileys"

export abstract class MessageResponse {

  abstract getMessageContent(): AnyMessageContent | undefined

}

export * from "./Image"
export * from "./Text"
export * from "./Sticker"
export * from "./Audio"
export * from "./Video"
export * from "./List"
export * from "./Button"
export * from "./Menu"