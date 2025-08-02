// src/components/BackHeader.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import styles from '../styles/components/BackHeader.module.css'


function BackHeader({ title, fallbackPath = '/' }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleBack = () => {
    console.log('--- BackHeader.handleBack ---')
    console.log(' current location:', pathname)
    console.log(' fallbackPath:', fallbackPath)
    // 1) Si estamos en una "sección raíz", vamos directo al fallback
    const rootPatterns = [
      /^\/employees$/,
      /^\/employee-info/,
      /^\/invitation-info/,
      /^\/options/,
      /^\/send-invitation/,
      /^\/products$/,
      /^\/product-info/,
      /^\/send-link/,
    ]
    if (rootPatterns.some((rx) => rx.test(pathname))) {
      console.log(' → root page, navigate to fallback')
      navigate(fallbackPath, { replace: true })
      return
    }

    // 2) Si no tenemos suficiente historial, fallback
    if (window.history.length <= 2) {
      console.log(' → short history, navigate to fallback')
      navigate(fallbackPath, { replace: true })
      return
    }

    // 3) en cualquier otro caso, navegamos -1
    console.log(' → navigate(-1)')
    navigate(-1)
  }

  return (
    <header className={styles.header}>
      <button
        className={styles.backButton}
        onClick={handleBack}
        aria-label="Go back"
      >
        <FaArrowLeft size={20} />
      </button>
      <h1 className={styles.title}>
        <span className={styles.kueski}>Kueski</span>{' '}
        <span className={styles.link}>Link</span>
      </h1>
    </header>
  )
}

export default BackHeader
