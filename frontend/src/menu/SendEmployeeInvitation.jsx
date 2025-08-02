// src/menu/invitation-info/SendEmployeeInvitation.jsx
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

export default function SendEmployeeInvitation() {
  const [openIndex, setOpenIndex] = useState(null);
  const { state } = useLocation();
  const invitationLink = state?.invitationLink;
  const navigate = useNavigate();

  // Si falta el link, navegamos a /employees con flag para el toast
  useEffect(() => {
    if (!invitationLink) {
      navigate("/employees", {
        replace: true,
        state: { fromInvitationError: true }
      });
    }
  }, [invitationLink, navigate]);

  const message = `Hola, aquí tienes tu link para registrarte como empleado: ${invitationLink}`;

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
              `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
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
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(invitationLink)}&size=150x150`}
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
            window.location.href = `mailto:${email}?subject=Invitación&body=${encodeURIComponent(message)}`;
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
            window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
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
            navigator.clipboard.writeText(invitationLink);
            // Pasamos el toast al listado de empleados si fuese necesario,
            // o mostramos directamente uno aquí:
            toast.success("Link copiado al portapapeles");
          }}
        >
          Copiar link
        </button>
      ),
    },
  ];

  return (
    <SubpageLayout title="Compartir invitación" fallbackPath="/employees">
      <div className={styles["form-container"]}>
        <h1>Invitar empleado</h1>
        {data.map((item, index) => (
          <div key={index}>
            <AccordionItem
              title={item.shareType}
              icon={item.icon}
              content={item.content}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
            {index < data.length - 1 && <div className={styles["separation-line"]} />}
          </div>
        ))}
      </div>
    </SubpageLayout>
  );
}
