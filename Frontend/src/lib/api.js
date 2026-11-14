import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
    timeout: 30000
})

const pendingRequests = new Map()

export function dedupeRequest(key, request) {
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key)
    }

    const promise = request().finally(() => {
        pendingRequests.delete(key)
    })

    pendingRequests.set(key, promise)

    return promise
}

export default api
