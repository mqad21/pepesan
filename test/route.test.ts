import { AnyMessageContent } from "@whiskeysockets/baileys"
import { beforeAll, describe, expect, test } from "@jest/globals"
import { Handler, MessageResponse } from "../dist"
import { RouterTest } from "./types"
import { generateMessageInfo, initHandler, initTest } from "./utils"

const routerTests: RouterTest[] = [
    new RouterTest(
        {
            message: {
                text: 'My name is Muhammad Qadri'
            },
            expectedText: 'Hello Muhammad Qadri'
        }
    ),
    new RouterTest(
        {
            message: {
                text: 'My name is Muhammad'
            },
            expectedText: undefined
        }
    ),
    new RouterTest(
        {
            message: {
                text: 'Ping 3 times'
            },
            expectedText: ['Ping', 'Ping', 'Ping']
        }
    ),
    new RouterTest(
        {
            message: {
                jid: '6289876543210@s.whatsapp.net',
                text: 'Buy'
            },
            expectedText: 'You are not allowed'
        }
    ),
    new RouterTest(
        {
            message: {
                jid: '6289876543210@s.whatsapp.net',
                text: 'Change payment to cash',
            },
            expectedText: 'You are not allowed to change settings'
        }
    ),
    new RouterTest(
        {
            message: {
                jid: '6281234567890@s.whatsapp.net',
                text: 'Random words',
            },
            expectedText: undefined
        }
    ),
    new RouterTest(
        {
            message: {
                text: 'View my balance',
                jid: '6281234567890@s.whatsapp.net',
            },
            state: "loggedIn",
            expectedText: "Your balance is IDR 100,000"
        }
    ),
    new RouterTest(
        {
            message: {
                text: 'View my balance',
                jid: '6281234567890@s.whatsapp.net',
            },
            expectedText: undefined
        }
    ),
]

beforeAll(() => {
    initTest()
})

describe.each(routerTests)('\n$userMessage', (routerTest: RouterTest) => {

    const messageInfo = generateMessageInfo(routerTest.message)
    let handler: Handler
    let returnValue: MessageResponse
    let returnContent: AnyMessageContent | AnyMessageContent[] | undefined

    beforeAll(async () => {
        handler = await initHandler("test-client", messageInfo, routerTest.state)
        returnValue = await handler["getReturnValue"]() as MessageResponse
        returnContent = handler["getMessageContent"](returnValue) as AnyMessageContent[]
        if (returnContent?.length == 1) returnContent = returnContent[0]
    })

    test(routerTest.botShouldReply, async () => {
        expect(routerTest.getBotShouldReply(returnValue)).toEqual(routerTest.botShouldReply)
    })

    if (routerTest.isBotReply) {
        test(routerTest.botReply, async () => {
            const expectedContent = routerTest.messageContent
            expect(returnContent).toStrictEqual(expectedContent)
        })
    }

})