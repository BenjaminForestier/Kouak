import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Users() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/users')
                setUsers(data)
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur de chargement')
            }
        })()
    }, [])

    return (
        <div className='users-page'>
            <div className="card">
                <div className="row between">
                    <h1>Utilisateurs</h1>
                    <button onClick={logout}>Se déconnecter</button>
                </div>

                {error && <div className="alert">{error}</div>}

                <ul className="list">
                    {users.map(u => (
                        <li key={u.id}>
                            <strong>{u.username}</strong> - {u.email}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}