//src/layouts/AuthenticatedLayout.jsx
import Navbar from '../components/Navbar'

function AuthenticatedLayout({ children }) {
  const handleMenuClick = () => {
  }

  const handleProfileClick = () => {
  }

  return (
    <>
      <Navbar onMenuClick={handleMenuClick} onProfileClick={handleProfileClick} />
      <main style={{ padding: '1.25rem', backgroundColor: '#FFFAFAf0' }}>
        {children}
      </main>
    </>
  )
}

export default AuthenticatedLayout
