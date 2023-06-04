const { Response } = require("../dist")

module.exports = async (request, next, action) => {

    const isLogin = await request.state == "login"
    if (!isLogin) {
        let errorMessage = "You are not allowed"
        if (action) errorMessage += ` to ${action}`
        return Response.text.fromString(errorMessage)
    }

    return next()

}