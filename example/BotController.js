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

}