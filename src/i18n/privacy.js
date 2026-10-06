import { ADDRESS, EMAIL, PHONE } from '../data/siteInfo';

// Privacy policy copy, kept apart from content.js because it is long and only
// the /privacy page needs it. It describes what the site actually does:
// orders + payments through Square, customers follow their order on the
// ?order= status link (no emails to customers), order/reservation/review
// notices emailed to the owner only (Resend), hosting on Vercel, no analytics
// or advertising trackers.
// Update `updated` whenever the text changes.
export const privacy = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: October 5, 2026',
    backHome: 'Back to Maybe Café',
    intro:
      'Maybe Café ("we", "us") respects your privacy. This policy explains what information we collect when you use this website, how we use it, and the choices you have.',
    sections: [
      {
        heading: 'Information we collect',
        list: [
          'Online orders: your name, email address, phone number, and the items you order.',
          'Payments: card and digital wallet payments are processed directly by Square. Your full card number never reaches our website and we do not store it.',
          'Reservations: your name, email address, phone number, the date, time and number of guests, and any notes you add.',
          'Reviews sent from the website form: your name, your rating, and your comments.',
          'Technical data: like most websites, our hosting provider automatically records basic information such as IP address, browser type, and the date and time of each visit.',
        ],
      },
      {
        heading: 'How we use your information',
        list: [
          'To prepare your order and show its progress on your order status link.',
          'To contact you if there is a problem with your order.',
          'To confirm, change, or answer questions about a reservation.',
          'To reply to your messages and improve our service.',
          'To keep the website secure and meet our legal and accounting obligations.',
        ],
        after:
          'We do not send order updates or marketing by email: you follow your order on the status link you get after paying. We do not sell your personal information, and we do not use it for advertising.',
      },
      {
        heading: 'Who we share it with',
        body: 'We share information only with the service providers that make the website work, and only as needed for that purpose:',
        list: [
          'Square — payment processing and order management.',
          'Resend — delivers the internal notices our team receives when an order, reservation request, or review comes in.',
          'Vercel — website hosting.',
          'Google — the fonts on this site are loaded from Google Fonts.',
        ],
        after: 'We may also disclose information when the law requires it.',
      },
      {
        heading: 'Cookies and similar technologies',
        body: 'This website does not use advertising or analytics cookies. We only save your display preferences, such as light or dark mode, in your own browser. Square may use its own cookies in the payment form to prevent fraud.',
      },
      {
        heading: 'How long we keep it',
        body: 'We keep order, reservation, and review information for as long as we need it for the purposes above and to comply with tax and accounting rules.',
      },
      {
        heading: 'Your choices',
        body: 'You can ask us for a copy of the personal information we hold about you, or ask us to correct or delete it, by writing to the email address below. We will respond as soon as we reasonably can. Some records may need to be kept where the law requires it.',
      },
      {
        heading: 'Children',
        body: 'This website is not directed to children under 13, and we do not knowingly collect personal information from them.',
      },
      {
        heading: 'Changes to this policy',
        body: 'We may update this policy from time to time. The date at the top of this page shows when it was last revised.',
      },
      {
        heading: 'Contact us',
        body: 'If you have questions about this policy or about your information, contact us:',
        contact: true,
      },
    ],
  },
  es: {
    title: 'Política de privacidad',
    updated: 'Última actualización: 5 de octubre de 2026',
    backHome: 'Volver a Maybe Café',
    intro:
      'En Maybe Café ("nosotros") respetamos tu privacidad. Esta política explica qué información recopilamos cuando usas este sitio web, cómo la usamos y qué opciones tienes.',
    sections: [
      {
        heading: 'Información que recopilamos',
        list: [
          'Pedidos en línea: tu nombre, correo electrónico, número de teléfono y los productos que ordenas.',
          'Pagos: los pagos con tarjeta y billeteras digitales los procesa directamente Square. El número completo de tu tarjeta nunca llega a nuestro sitio y no lo guardamos.',
          'Reservaciones: tu nombre, correo electrónico, número de teléfono, la fecha, la hora y el número de personas, y las notas que agregues.',
          'Reseñas enviadas desde el formulario del sitio: tu nombre, tu calificación y tus comentarios.',
          'Datos técnicos: como la mayoría de los sitios web, nuestro proveedor de alojamiento registra automáticamente información básica como la dirección IP, el tipo de navegador y la fecha y hora de cada visita.',
        ],
      },
      {
        heading: 'Cómo usamos tu información',
        list: [
          'Para preparar tu pedido y mostrar su avance en el enlace de estado de tu pedido.',
          'Para contactarte si hay algún problema con tu pedido.',
          'Para confirmar, cambiar o responder dudas sobre una reservación.',
          'Para responder tus mensajes y mejorar nuestro servicio.',
          'Para mantener el sitio seguro y cumplir con nuestras obligaciones legales y contables.',
        ],
        after:
          'No enviamos actualizaciones del pedido ni publicidad por correo: sigues tu pedido en el enlace de estado que recibes al pagar. No vendemos tu información personal ni la usamos para publicidad.',
      },
      {
        heading: 'Con quién la compartimos',
        body: 'Compartimos información solo con los proveedores que hacen funcionar el sitio, y únicamente en la medida necesaria para ello:',
        list: [
          'Square — procesamiento de pagos y gestión de pedidos.',
          'Resend — entrega los avisos internos que recibe nuestro equipo cuando llega un pedido, una solicitud de reservación o una reseña.',
          'Vercel — alojamiento del sitio web.',
          'Google — las tipografías de este sitio se cargan desde Google Fonts.',
        ],
        after: 'También podemos divulgar información cuando la ley lo exija.',
      },
      {
        heading: 'Cookies y tecnologías similares',
        body: 'Este sitio no usa cookies de publicidad ni de analítica. Solo guardamos tus preferencias de visualización, como el modo claro u oscuro, en tu propio navegador. Square puede usar sus propias cookies en el formulario de pago para prevenir fraudes.',
      },
      {
        heading: 'Cuánto tiempo la conservamos',
        body: 'Conservamos la información de pedidos, reservaciones y reseñas durante el tiempo necesario para los fines anteriores y para cumplir con las normas fiscales y contables.',
      },
      {
        heading: 'Tus opciones',
        body: 'Puedes pedirnos una copia de la información personal que tenemos sobre ti, o pedirnos que la corrijamos o eliminemos, escribiendo al correo electrónico de abajo. Responderemos tan pronto como sea razonablemente posible. Algunos registros pueden conservarse cuando la ley lo exija.',
      },
      {
        heading: 'Menores de edad',
        body: 'Este sitio no está dirigido a menores de 13 años y no recopilamos de forma intencional información personal de ellos.',
      },
      {
        heading: 'Cambios a esta política',
        body: 'Podemos actualizar esta política de vez en cuando. La fecha al inicio de esta página indica cuándo se revisó por última vez.',
      },
      {
        heading: 'Contáctanos',
        body: 'Si tienes preguntas sobre esta política o sobre tu información, contáctanos:',
        contact: true,
      },
    ],
  },
};

export const PRIVACY_CONTACT = { address: ADDRESS, email: EMAIL, phone: PHONE };
