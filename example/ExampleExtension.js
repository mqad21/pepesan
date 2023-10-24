const { default: Extension } = require("../dist/Structures/Extension")

module.exports = class ExampleExtension extends Extension {
    title

    constructor() {
        super()
    }

    static init(title) {
        const extension = new this()
        extension.title = title
        return extension
    }

    setRouter(router) {
        router.keyword("extension", () => {
            return this.pepesan.clientIds[0]
        })
    }

}