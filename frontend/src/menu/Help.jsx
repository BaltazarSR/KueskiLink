// src/menu/Help.jsx

import SubpageLayout from '../layouts/SubpageLayout';
import styles from '../styles/menu/Help.module.css';
import { useState } from 'react';

function Help() {
    const faqs = [
        {
            question: "¿Dónde puedo usar Kueski Pay para comprar?",
            answer: "Puedes utilizar Kueski Pay para realizar compras en cualquier negocio o emprendimiento que use nuestra plataforma para generar links de pago. Estos links te pueden llegar por WhatsApp, correo electrónico, mensaje de texto o incluso escaneando un código QR. Al abrir el link, podrás acceder a todos los detalles de tu compra y realizar el pago de forma segura con Kueski Pay."
        },
        {
            question: "¿Cómo hago una compra con Kueski Pay?",
            answer: "Realizar una compra con Kueski Pay es muy sencillo. Solo necesitas abrir el link de pago que te haya enviado la tienda o negocio, iniciar sesión como cliente en nuestra plataforma y revisar los detalles del producto o servicio. Verás el monto total y un botón para pagar con Kueski Pay. Al confirmar tu pago, te mostraremos una pantalla de éxito y además recibirás una notificación por WhatsApp o SMS confirmando tu compra."
        },
        {
            question: "¿Cómo sé si una tienda acepta Kueski Pay?",
            answer: "Si una tienda o negocio te envía un link de pago desde nuestra plataforma y ves la opción de pagar con Kueski Pay, significa que esa tienda acepta este método de pago. No necesitas buscar un listado de comercios: basta con que recibas un link válido desde nuestros canales para saber que puedes pagar con nosotros."
        },
        {
            question: "¿Cuáles son los plazos para pagar mi compra?",
            answer: "Una vez que recibes tu link de pago, cuentas con un plazo de 90 minutos para completar tu compra. Este periodo es importante porque el link expira automáticamente al finalizar ese tiempo. Si eso sucede, solo tienes que contactar al negocio para que te envíen un nuevo link y puedas continuar con tu pago."
        },
        {
            question: "¿Cómo realizo el pago de mis cuotas?",
            answer: "Actualmente, nuestra plataforma está enfocada en facilitar pagos únicos a través de links generados por los negocios. Si tu compra con Kueski Pay involucra un esquema de pago a plazos, podrás gestionar esas cuotas directamente con Kueski, ya sea a través de su sitio web o su aplicación, fuera de nuestra plataforma de links de pago."
        },
        {
            question: "¿Qué pasa si me atraso en un pago?",
            answer: "Si no realizas tu pago dentro del plazo de 90 minutos, el link que recibiste se desactiva automáticamente y no podrá usarse. En ese caso, verás un mensaje que te informará que el link ha expirado. Si aún deseas completar tu compra, solo necesitas solicitar al negocio que te envíen un nuevo link de pago."
        },
        {
            question: "¿Por qué me rechazaron una compra con Kueski Pay?",
            answer: "Una compra puede ser rechazada por diversas razones. Es posible que el link ya haya expirado, que se haya producido un error en el proceso de pago, o que hayas intentado pagar dos veces con el mismo link. También es importante iniciar sesión correctamente para poder completar el pago. Si ocurre algún problema, te mostraremos un mensaje explicando la situación para que sepas qué hacer a continuación."
        },
        {
            question: "¿Qué hago si tengo un problema con mi compra?",
            answer: "Si tienes algún inconveniente con tu compra, puedes ingresar a tu dashboard de cliente dentro de la plataforma. Ahí podrás consultar tu historial de pagos, el estado de cada link y todos los detalles relacionados con tus compras. Si algo no está en orden, te recomendamos comunicarte directamente con la tienda que te envió el link, o bien con nuestro equipo de soporte si el problema está relacionado con el funcionamiento de la plataforma."
        },
        {
            question: "¿Puedo cancelar una compra hecha con Kueski Pay?",
            answer: "Por el momento, la cancelación de un link de pago solo puede ser realizada por el negocio que lo generó y únicamente antes de que el pago se complete o el link expire. Si necesitas cancelar una compra, lo ideal es ponerte en contacto con la tienda para que evalúen la situación y gestionen una posible cancelación o reembolso según sus políticas."
        },
        {
            question: "¿Mis datos personales están protegidos?",
            answer: "Sí, en nuestra plataforma la seguridad de tu información es una prioridad. Usamos autenticación centralizada, control de accesos por rol y una base de datos protegida con políticas de seguridad estrictas. Además, protegemos todas las conexiones con sistemas externos como Kueski para garantizar que tus datos personales estén siempre resguardados."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleAnswer = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <SubpageLayout title="Ayuda">
            <h1>Ayuda</h1>
            <div className={styles.container}>
                <section className={styles.links}>
                    <p className={styles.subtitle}><strong>Preguntas frecuentes</strong></p>
                    <ul className={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <li key={index}>
                                <a href="#" onClick={(e) => { e.preventDefault(); toggleAnswer(index); }}>
                                    {faq.question}
                                </a>
                                {openIndex === index && (
                                    <p className={styles.answer}>{faq.answer}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

        </SubpageLayout >
    );
}

export default Help;
