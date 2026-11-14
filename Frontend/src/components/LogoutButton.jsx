import { useNavigate } from "react-router"
import { useAuth } from "../features/auth/hooks/useAuth"
import "./logout-button.scss"


const LogoutButton = () => {

    const { user, loading, handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout().catch(() => null)
        navigate("/login")
    }

    return (
        <div className="logout-button">
            {user && <span className="logout-button__user">{user.username}</span>}
            <button className="button primary-button" onClick={onLogout} disabled={loading}>
                Logout
            </button>
        </div>
    )
}

export default LogoutButton
