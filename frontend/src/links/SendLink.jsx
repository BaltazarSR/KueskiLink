// src/links/SendLink.jsx
import styles from "../styles/links/SendLink.module.css";
import ChevronDown from "../assets/chevron-down.svg";
import ChevronRight from "../assets/chevron-right.svg";
import WhatsAppIcon from "../assets/whatsapp.svg";
import QrIcon from "../assets/qr.png";
import MailIcon from "../assets/email.svg";
import SmsIcon from "../assets/sms.svg";
import CopyIcon from "../assets/copy.svg";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SubpageLayout from "../layouts/SubpageLayout";

function AccordionItem({ title, icon, content, isOpen, onClick }) {
  return (
    <div className={styles["accordion-item"]}>
      <button className={styles["accordion-button"]} onClick={onClick}>
        <div className={styles["icon-text-wrapper"]}>
          <img src={icon} alt={`${title} icon`} className={styles["share-icon"]} />
          <span className={styles["share-type-title"]}>{title}</span>
        </div>
        <span>
          {isOpen
            ? <img src={ChevronDown} alt="Chevron Down" className={styles["chevron-icon"]} />
            : <img src={ChevronRight} alt="Chevron Right" className={styles["chevron-icon"]} />}
        </span>
      </button>
      {isOpen && <div className={styles["accordion-content"]}>{content}</div>}
    </div>
  );
}

export default function SendLink() {
  const [openIndex, setOpenIndex] = useState(null);
  const { state } = useLocation();
  const navigate = useNavigate();
  const paymentLink   = state?.paymentLink;
  const transactionId = state?.transactionId;
  const success       = state?.success;

  // 1) Si no hay paymentLink, aviso y redirijo
  useEffect(() => {
    if (!paymentLink) {
      toast.warn("Link no encontrado. Redireccionando...");
      navigate("/", { replace: true });
    }
  }, [paymentLink, navigate]);

  // 2) Si viene success, muestro toast y limpio sólo success, conservando paymentLink
  useEffect(() => {
    if (success) {
      toast.success("✅ Link generado exitosamente");
      navigate(location.pathname, {
        replace: true,
        state: { paymentLink, transactionId }
      });
    }
  // incluimos paymentLink/transactionId para que el navigate tenga acceso
  }, [success, paymentLink, transactionId, navigate, location.pathname]);

  const handleToggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  const data = [
    {
      shareType: "WhatsApp",
      icon: WhatsAppIcon,
      content: (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            const phone = e.target[0].value;
            window.open(
              `https://wa.me/${phone}?text=${encodeURIComponent(
                `Hola, aquí tienes tu link de pago: ${paymentLink}`
              )}`,
              "_blank"
            );
          }}
        >
          <input type="text" placeholder="Teléfono" className={styles.input} />
          <button type="submit" className={styles["send-button"]}>Enviar</button>
        </form>
      ),
    },
    {
      shareType: "Código QR",
      icon: QrIcon,
      content: (
        <div className={styles["qr-container"]}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
              paymentLink
            )}&size=150x150`}
            alt="Código QR"
            className={styles["qr-image"]}
          />
        </div>
      ),
    },
    {
      shareType: "Correo",
      icon: MailIcon,
      content: (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            const email = e.target[0].value;
            window.location.href = `mailto:${email}?subject=Link de pago&body=${encodeURIComponent(
              `Hola, aquí está tu link de pago: ${paymentLink}`
            )}`;
          }}
        >
          <input type="email" placeholder="Correo" className={styles.input} />
          <button type="submit" className={styles["send-button"]}>Enviar</button>
        </form>
      ),
    },
    {
      shareType: "SMS",
      icon: SmsIcon,
      content: (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            const phone = e.target[0].value;
            window.location.href = `sms:${phone}?body=${encodeURIComponent(
              "Aquí tienes tu link de pago: " + paymentLink
            )}`;
          }}
        >
          <input type="text" placeholder="Teléfono" className={styles.input} />
          <button type="submit" className={styles["send-button"]}>Enviar</button>
        </form>
      ),
    },
    {
      shareType: "Copiar",
      icon: CopyIcon,
      content: (
        <button
          className={styles["send-button"]}
          onClick={() => {
            navigator.clipboard.writeText(paymentLink);
            toast.success("¡Link copiado al portapapeles!");
          }}
        >
          Copiar link
        </button>
      ),
    },
  ];

  return (
    <SubpageLayout fallbackPath="/">
      <div className={styles["form-container"]}>
        <h1>Compartir Link</h1>
        {data.map((item, idx) => (
          <div key={idx}>
            <AccordionItem
              title={item.shareType}
              icon={item.icon}
              content={item.content}
              isOpen={openIndex === idx}
              onClick={() => handleToggle(idx)}
            />
            {idx < data.length - 1 && (
              <div className={styles["separation-line"]} />
            )}
          </div>
        ))}
      </div>
    </SubpageLayout>
  );
}
