const { Controller, Response } = require("../dist")

module.exports = class BotController extends Controller {

    introduction(request, firstName, lastName) {
        return `Hello ${firstName} ${lastName}`
    }

    pingManyTimes(request, times) {
        return Array(Number(times)).fill(Response.text.fromString("Ping"))
    }

    buy(request) {
        return Response.text.fromString(`Hello ${request.name}! What do you want to buy?`)
    }

    async changePayment() {
        await this.delay(2000)
        return Response.text.fromString("Your payment method has changed")
    }

    viewBalance() {
        return Response.text.fromString("Your balance is IDR 100,000")
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    showMenu(request) {
        return Response.menu.fromArrayOfString(request.jid, ["menu 1", "menu 2", "menu 3"])
    }

    selectMenu(request, menu) {
        return `You selected menu ${menu}`
    }

    showOption(request) {
        return Response.menu.fromArrayOfObject(request.jid, [
            {text: "Option 1", value: "option_1"},
            {text: "Option 2", value: "option_2"},
            {text: "Option 3", value: "option_3"},
        ], "Select an option")
    }

    selectOption(request, option) {
        return `You selected option ${option}`
    }

}