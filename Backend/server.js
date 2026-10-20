require("dotenv").config() // method to load environment variables from .env file
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const {resume,selfDescription,jobDescription} = require("./src/services/temp")
const generateInterviewReport = require("./src/services/ai.service")


connectToDB()
generateInterviewReport({resume,selfDescription,jobDescription}).catch(console.error)

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})

