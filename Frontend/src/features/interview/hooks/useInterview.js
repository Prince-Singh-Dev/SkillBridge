import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || error?.message || fallback
}


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports, error, setError } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError(null)

        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            setError(getErrorMessage(err, "Failed to generate interview report."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        setError(null)

        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load interview report."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load interview reports."))
            return null
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        setError(null)

        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
        } catch (err) {
            setError(getErrorMessage(err, "Failed to download resume PDF."))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        let isActive = true

        const loadInterviewData = async () => {
            setLoading(true)
            setError(null)

            try {
                if (interviewId) {
                    const response = await getInterviewReportById(interviewId)
                    if (isActive) setReport(response.interviewReport)
                } else {
                    const response = await getAllInterviewReports()
                    if (isActive) setReports(response.interviewReports)
                }
            } catch (err) {
                if (isActive) {
                    setError(getErrorMessage(
                        err,
                        interviewId ? "Failed to load interview report." : "Failed to load interview reports."
                    ))
                }
            } finally {
                if (isActive) setLoading(false)
            }
        }

        loadInterviewData()

        return () => {
            isActive = false
        }

    }, [ interviewId, setLoading, setError, setReport, setReports ])

    return { loading, report, reports, error, generateReport, getReportById, getReports, getResumePdf }

}
