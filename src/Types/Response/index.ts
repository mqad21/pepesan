  import { AnyMessageContent } from "@whiskeysockets/baileys"

export abstract class MessageResponse {

  public clientId: string = ""

  abstract getMessageContent(): AnyMessageContent | undefined

}

export * from "./Image"
export * from "./Text"
export * from "./Sticker"
export * from "./Audio"
export * from "./Video"
export * from "./List"
export * from "./Button"
export * from "./Document"
export * as MenuResponse from "./Menu"