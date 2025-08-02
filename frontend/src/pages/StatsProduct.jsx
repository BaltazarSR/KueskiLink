import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "../styles/pages/StatsProduct.module.css";
import SubpageLayout from "../layouts/SubpageLayout";

function StatsProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState({});

  // Get product sales
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .eq('id', id)
        .maybeSingle();
      
      if(error || !data) {
        console.error('Producto no encontrado');
        navigate('/stats');
        return;
      }
      setProduct(data);
      setLoading(false);
    };
    const fetchTransactions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products_transactions')
        .select(`
          transaction_id,
          product_id,
          quantity, 
          unit_price,
          transactions:transaction_id (
            updated_at,
            status,
            concept
          )
        `)
        .eq('product_id', id)
      
      if(error || !data) {
        console.error('Transacciones no encontradas');
        navigate('/stats');
        return;
      }
      const filteredData = data.filter(row =>
        ['approved', 'pagado_efectivo'].includes(row.transactions?.status)
      ).sort((a, b) => {
        const dateA = new Date(a.transactions?.updated_at || 0);
        const dateB = new Date(b.transactions?.updated_at || 0);
        return dateB - dateA;
      });
      setTransactions(filteredData);
      setLoading(false);
    };
    fetchProduct();
    fetchTransactions();
  }, [id, navigate]);

  useEffect(() => {
    const groupByDate = (transactions) => {
      const groups = {};
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      transactions.forEach(transaction => {
          const transactionDate = new Date(transaction.transactions.updated_at);
          let label;
          if (
              transactionDate.getDate() === today.getDate() &&
              transactionDate.getMonth() === today.getMonth() &&
              transactionDate.getFullYear() === today.getFullYear()
          ) {
              label = 'Hoy';
          } else if (
              transactionDate.getDate() === yesterday.getDate() &&
              transactionDate.getMonth() === yesterday.getMonth() &&
              transactionDate.getFullYear() === yesterday.getFullYear()
          ) {
              label = 'Ayer';
          } else {
              label = transactionDate.toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
              });
          }
          if (!groups[label]) groups[label] = [];
          groups[label].push(transaction);
      });
      return groups;
    };

    setGrouped(groupByDate(transactions));
  }, [transactions]);

  return (
    <SubpageLayout title="Stats producto" fallbackPath="/stats">
      <h2 className={styles.price}>{product?.name || '...'}</h2>
      <h1 className={styles.titles}>Historial de ventas del producto</h1>

      <div className={styles['payments-container']}>
          {Object.entries(grouped).map(([date, transactions]) => (
              <div key={date}>
                  <div className={styles.date}>{date}</div>
                  {transactions.map((transaction, idx) => (
                      <div className={styles.payment} key={idx}>
                          <div className={styles.amount}>
                              {transaction.quantity}
                          </div>
                          <div className={styles['payment-body']}>
                              <div className={styles['payment-title']}>
                                  {transaction.transactions.concept}
                              </div>
                          </div>
                      </div>
                  ))}
                  <hr />
              </div>
          ))}
      </div>
    </SubpageLayout>
  );
}

export default StatsProduct;