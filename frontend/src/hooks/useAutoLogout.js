//src/hooks/useAutoLogout.js
import { useEffect } from 'react'

const INACTIVITY_TIMEOUT = 10*60*1000 // 10 minutos

export function useAutoLogout(logout, showSessionExpired) {
  useEffect(() => {
    let timeoutId

    const handleInactivity = () => {
      logout()
      showSessionExpired()
    }

    const resetTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleInactivity, INACTIVITY_TIMEOUT)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll']
    events.forEach((event) => window.addEventListener(event, resetTimer))

    resetTimer()

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer))
      clearTimeout(timeoutId)
    }
  }, [logout, showSessionExpired])
}
