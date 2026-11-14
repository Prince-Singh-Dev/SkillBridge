const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const AI_TIMEOUT_MS = 90 * 1000
const PDF_TIMEOUT_MS = 60 * 1000


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

const resumePdfSchema = z.object({
    html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
})


function createHttpError(message, status) {
    const error = new Error(message)
    error.status = status
    return error
}

function parseStructuredResponse(text, schema, fallbackMessage) {
    let data

    try {
        data = JSON.parse(text)
    } catch {
        throw createHttpError(fallbackMessage, 502)
    }

    const result = schema.safeParse(data)

    if (!result.success) {
        throw createHttpError(fallbackMessage, 502)
    }

    return result.data
}

function withTimeout(promise, timeoutMs, message) {
    let timer

    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(createHttpError(message, 504)), timeoutMs)
    })

    return Promise.race([ promise, timeout ]).finally(() => clearTimeout(timer))
}


async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume || "No resume provided."}
                        Self Description: ${selfDescription || "No self description provided."}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(interviewReportSchema),
            httpOptions: {
                timeout: AI_TIMEOUT_MS,
                retryOptions: {
                    attempts: 1
                }
            }
        }
    })

    return parseStructuredResponse(
        response.text,
        interviewReportSchema,
        "The AI returned an invalid interview report. Please try again."
    )


}



async function generatePdfFromHtml(htmlContent) {
    let browser
    const startedAt = Date.now()

    try {
        const launchOptions = {
            headless: true,
            timeout: PDF_TIMEOUT_MS,
            args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" ]
        }

        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
        }

        browser = await puppeteer.launch(launchOptions)
        console.log(`[resume-pdf] browser ready in ${Date.now() - startedAt}ms`)

        const page = await browser.newPage()
        await page.setJavaScriptEnabled(false)
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: PDF_TIMEOUT_MS })
        console.log(`[resume-pdf] content loaded in ${Date.now() - startedAt}ms`)

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            waitForFonts: false,
            timeout: PDF_TIMEOUT_MS,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })
        console.log(`[resume-pdf] generated ${pdfBuffer.length} bytes in ${Date.now() - startedAt}ms`)

        return pdfBuffer
    } catch (err) {
        console.error(`[resume-pdf] failed after ${Date.now() - startedAt}ms:`, err.message)
        throw err
    } finally {
        if (browser) {
            await browser.close().catch(() => {})
        }
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume || "No resume provided."}
                        Self Description: ${selfDescription || "No self description provided."}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(resumePdfSchema),
            httpOptions: {
                timeout: AI_TIMEOUT_MS,
                retryOptions: {
                    attempts: 1
                }
            }
        }
    })


    const jsonContent = parseStructuredResponse(
        response.text,
        resumePdfSchema,
        "The AI returned an invalid resume. Please try again."
    )

    return withTimeout(
        generatePdfFromHtml(jsonContent.html),
        PDF_TIMEOUT_MS,
        "Resume PDF generation timed out. Please try again."
    )

}

module.exports = { generateInterviewReport, generateResumePdf }
