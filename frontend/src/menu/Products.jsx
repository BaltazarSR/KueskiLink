import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubpageLayout from '../layouts/SubpageLayout';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import styles from '../styles/menu/Products.module.css';
import { FaBoxOpen, FaTools, FaQuestionCircle } from 'react-icons/fa';
import { formatMoney } from '../lib/formatters';


function Products() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  const [typeFilters, setTypeFilters] = useState({
    Producto: true,
    Servicio: true,
    Otro: true,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (!profile?.company?.id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', profile.company.id)
        .neq('status', 'deleted');

      if (error) {
        console.error('Error al obtener productos:', error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [profile]);

  useEffect(() => {
    const filteredData = products
      .filter((p) => {
        const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilters[p.type] ?? false;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          case 'price_asc':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price_desc':
            return parseFloat(b.price) - parseFloat(a.price);
          default:
            return 0;
        }
      });

    setFiltered(filteredData);
  }, [search, sortBy, products, typeFilters]);

  const getIconProps = (type) => {
    switch (type) {
      case 'Producto':
        return { icon: <FaBoxOpen size={30} color="#3366FF" />, className: 'producto' };
      case 'Servicio':
        return { icon: <FaTools size={30} color="#28a745" />, className: 'servicio' };
      default:
        return { icon: <FaQuestionCircle size={30} color="#ffc107" />, className: 'otro' };
    }
  };

  const handleTypeToggle = (type) => {
    setTypeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <SubpageLayout title="Gestión de Productos" fallbackPath="/options">
      <h1>Gestión de productos</h1>

      <div className={styles.productList}>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="name">Nombre (A-Z)</option>
          <option value="price_asc">Precio (menor a mayor)</option>
          <option value="price_desc">Precio (mayor a menor)</option>
        </select>

        <div className={styles.filtersContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={typeFilters.Producto}
              onChange={() => handleTypeToggle('Producto')}
              className={styles.checkboxInput}
            />
            <span
              className={styles.checkboxCustom}
              style={{ backgroundColor: typeFilters.Producto ? "#3366FF" : "#fff", borderColor: "#3366FF" }}
            />
            Producto
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={typeFilters.Servicio}
              onChange={() => handleTypeToggle('Servicio')}
              className={styles.checkboxInput}
            />
            <span
              className={styles.checkboxCustom}
              style={{ backgroundColor: typeFilters.Servicio ? "#28a745" : "#fff", borderColor: "#28a745" }}
            />
            Servicio
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={typeFilters.Otro}
              onChange={() => handleTypeToggle('Otro')}
              className={styles.checkboxInput}
            />
            <span
              className={styles.checkboxCustom}
              style={{ backgroundColor: typeFilters.Otro ? "#ffc107" : "#fff", borderColor: "#ffc107" }}
            />
            Otro
          </label>
        </div>

        {loading ? (
          <p>Cargando productos...</p>
        ) : filtered.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (
          filtered.map((product) => {
            const { icon, className } = getIconProps(product.type);

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/product-info/${product.id}`)}
              >
                <div
                  className={styles.productCard}
                  style={{
                    borderLeft: product.status === 'inactive' ? '4px solid gray' : 'none',
                    opacity: product.status === 'inactive' ? 0.7 : 1,
                  }}
                >
                  <div className={`${styles.iconWrapper} ${styles[className]}`}>
                    {icon}
                  </div>
                  <div className={styles.details}>
                    <p className={styles.name}>{product.name}</p>
                    <p className={styles.meta}>
                      {product.description || 'Sin descripción'}
                    </p>
                    <p className={styles.status}>
                      {product.type} · {product.status === 'active' ? 'Activo' : 'Inactivo'} · Precio: {formatMoney(product.price)}
                    </p>
                  </div>
                </div>
                <hr />
              </div>
            );
          })
        )}

        <div className={styles.backgroundAddButton}>
          <button
            className={styles.addButton}
            onClick={() => navigate('/add-product')}
          >
            Agregar producto
          </button>
        </div>
      </div>
    </SubpageLayout>
  );
}

export default Products;
