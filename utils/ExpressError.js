class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); //Call the Error Constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;