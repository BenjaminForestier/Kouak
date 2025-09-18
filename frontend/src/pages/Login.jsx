import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            const { data } = await api.post('/auth/login', { email, password })
            localStorage.setItem('token', data.token);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("username", data.username);
            navigate('/chat')
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion')
        }
    }

    return (
        <div className="connexion-page">
            <div className="card">
                <h1>Connexion</h1>
                {error && <div className="alert">{error}</div>}

                <form onSubmit={onSubmit}>
                    <label>Email</label>
                    <input type="email" value={email}
                        onChange={e => setEmail(e.target.value)} required />

                    <label>Mot de passe</label>
                    <input type="password" value={password}
                        onChange={e => setPassword(e.target.value)} required />

                    <button type="submit">Se connecter</button>
                </form>

                <p className="muted">
                    Pas de compte ? <Link to="/register"><u>Créer un compte</u></Link>
                </p>
            </div>
        </div>
    )
}