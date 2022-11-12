const Pepesan = require("../dist");
const router = require("./router");

(async () => {

    const config = {
        browserName: 'My first chat bot',
        sessionPath: './example/session',
        db: {
            path: './example/data.sqlite'
        }
    }

    const pepesan = Pepesan.init(router, config)
    await pepesan.connect()

})()