const { Router } = require("../dist")
const AuthMiddleware = require("./AuthMiddleware")
const BotController = require("./BotController")

const router = new Router()

router.keyword("Menu", [BotController, 'showMenu'])

router.menu("menu {menu}", [BotController, 'selectMenu'])

router.keyword("Option", [BotController, 'showOption'])

router.menu("option_{option}", [BotController, 'selectOption'])

router.keyword("My name is {firstName} {lastName}", [BotController, 'introduction'])

router.keyword("Ping {times} times", [BotController, 'pingManyTimes'])

router.middleware(AuthMiddleware).group(() => {
    router.keyword("Buy", [BotController, 'buy'])
})

router.middleware([AuthMiddleware, 'change settings']).group(() => {
    router.keyword("Change payment to (cash|transfer)", [BotController, 'changePayment'])
})

router.state("loggedIn").group(() => {
    router.keyword("View my balance", [BotController, 'viewBalance'])
})

module.exports = router