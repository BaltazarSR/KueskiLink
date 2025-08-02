// src/components/Navbar.jsx
import styles from '../styles/components/Navbar.module.css';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('read', false);
      if (!error && count > 0) {
        setHasUnread(true);
      }
    };
    checkUnread();
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleOptionsClick = () => {
    navigate('/options');
  };

  return (
    <nav className={styles.navbar}>
      <button className={styles.navbarBtn} onClick={handleOptionsClick}>
        <div className={styles.menuIconWrapper}>
          <FaBars size={20} />
          {hasUnread && <span className={styles.notificationDot}></span>}
        </div>
      </button>

      <h1 className={styles.logo}>
        <span>Kueski</span> Link
      </h1>

      <button className={styles.navbarBtn} onClick={handleProfileClick}>
        <div className={styles.profileIconWrapper}>
          <FaUserCircle size={24} />
        </div>
      </button>
    </nav>
  );
}

export default Navbar;
