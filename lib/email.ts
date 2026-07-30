import "server-only";

import nodemailer from "nodemailer";

import type {CustomerOrder} from "@/lib/repositories/orderRepository";

function getApplicationUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}


function formatDateTime(value: string) {
  const date = new Date(
    value.includes("T")
      ? value
      : value.replace(" ", "T"),
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}


function formatTicketCategory(category: string) {
  return (category.charAt(0).toUpperCase() +category.slice(1));
}



function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}



export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string,
  returnTo: string | null = null,
) {
  const verificationUrlObject =
  new URL(
    "/api/auth/verify-email",
    getApplicationUrl(),
  );

verificationUrlObject.searchParams.set(
  "token",
  token,
);

if (returnTo) {
  verificationUrlObject.searchParams.set(
    "returnTo",
    returnTo,
  );
}

const verificationUrl =verificationUrlObject.toString();

  const transporter = getTransporter();

  if (process.env.EMAIL_DEBUG_LINKS === "true") {
    console.log("==============================================");
    console.log(`Verification email for: ${email}`);
    console.log(`Verification link: ${verificationUrl}`);
    console.log("==============================================");
  }

  if (!transporter) {
    console.log("SMTP is not configured. Email was not sent");
    console.log("make sure env file is setup correctly");
    
     if(process.env.EMAIL_DEBUG_LINKS !== "true"){
      console.log("if you see this your EMAIL_DEBUG_LINKS is not true, please make sure your env file is set up correctly");
      console.log("==============================================");
      console.log(`Verification email for: ${email}`);
      console.log(`Verification link: ${verificationUrl}`);
      console.log("==============================================");
    }
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
      to: email,
      subject: "Confirm your Cinema E-Booking account",
      text: [
        `Hello ${firstName},`,
        "",
        "Thank you for registering with Cinema E-Booking.",
        "Use the following link to confirm your account:",
        "",
        verificationUrl,
        "",
        "This link expires in one hour.",
      ].join("\n"),
      html: `
        <h1>Confirm your account</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with Cinema E-Booking.</p>
        <p><a href="${verificationUrl}">Confirm my account</a></p>
        <p>This link expires in one hour.</p>
      `,
    });

    console.log(`Verification email sent to ${email}`);
  } 
  catch (error) {
    console.error(`Verification email could not be sent to ${email}:`, error);

    if (process.env.EMAIL_DEBUG_LINKS !== "true") {
      throw error;
    }
  }
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  token: string,
) {
  const resetUrl =
    `${getApplicationUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const transporter = getTransporter();


  if (process.env.EMAIL_DEBUG_LINKS === "true") {
    console.log("==============================================");
    console.log(`Password reset email for: ${email}`);
    console.log(`Password reset link: ${resetUrl}`);
    console.log("==============================================");
  }


  if (!transporter) {
    console.log("SMTP is not configured. Email was not sent");
    console.log("make sure env file is setup correctly");

    if(process.env.EMAIL_DEBUG_LINKS !== "true"){
      console.log("if you see this your EMAIL_DEBUG_LINKS is not true, please make sure your env file is set up correctly");
      console.log("==============================================");
      console.log(`Password reset email for: ${email}`);
      console.log(`Password reset link: ${resetUrl}`);
      console.log("==============================================");
    }
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "Reset your Cinema E-Booking password",
    text: [
      `Hello ${firstName},`,
      "",
      "A password reset was requested for your account.",
      "",
      resetUrl,
      "",
      "This link expires in one hour.",
      "",
      "If you did not request this reset, you may ignore this email.",
    ].join("\n"),
    html: `
      <h1>Reset your password</h1>

      <p>Hello ${firstName},</p>

      <p>A password reset was requested for your account.</p>

      <p>
        <a href="${resetUrl}">
          Reset my password
        </a>
      </p>

      <p>This link expires in one hour.</p>

      <p>
        If you did not request this reset, you may ignore this email.
      </p>
    `,
  });
}

export async function sendProfileUpdatedEmail(email: string,firstName: string) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("==============================================");
    console.log(`Profile update notification for: ${email}`);
    console.log("A change was made to this user's profile.");
    console.log("==============================================");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "Your Cinema E-Booking profile was updated",
    text: [
      `Hello ${firstName},`,
      "",
      "A change was made to your Cinema E-Booking profile.",
      "",
      "If you did not make this change, please reset your password immediately.",
    ].join("\n"),
    html: `
      <h1>Your profile was updated</h1>

      <p>Hello ${firstName},</p>

      <p>
        A change was made to your Cinema E-Booking profile.
      </p>

      <p>
        If you did not make this change, please reset your password
        immediately.
      </p>
    `,
  });
}




  
export async function sendBookingConfirmationEmail(order: CustomerOrder): Promise<boolean> {
  const transporter = getTransporter();

  const confirmationUrl = `${getApplicationUrl()}/orders/${order.orderId}/confirmation`;

  const seatLabels = order.seats.map((seat) => `${seat.rowLabel}${seat.seatNumber}`).join(", ") || "No seats listed";

  const ticketLines = order.tickets.map( (ticket) => `${formatTicketCategory(ticket.ticketCategory)} x ${ticket.quantity} at ${formatCurrency(ticket.unitPrice)}` );

  const ticketText = ticketLines.join("\n") || "No ticket information available";

  const ticketHtml = ticketLines.length
    ? ticketLines.map((ticket) => `<li>${escapeHtml(ticket)}</li>`).join("")
    : "<li>No ticket information available</li>";

  if (process.env.EMAIL_DEBUG_LINKS === "true") {
    console.log("==============================================");
    console.log(`Booking confirmation email for: ${order.confirmationEmail}`);
    console.log(`Confirmation link: ${confirmationUrl}`);
    console.log("==============================================");
  }

  if (!transporter) {
    console.log("SMTP is not configured. Booking confirmation email was not sent.");
    console.log("Make sure your environment file is set up correctly.");

    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
      to: order.confirmationEmail,
      subject: `Cinema E-Booking Confirmation: ${order.confirmationCode}`,

      text: [
        "Your Cinema E-Booking order is confirmed.",
        "",
        `Confirmation code: ${order.confirmationCode}`,
        `Movie: ${order.movieTitle}`,
        `Showtime: ${formatDateTime(order.startTime)}`,
        `Theater: ${order.roomName}`,
        `Format: ${order.formatType ?? "Standard"}`,
        `Seats: ${seatLabels}`,
        "",
        "Tickets:",
        ticketText,
        "",
        `Subtotal: ${formatCurrency(order.subtotal)}`,
        `Tax: ${formatCurrency(order.taxAmount)}`,
        `Total: ${formatCurrency(order.totalAmount)}`,
        `Payment: ${order.cardType ?? "Card"} ending in ${
          order.cardLastFour
        }`,
        "",
        `View your order: ${confirmationUrl}`,
      ].join("\n"),

      html: `
        <h1>Your booking is confirmed</h1>

        <p>
          Your Cinema E-Booking order was completed successfully.
        </p>

        <p>
          <strong>Confirmation code:</strong>
          ${escapeHtml(order.confirmationCode)}
        </p>

        <h2>${escapeHtml(order.movieTitle)}</h2>

        <p>
          <strong>Showtime:</strong>
          ${escapeHtml(formatDateTime(order.startTime))}
        </p>

        <p>
          <strong>Theater:</strong>
          ${escapeHtml(order.roomName)}
        </p>

        <p>
          <strong>Format:</strong>
          ${escapeHtml(order.formatType ?? "Standard")}
        </p>

        <p>
          <strong>Seats:</strong>
          ${escapeHtml(seatLabels)}
        </p>

        <h3>Tickets</h3>

        <ul>
          ${ticketHtml}
        </ul>

        <p>
          <strong>Subtotal:</strong>
          ${formatCurrency(order.subtotal)}
        </p>

        <p>
          <strong>Tax:</strong>
          ${formatCurrency(order.taxAmount)}
        </p>

        <p>
          <strong>Total:</strong>
          ${formatCurrency(order.totalAmount)}
        </p>

        <p>
          <strong>Payment method:</strong>
          ${escapeHtml(order.cardType ?? "Card")}
          ending in
          ${escapeHtml(order.cardLastFour)}
        </p>

        <p>
          <a href="${escapeHtml(confirmationUrl)}">
            View my order
          </a>
        </p>
      `,
    });

    console.log(`Booking confirmation email sent to ${order.confirmationEmail}`);

    return true;
  } catch (error) {
    console.error(`Booking confirmation email could not be sent to ${order.confirmationEmail}:`, error);

    return false;
  }
}