// src/profile/NotFound.jsx
//NotFound.jsx*

import styles from '../styles/pages/NotFound.module.css';

function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles['header-text']}>
                <strong>Kueski</strong> Link
            </div>
            <div className={`${styles.circle} ${styles.circle1}`}></div>
            <div className={`${styles.circle} ${styles.circle2}`}></div>
            <div className={`${styles.circle} ${styles.circle3}`}></div>
            <div className={`${styles.circle} ${styles.circle4}`}></div>
            <div className={`${styles.circle} ${styles.circle5}`}></div>
            <div className={`${styles.circle} ${styles.circle6}`}></div>
            <div className={`${styles.circle} ${styles.circle7}`}></div>
            <div className={`${styles.circle} ${styles.circle8}`}></div>
            <div className={styles['main-text']}>
                <h1>404</h1>
                <p>No se encontró la página</p>
            </div>
        </div>
    );
}

export default NotFound;