const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")

const app = express()

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1)
}

app.use(helmet())
app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(null, false)
    },
    credentials: true
}))

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
