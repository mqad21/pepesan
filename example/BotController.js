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

    async showMenu(request) {
        await this.reply(Response.menu.fromArrayOfString(["menu 1", "menu 2", "menu 3"]))
        return Response.menu.fromArrayOfString(["menu 4", "menu 5"])
    }

    selectMenu(request, menu) {
        return `You selected menu ${menu}`
    }

    showOption(request) {
        return Response.menu.fromArrayOfObject([
            { text: "Option 1", value: "option_1" },
            { text: "Option 2", value: "option_2" },
            { text: "Option 3", value: "option_3" },
        ], "Select an option", "Type *{number}*: for *{menu}*")
    }

    selectOption(request, option) {
        return `You selected option ${option}`
    }

    async login(request) {
        await this.setState("login")
        return Response.text.fromString("You are logged in")
    }

    async logout(request) {
        await this.deleteState()
        return Response.text.fromString("You are logged out")
    }

}