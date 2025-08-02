// src/hooks/useNotifications.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useNotifications(currentUser) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setNotifications(data);
    setLoading(false);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false); // Ya limitado por RLS
  };

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  return { notifications, loading };
}
