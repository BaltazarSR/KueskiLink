// src/layouts/PublicLayout.jsx
import styles from '../styles/components/BackHeader.module.css';

function PublicLayout({ children }) {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.kueski}>Kueski</span>{' '}
          <span className={styles.link}>Link</span>
        </h1>
      </header>
      <main style={{ padding: '1.25rem' }}>
        {children}
      </main>
    </>
  );
}

export default PublicLayout;
