const { Response } = require("../dist")

module.exports = (request, next, action) => {

    if (request.number !== "6281234567890") {
        let errorMessage = "You are not allowed"
        if (action) errorMessage += ` to ${action}`
        return Response.text.fromString(errorMessage)
    }

    return next()

}