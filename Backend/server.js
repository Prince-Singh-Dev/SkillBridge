require("dotenv").config() // method to load environment variables from .env file
const app = require("./src/app")
app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})