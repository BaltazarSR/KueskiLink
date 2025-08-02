//src/components/SessionInfo.jsx
import { useUser } from '../context/UserContext'

function SessionInfo() {
  const { user, profile, loading, logout } = useUser()

  if (loading) return <p>Cargando sesión...</p>

  if (!user) return <p>No has iniciado sesión.</p>

  return (
    <div>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Nombre:</strong> {profile?.name}</p>
      <p><strong>Rol:</strong> {profile?.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}

export default SessionInfo
