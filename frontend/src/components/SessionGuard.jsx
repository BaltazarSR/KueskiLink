//src/components/SessionGuard.jsx
import { useUser } from '../context/UserContext'
import kueskiPayLogo from '../assets/kueski-pay.svg'

function SessionGuard({ children }) {
  const { loading } = useUser()

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        paddingTop: '5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <img
          src={kueskiPayLogo}
          alt="Kueski Pay"
          style={{ width: '120px', marginBottom: '1rem' }}
        />
        <p style={{ fontSize: '1.1rem', color: '#555' }}>Cargando sesión...</p>
      </div>
    )
  }

  return children
}

export default SessionGuard
