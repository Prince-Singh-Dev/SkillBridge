const {GoogleGenAI} = require("@google/genai")
const {z} = require("zod")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    matchScore : z.number().describe("The match score is a number between 0 and 100 that indicates how well the candidate's resume and self describe match the job describe."),
    technicalQuestions : z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intentions: z.string().describe("The intentions behind the technical question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("The technical questions are the questions that are asked to test the candidate's technical knowledge and skills."),
    behaviouralQuestions : z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        intentions: z.string().describe("The intentions behind the behavioral question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("The behavioral questions are the questions that are asked to understand the candidate's personality, attitude, and behavior in different situations."),
    skillGaps : z.array(z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z.enum(["low","medium","high"]).describe("The severity of the skill gap, whether it is low, medium, or high.")
    })).describe("The skill gaps are the skills that the candidate is lacking and needs to improve upon."),
    preparationPlan : z.array(z.object({
        day: z.number().describe("The day of the preparation plan"),
        focus: z.string().describe("The focus of the preparation plan for that day"),
        tasks: z.array(z.string()).describe("The tasks to be completed on that day")
    })).describe("The preparation plan is a day-wise plan that helps the candidate to prepare for the interview by focusing on the areas where they are lacking.")
})

async function generateInterviewReport({resume, selfDescription, jobDescription}){

    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}`

    const response = await ai.models.generateContent({
        model:"gemini-3-flash-preview",
        contents:prompt,
        config:{
            responseMimeType:"application/json",
            responseJsonSchema:z.toJSONSchema(interviewReportSchema)
        }
    })
    return JSON.parse(response.text)
}

module.exports = generateInterviewReport