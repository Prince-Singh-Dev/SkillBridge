const { z } = require("zod")

const interviewReportSchema = z.object({
    jobDescription: z.string().trim().min(20, "Job description must be at least 20 characters.").max(5000, "Job description must be at most 5000 characters."),
    selfDescription: z.string().trim().max(2000, "Self description must be at most 2000 characters.").optional().default("")
})

function validateInterviewPayload(req, res, next) {
    const result = interviewReportSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            message: result.error.issues[ 0 ]?.message || "Invalid request data.",
            errors: result.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        })
    }

    if (!req.file && !result.data.selfDescription) {
        return res.status(400).json({
            message: "Please upload a resume or provide a self description."
        })
    }

    req.body = result.data
    next()
}

module.exports = { validateInterviewPayload }
