const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware.js")
const interviewController = require("../controllers/interview.controller.js")
const upload = require("../middlewares/file.middleware.js")

const interviewRouter = express.Router()

/**
 *  @route POST /api/interview/
 * @description This route is used to generate an interview report for a candidate based on their resume, self description and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController)

module.exports = interviewRouter