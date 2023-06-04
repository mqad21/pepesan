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
        menuTemplate: "Ketik *{number}* -> *{menu}*",
        menuHeader: "===== Pilihan Menu =====",
        stateType: 'file',
        statePath: './example/state',
    }
    
    const pepesan = Pepesan.init(router, config)
    await pepesan.connect()

})()