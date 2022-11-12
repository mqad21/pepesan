import { proto } from "@adiwajshing/baileys"
import Pepesan, { Handler, MessageResponse } from "../dist"
import router from "../example/router"
import { MessageInfoTest } from "./types"

export const initTest = () => {
    Pepesan.init(router, {
        db: {
            path: "./example/data.sqlite"
        }
    })
}

export const generateMessageInfo = (messageInfoTest: MessageInfoTest): proto.IWebMessageInfo => {
    return {
        key: {
            remoteJid: messageInfoTest.jid,
            fromMe: false,
            id: '3EB0B717521388A64271',
            participant: undefined
        },
        pushName: messageInfoTest.name,
        messageTimestamp: 1667828687,
        message: {
            conversation: messageInfoTest.text,
        }
    } as proto.IWebMessageInfo
}

export const initHandler = async (messageInfo: proto.IWebMessageInfo, state?: string) => {
    const handler = new Handler({ router })
    await handler.setMessageInfo(messageInfo)
    handler["_state"] = state
    return handler
}

export const getMessageContents = (messageResponses: MessageResponse | MessageResponse[] | undefined) => {
    if (!messageResponses) return

    if (Array.isArray(messageResponses)) {
        return messageResponses.map((expectedReturn: MessageResponse) => expectedReturn.getMessageContent()!)
    }

    return messageResponses.getMessageContent()!
}