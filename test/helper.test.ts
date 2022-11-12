import { describe, expect, it } from "@jest/globals"
import { getParamsName, isTextMatch, parseJid } from "../src"

type HelperTest = {
    helper: Function
    param: any[]
    expectedOutput: any
}

const helperTests: HelperTest[] = [
    {
        helper: parseJid,
        param: ["081234567890"],
        expectedOutput: "6281234567890@s.whatsapp.net"
    },
    {
        helper: parseJid,
        param: ["+6281234567890"],
        expectedOutput: "6281234567890@s.whatsapp.net"
    },
    {
        helper: parseJid,
        param: ["6281234567890"],
        expectedOutput: "6281234567890@s.whatsapp.net"
    },
    {
        helper: isTextMatch,
        param: ["extract files.rar", "extract (file|files).(zip|rar|7z)"],
        expectedOutput: true
    },
    {
        helper: isTextMatch,
        param: ["extract file.7z", "extract (file|files).(zip|rar|7z)"],
        expectedOutput: true
    },
    {
        helper: isTextMatch,
        param: ["extract file1.zip", "extract (file|files).(zip|rar|7z)"],
        expectedOutput: false
    },
    {
        helper: isTextMatch,
        param: ["send file immediately now", "(send|receive) {param1} * {param2}"],
        expectedOutput: true
    },
    {
        helper: isTextMatch,
        param: ["receive file rar immediately now", "(send|receive) {param1} * {param2}"],
        expectedOutput: true
    },
    {
        helper: isTextMatch,
        param: ["receive file now", "(send|receive) {param1} * {param2}"],
        expectedOutput: false
    },
    {
        helper: getParamsName,
        param: [(file, extension, count) => { }],
        expectedOutput: ["file", "extension", "count"]
    },
    {
        helper: getParamsName,
        param: [() => { }],
        expectedOutput: []
    },
    {
        helper: getParamsName,
        param: [(file, extension = "zip") => { }],
        expectedOutput: ["file", "extension"]
    },
]

describe.each(helperTests)("\nRun $helper", (helperTest: HelperTest) => {
    it(`with param ${helperTest.param}, then output should be ${helperTest.expectedOutput}`, () => {
        expect(helperTest.helper(...helperTest.param)).toEqual(helperTest.expectedOutput)
    })
})