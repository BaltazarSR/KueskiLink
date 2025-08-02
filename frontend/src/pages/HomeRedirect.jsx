//src/pages/HomeRedirect.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function HomeRedirect() {
  const { user, profile, loading } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user || !profile) {
      navigate('/login')
      return
    }

    switch (profile.role) {
      case 'owner':
        navigate('/admin')
        break
      case 'employee':
        navigate('/employee')
        break
      case 'client':
        navigate('/client')
        break
      default:
        navigate('/login')
    }
  }, [user, profile, loading, navigate])

  return null 
}

export default HomeRedirect
