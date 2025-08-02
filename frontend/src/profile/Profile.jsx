// src/pages/Profile.jsx
import { useUser } from '../context/UserContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import styles from '../styles/profile/Profile.module.css'
import SubpageLayout from '../layouts/SubpageLayout'

// Assets…
import person from '../assets/person.svg'
import gear from '../assets/gear.svg'
import warning from '../assets/warning.svg'
import danger from '../assets/danger.svg'
import buttonIcon from '../assets/chevron-right-option.svg'

function ProfileItem({ icon, title, description, path }) {
  const navigate = useNavigate()
  return (
    <div className={styles.item}>
      <div className={styles['item-icon']}><img src={icon} alt={title} /></div>
      <div className={styles['item-text']}>
        <h2 className={styles.title}>{title}</h2>
        <p>{description}</p>
      </div>
      <div className={styles['item-button']}>
        <button onClick={() => navigate(path)}>
          <img src={buttonIcon} alt="Abrir" />
        </button>
      </div>
    </div>
  )
}

function Profile() {
  const { profile, logout } = useUser()
  const navigate = useNavigate()
  const { search, pathname } = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(search)
    const updated = params.get('updated')
    if (updated) {
      let message = 'Perfil actualizado correctamente.'
      if (updated === 'business') {
        message = 'Negocio actualizado correctamente.'
      } else if (updated === 'password') {
        message = 'Contraseña actualizada correctamente.'
      }
      toast.success(message)
      // limpio la query para que no se repita
      navigate(pathname, { replace: true })
    }
  }, []); // sólo al primer montaje

  const items = [
    { icon: person,  title: 'Editar perfil',   description: 'Edita tu correo, teléfono y más', path: '/edit-profile' },
    ...(profile?.isOwner
      ? [{ icon: gear, title: 'Editar negocio', description: 'Cambia nombre o logo',      path: '/edit-business' }]
      : []),
    { icon: warning, title: 'Seguridad',       description: 'Cambia tu contraseña',         path: '/edit-password' },
    ...(profile?.isOwner
      ? [{ icon: danger, title: 'Zona de peligro', description: 'Da de baja tu cuenta',      path: '/disable-account' }]
      : []),
  ]

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (!profile) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando perfil...</p>
  }

  return (
    <SubpageLayout>
      <div className={styles['profile-container']}>
        <div className={styles['profile-info']}>
          <div className={styles['name-container']}>
            <div className={styles['n-title']}>Nombre:</div>
            <div className={styles['n-text']}>{profile.name}</div>
          </div>
          <div className={styles['business-container']}>
            <div className={styles['n-title']}>Negocio:</div>
            <div className={styles['n-text']}>{profile.company?.name || 'Sin nombre'}</div>
          </div>
        </div>
        <section>
          {items.map((item, i) => <ProfileItem key={i} {...item} />)}
        </section>
        <div className={styles['background-add-button']}>
          <button onClick={handleLogout} className={styles['logout-button']}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </SubpageLayout>
  )
}

export default Profile
