import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Users from './pages/Users'
import Chat from './pages/Chat';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="container">
      <nav className="nav">
        <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
          Connexion
        </NavLink>
        <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
          Inscription
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
          Utilisateurs
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => (isActive ? "active" : "")}>
          Chat
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </div>
  )
}