// src/menu/Employees.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import SubpageLayout from '../layouts/SubpageLayout';
import { supabase } from '../lib/supabase';
import { FaUserCircle } from 'react-icons/fa';
import { FaBoxOpen, FaTools, FaQuestionCircle } from 'react-icons/fa';
import styles from '../styles/menu/Employees.module.css';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [readyToRender, setReadyToRender] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      const {
        fromEmployeeDeleted,
        fromEmployeeError,
        fromInvitationCancelled,
        fromInvitationError
      } = location.state || {};

      if (fromEmployeeDeleted) {
        toast.success('Empleado eliminado correctamente.');
      }
      if (fromEmployeeError) {
        toast.error('Empleado no encontrado.');
      }
      if (fromInvitationCancelled) {
        toast.success('Invitación cancelada correctamente.');
      }
      if (fromInvitationError) {
        toast.error('Invitación no encontrada.');
      }

      if (
        fromEmployeeDeleted ||
        fromEmployeeError ||
        fromInvitationCancelled ||
        fromInvitationError
      ) {
        // limpiar el state para no repetir
        navigate(location.pathname, { replace: true, state: {} });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setReadyToRender(false);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const userId = session?.user?.id;
      if (!userId) return;

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();
      if (!userData) return;

      const [employeeRes, inviteRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, phone, active, created_at')
          .eq('company_id', userData.company_id)
          .eq('role', 'employee'),
        supabase
          .from('employee_invitations')
          .select('id, name, email, created_at')
          .eq('company_id', userData.company_id)
          .eq('used', false),
      ]);

      const employees = employeeRes.data || [];
      const invites = (inviteRes.data || []).map(inv => ({
        id: inv.id,
        name: inv.name || 'Invitación sin nombre',
        email: inv.email,
        phone: '',
        created_at: inv.created_at,
        active: false,
        isPending: true,
      }));

      setEmployees([...employees, ...invites]);
      setLoading(false);
      setReadyToRender(true);
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filteredData = employees
      .filter(emp =>
        (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });

    setFiltered(filteredData);
  }, [search, sortBy, employees]);

  const getIconByType = (type) => {
    switch (type) {
      case 'Producto':
        return <FaBoxOpen size={28} color="#3366FF" />;
      case 'Servicio':
        return <FaTools size={28} color="#28a745" />;
      default:
        return <FaQuestionCircle size={28} color="#ffc107" />;
    }
  };

  return (
    <SubpageLayout title="Gestión de Empleados" fallbackPath="/options">
      <h1>Gestión de empleados</h1>

      <div className={styles.employeeList}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="created_at">Ordenar por fecha</option>
          <option value="name">Ordenar por nombre</option>
        </select>

        {loading || !readyToRender ? (
          <p>Cargando empleados...</p>
        ) : filtered.length === 0 ? (
          <p>No hay empleados encontrados.</p>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp.id}
              onClick={() => {
                if (emp.isPending) {
                  navigate(`/invitation-info/${emp.id}`);
                } else {
                  navigate(`/employee-info/${emp.id}`);
                }
              }}
            >
              <div
                className={styles.employeeCard}
                style={{
                  borderLeft: emp.isPending ? '4px solid orange' : 'none',
                  opacity: emp.isPending ? 0.85 : 1,
                }}
              >
                <div className={styles.iconWrapper}>
                  <FaUserCircle
                    size={32}
                    color={emp.isPending ? 'orange' : '#3366FF'}
                  />
                </div>
                <div className={styles.details}>
                  <p className={styles.name}>{emp.name || 'Sin nombre'}</p>
                  <p className={styles.meta}>
                    {emp.email || 'Sin correo'} · {emp.phone || 'Sin teléfono'}
                  </p>
                  <p className={styles.status}>
                    {emp.isPending
                      ? 'Invitación pendiente'
                      : emp.active
                      ? 'Activo'
                      : 'Inactivo'}{' '}
                    · {new Date(emp.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <hr />
            </div>
          ))
        )}

        <div className={styles['background-add-button']}>
          <button
            className={styles.addButton}
            onClick={() => navigate('/add-employee')}
          >
            Agregar empleado
          </button>
        </div>
      </div>
    </SubpageLayout>
  );
}
