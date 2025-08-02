import React, { use } from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import styles from "../styles/pages/Stats.module.css";
import SubpageLayout from "../layouts/SubpageLayout";
import Grid from "../assets/grid.svg"
import leftChevron from "../assets/chevron-left-blue.svg"
import rightChevron from "../assets/chevron-right-blue.svg"
import ProductInfo from "../menu/ProductInfo";

function completeDate(Date) {
  if (!Date || typeof Date !== "string") return "No hay datos";

  const [day, month, year] = Date.split("/");

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const monthName = months[parseInt(month) - 1];

  return `${day} de ${monthName} ${year}`;
}

function completeWeek(week) {
  if (!Array.isArray(week) || week.length !== 7) return "Semana inválida";

  const [start, , , , , , end] = week;

  const [startDay, startMonth, startYear] = start.split('/');
  const [endDay, endMonth, endYear] = end.split('/');

  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const monthName = months[parseInt(endMonth) - 1];

  return `${startDay} - ${endDay} de ${monthName} ${startYear}`;
}

function Stats() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [max, setMax] = useState(0);

  const [weekDays, setWeekDays] = useState([7]);

  const [week, setWeek] = useState('00 - 00 de diciembre 2025');

  const [totalSales, setTotalSales] = useState(0);

  const [dailySales, setDailySales] = useState({});

  const [payments, setPayments] = useState([]);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [bestDay, setBestDay] = useState();
  const [bestSale, setBestSale] = useState(0);

  const [topProducts, setTopProducts] = useState([]);

  const [linkKind, setLinkKind] = useState([]);

  const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

  // Fetch all the products
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

  // Fetch all the payments
  useEffect(() => {
    const fetchPayments = async () => {
        if (!profile?.company?.id) return;

        const { data, error } = await supabase
            .from('transactions')
            .select('amount, customer_name, concept, created_at, updated_at,status')
            .eq('company_id', profile.company.id)
            .in('status', ['approved', 'pagado_efectivo'])
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error al cargar los pagos:', error.message);
            return;
        }

        // Map data to match PaymentItem props
        const mapped = (data || []).map(payment => ({
            amount: payment.amount,
            author: payment.customer_name || 'Cliente desconocido',
            concept: payment.concept || 'Sin concepto',
            date: new Date(payment.updated_at).toLocaleDateString('es-MX')
        }));

        setPayments(mapped);
    };

    fetchPayments();
  }, [profile]);

  // Calculate the total sales
  useEffect(() => {
    const calculateTotalSales = () => {
        const total = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        setTotalSales(total);
    };

    calculateTotalSales();
  }, [payments]);

  // Calculate the best day
  useEffect(() => {
    const calculateBestDay = () => {
      const dayWithMaxSale = payments.reduce((acc, curr) => {
        const date = curr.date;
        const amount = curr.amount;

        acc.totals[date] = (acc.totals[date] || 0) + amount;

        if (acc.totals[date] > acc.maxAmount) {
          acc.maxAmount = acc.totals[date];
          acc.maxDate = date;
        }
        return acc;
      }, { totals: {}, maxAmount: 0, maxDate: null });
      setBestDay(dayWithMaxSale.maxDate);
      setBestSale(dayWithMaxSale.maxAmount);
    };

    calculateBestDay();
  }, [payments]);

  // Calculate the top products
  useEffect(() => {
    const fetchTopProducts = async () => {
      const { data, error } = await supabase
        .from('products_transactions')
        .select(`
          transaction_id,
          product_id, 
          quantity,
          products:product_id (
            name
          ),
          transactions:transaction_id (
            status
          )
        `)

      if (error || !data) {
        console.error('Transacciones no encontradas');
        navigate('/stats');
        return;
      }

      const grouped = {};

      data.forEach(row => {
        const status = row.transactions?.status;

        if (status === "approved" || status === "pagado_efectivo") {
          const id = row.product_id;
          const name = row.products.name || 'Sin nombre';

          if (!grouped[id]) {
            grouped[id] = {
              product_id: id,
              name,
              total_quantity: 0,
            };
          }

          grouped[id].total_quantity += row.quantity;
        }
      });

      const entries = Object.entries(grouped);
      const sortedDesc = Object.fromEntries(
        entries.sort((a, b) => b[1].total_quantity - a[1].total_quantity)
      );
      const topProducts = Object.values(sortedDesc);

      setTopProducts(topProducts);
    };

    fetchTopProducts();
  }, []);

  // Calculate number of links
  useEffect(() => {
    const fetchNumLinks = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          status,
          expiration_date,
          kueski_created_at
        `)

      if (error || !data) {
        console.error('Links no encontrados');
        navigate('/stats');
        return;
      }

      const grouped = {};
      
      grouped['paid'] = {
        quantity: 0,
      };
      grouped['active'] = {
        quantity: 0,
      };
      grouped['overdue'] = {
        quantity: 0,
      };
      grouped['canceled'] = {
        quantity: 0,
      };

      const now = new Date();

      data.forEach(row => {
        const status = row.status;
        const expires = new Date(row.expiration_date);
        const kueskiCreated = row.kueski_created_at ? new Date(row.kueski_created_at) : null;
        const remainingKueskiMin = kueskiCreated ? Math.floor((kueskiCreated.getTime() + 90 * 60000 - now.getTime()) / 60000) : null;

        if (status === 'approved' || status === 'pagado_efectivo') {
          grouped['paid'].quantity += 1;
        } else if (status === 'canceled') {
          grouped['canceled'].quantity += 1;
        } else if (status === 'pendiente_efectivo') {
          grouped['active'].quantity += 1;
        } else if (status === 'pendiente') {
          if (now > expires) {
            grouped['overdue'].quantity += 1;
          } else if (!kueskiCreated) {
            grouped['active'].quantity += 1;
          } else if (remainingKueskiMin > 0) {
            grouped['active'].quantity += 1;
          }
        }
        
      });
      setLinkKind(grouped);
    };

    fetchNumLinks();
  }, []);

  // Stay at the top
  // DONT TOUCH BECAUSE IT BREAKS (PINKY SWEAR)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate weekdays
  useEffect(() => {
    const getCurrentWeek = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();

      const monday = new Date(today);
      const diffToMonday = (dayOfWeek + 6) % 7;
      monday.setDate(today.getDate() - diffToMonday);

      const week = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        
        const year = currentDay.getFullYear();
        const month = currentDay.getMonth() + 1
        const day = currentDay.getDate();

        week.push(`${day}/${month}/${year}`);
      }

      const weekText = `${completeWeek(week)}`;
      
      setWeek(weekText)
      setWeekDays(week);
    };
    
    getCurrentWeek();
  }, []);

  // Get daily sales
  useEffect(() => {
    const dailySales = {};
    payments.forEach(payment => {
      const date = payment.date
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += 1;
    });
    setDailySales(dailySales)
  }, [payments]);

  // Change graph
  useEffect(() => {
    const updateHeights = async () => {
      let tmpMax = 0;

      weekDays.forEach(date => {
        if (dailySales[date] !== undefined) {
          tmpMax = Math.max(tmpMax, dailySales[date]);
        }
      });
      if (tmpMax === 0) {
        tmpMax = 10; // Prevent division by zero
      }
      setMax(tmpMax);

      weekDays.forEach((date, index) => {
        const value = dailySales[date] ||  tmpMax / 100;
        const heightPercent = (value / tmpMax) * 100;

        const className = styles['bar-' + days[index]];
        const bar = document.querySelector(`.${className}`);
        if (bar) {
          bar.style.height = `${heightPercent}%`;
        }
      });
    };

    updateHeights();
  }, [dailySales, weekDays]);

  function handleWeekChange(time) {
    const newWeek = weekDays.map(dateStr => {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);

      date.setDate(date.getDate() + (time === 'before' ? -7 : 7));

      const newYear = date.getFullYear();
      const newMonth = date.getMonth() + 1;
      const newDay = date.getDate();

      return `${newDay}/${newMonth}/${newYear}`;
    });

    setWeek(completeWeek(newWeek))
    setWeekDays(newWeek);
  }

  return (
    <SubpageLayout title="Stats" fallbackPath="/">
      {/* Total Sales */}
      <section className={styles.section}>
        <h2 className={styles.titles}>Total de ventas</h2>
        <p className={styles.price}>
          ${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </section>
      {/* Graph */}
      <section className={styles.section}>
        <h2 className={styles.titles}>Número de ventas por día</h2>
        <div className={styles['button-container']}>
          <div className={styles['week-button']} onClick={() => handleWeekChange('before')}>
            <img 
              src={leftChevron} 
              alt="left" 
              className={styles['week-arrow']} 
            />
          </div>
          <div className={styles['week-text']}> {week} </div>
          <div className={styles['week-button']} onClick={() => handleWeekChange('after')}>
            <img 
              src={rightChevron} 
              alt="right" 
              className={styles['week-arrow']}
            />
          </div>
        </div>
        <div className={styles['graph']}>
          <img src={Grid} alt="gridBackground" className={styles.grid} />
          <div className={styles['num-container']} >
            <div className={styles.higher}>{max}</div>
          </div>
          <div className={styles['bar-container']}>
            <div className={styles['bar-lun']}></div>
            <div className={styles['bar-mar']}></div>
            <div className={styles['bar-mie']}></div>
            <div className={styles['bar-jue']}></div>
            <div className={styles['bar-vie']}></div>
            <div className={styles['bar-sab']}></div>
            <div className={styles['bar-dom']}></div>
          </div>
        </div>
      </section>
      {/* Best day */}
      <section className={styles.section}>
        <h2 className={styles.titles}>Día con mayores ventas</h2>
        <h2 className={styles.bestDay}> 
          {completeDate(bestDay)}
        </h2>
        <p className={styles.price}>
          ${bestSale.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </section>
      {/* Best selling products */}
      <section className={styles.section}>
        <h2 className={styles.titles}>Ventas de productos</h2>
        {topProducts.map((topProduct) => {
          return (
            <div key={topProduct.product_id} >
              <div className={styles.sellingProducts} onClick={() => navigate(`/stats-product/${topProduct.product_id}`)}>
                <div className={styles.totalSales}><p>{topProduct.total_quantity}</p></div>
                <div className={styles.salesDetails}>
                  <p className={styles.saleConcept}>{topProduct.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>
      {/* Nûmero de links */}
      <section className={styles.section}>
        <h2 className={styles.titles}>Cantidad de links</h2>
        {/* Paid */}
        <div className={styles.sellingProducts}>
          <div className={styles.paidLink}><p>{linkKind['paid']?.quantity || 0}</p></div>
          <div className={styles.salesDetails}>
            <p className={styles.saleConcept}>Pagados</p>
          </div>
        </div>
        {/* Active */}
        <div className={styles.sellingProducts}>
          <div className={styles.activeLink}><p>{linkKind['active']?.quantity || 0}</p></div>
          <div className={styles.salesDetails}>
            <p className={styles.saleConcept}>Activos / Esperando pago</p>
          </div>
        </div>
        {/* Overdue */}
        <div className={styles.sellingProducts}>
          <div className={styles.overdueLink}><p>{linkKind['overdue']?.quantity || 0}</p></div>
          <div className={styles.salesDetails}>
            <p className={styles.saleConcept}>Vencidos</p>
          </div>
        </div>
        {/* Cancelled */}
        <div className={styles.sellingProducts}>
          <div className={styles.cancelledLink}><p>{linkKind['canceled']?.quantity || 0}</p></div>
          <div className={styles.salesDetails}>
            <p className={styles.saleConcept}>Cancelados</p>
          </div>
        </div>
      </section>
    </SubpageLayout>
  );
}

export default Stats;
