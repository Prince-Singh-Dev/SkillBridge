// Use of app.js : 
// To initiate the server, usage of middlewares, routes and api's created by us

const express = require('express')
const app = express()
app.use(express.json())
module.exports = app