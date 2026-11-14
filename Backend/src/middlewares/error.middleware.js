function notFoundHandler(req, res) {
    res.status(404).json({
        message: "Route not found."
    })
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON payload."
        })
    }

    if (err.name === "ZodError") {
        return res.status(400).json({
            message: err.issues[ 0 ]?.message || "Invalid request data.",
            errors: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        })
    }

    if (err.name === "MulterError") {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 5MB."
            : err.message

        return res.status(400).json({ message })
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: Object.values(err.errors)[ 0 ]?.message || "Validation failed."
        })
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid identifier."
        })
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[ 0 ] || "field"
        return res.status(409).json({
            message: `${field} already exists.`
        })
    }

    if (err.status && err.status < 500) {
        return res.status(err.status).json({
            message: err.message
        })
    }

    if (err.status === 502 || err.status === 504) {
        return res.status(err.status).json({
            message: err.message
        })
    }

    console.error(err)

    return res.status(500).json({
        message: "Internal server error."
    })
}

module.exports = { notFoundHandler, errorHandler }
