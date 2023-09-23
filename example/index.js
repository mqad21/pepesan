const Pepesan = require("../dist");
const router = require("./router");

(async () => {

    const config = {
        browserName: 'My first chat bot',
        sessionPath: './example/session',
        allowedNumbers: ['6281260743660'],
        db: {
            path: './example/data.sqlite',
        },
        server: {
            authKey: '123456',
        },
        maxRetries: 1,
        menuTemplate: "Ketik *{number}* -> *{menu}*",
        menuHeader: "===== Pilihan Menu =====",
        stateType: 'file',
        statePath: './example/state',
    }

    const pepesan = Pepesan.init(router, config)
    await pepesan.connect()

    // Get response from external request
    const response = await pepesan.execute({ jid: "6281260763660@s.whatsapp.net", text: "Login" })
    console.log("response", response)

})()