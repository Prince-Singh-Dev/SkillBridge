import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return data
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        let isActive = true

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (isActive) setUser(data.user)
            } catch {
                if (isActive) setUser(null)
            } finally {
                if (isActive) setLoading(false)
            }
        }

        getAndSetUser()

        return () => {
            isActive = false
        }

    }, [ setLoading, setUser ])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
