import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        try {
            await api.post('/auth/register', { username, email, password })
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.message || "Erreur à l'inscription")
        }
    }

    return (
        <div className='register-page'>
            <div className="card">
                <h1>Inscription</h1>
                {error && <div className="alert">{error}</div>}

                <form onSubmit={onSubmit}>
                    <label>Nom d'utilisateur</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} required />

                    <label>Email</label>
                    <input type="email" value={email}
                        onChange={e => setEmail(e.target.value)} required />

                    <label>Mot de passe</label>
                    <input type="password" value={password}
                        onChange={e => setPassword(e.target.value)} required />

                    <button type="submit">Créer le compte</button>
                </form>

                <p className="muted">
                    Déjà inscrit ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}