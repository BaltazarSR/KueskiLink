// src/layouts/SubpageLayout.jsx
import BackHeader from '../components/BackHeader'

function SubpageLayout({ children, title, fallbackPath = '/' }) {
  return (
    <>
      {/* ahora sí le pasamos el fallback */}
      <BackHeader title={title} fallbackPath={fallbackPath} />
      <main style={{ padding: '1.25rem' }}>
        {children}
      </main>
    </>
  )
}

export default SubpageLayout
