import { isJidGroup, isJidUser, proto } from '@adiwajshing/baileys'
import axios from 'axios'
import StringExtractor from './StringExtractor'

export const parseJid = (number: string) => {

    if (isJidGroup(number) || isJidUser(number)) return number

    const firstNumber = number.substring(0, 1)
    if (firstNumber == "0") {
        number = "62" + number.substring(1)
    } else if (firstNumber == "+") {
        number = number.substring(1)
    }
    return number + "@s.whatsapp.net"
}

export const parseNumber = (jid: string) => {
    return jid.split("@s.whatsapp.net")[0]
}

export const getTextFromMessage = (message?: proto.IMessage): string => {
    let text
    if (message?.conversation) {
        text = message?.conversation
    }
    if (message?.buttonsResponseMessage) {
        text = message?.buttonsResponseMessage?.selectedDisplayText
    }
    if (message?.listResponseMessage) {
        text = message?.listResponseMessage?.title
    }
    if (message?.extendedTextMessage) {
        text = message?.extendedTextMessage?.text
    }
    if (message?.imageMessage) {
        text = message?.imageMessage?.caption
    }
    if (message?.videoMessage) {
        text = message?.videoMessage?.caption ?? undefined
    }
    return text?.replace("*", "") ?? ""
}

export const findAsyncSequential = async <T>(
    array: T[],
    predicate: (t: T) => Promise<boolean | T>,
): Promise<T | undefined> => {
    for (let t of array) {
        const r = await predicate(t)
        if (typeof r === 'boolean') {
            if (r === true) {
                return t
            }
        } else {
            return r
        }
    }
    return undefined
}

export const filterAsync = async<T>(
    array: T[] | undefined,
    predicate: (t: T) => Promise<boolean>,
): Promise<T[]> => {
    if (!array) return []
    const data = Array.from(array)
    return Promise.all(data.map((element) => predicate(element)))
        .then(result => {
            return data.filter((element, index) => {
                return result[index]
            })
        })
}

export const isTextMatch = (text?: string, comparison?: string) => {

    if (text == undefined || comparison == undefined) return false

    if (comparison === '*') return true

    let regex: RegExp | undefined
    if (regex = getValidRegex(comparison)) {
        return regex.test(text)
    }
    const params = StringExtractor(comparison, { ignoreCase: true })(text)
    if (Object.keys(params).length) {
        return true
    }
    if (params === true) {
        return true
    }

    return comparison.toLowerCase() === text.toLowerCase()
}

export const getValidRegex = (text: string) => {
    try {
        const match = text.match(/^([/~@%#'])(.*?)\1([gimsuy]*)$/)
        return match ? new RegExp(match[2], match[3])
            : undefined
    } catch (e) {
        return
    }
}

export const getObjectType = (obj: any, deep: number = 0): string | undefined => {
    try {
        for (let i = 0; i < deep; i++) {
            obj = Object.getPrototypeOf(obj!)
        }
        return Object.getPrototypeOf(obj!)?.constructor?.name
    } catch {
        return
    }
}

export const getAllSubclasses = (baseClass: any) => {
    const globalObject = Function('return this')()
    const allVars = Object.keys(globalObject)
    const classes = allVars.filter(function (key) {
        try {
            const obj = globalObject[key]
            return obj.prototype instanceof baseClass
        } catch (e) {
            return false
        }
    })
    return classes
}

export const getBufferFromUrl = async (url: string): Promise<Buffer> => {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
}

export const getBase64FromUrl = async (url: string): Promise<string> => {
    return (await getBufferFromUrl(url)).toString('base64')
}

export const getParamsName = (fun: Function): string[] => {
    const stripComments = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg
    const argumentNames = /([^\s,]+)/g
    const fnStr = fun.toString().replace(stripComments, '')
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(argumentNames) ?? []
    return result
}

export const formatString = (text: string, params: any) => {
    return text.replace(/\{([^}]+)\}/g, function (i, match) {
        return params[match]
    })
}