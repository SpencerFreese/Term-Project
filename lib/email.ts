import "server-only";

import nodemailer from "nodemailer";

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

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string,
) {
  const verificationUrl =
    `${getApplicationUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const transporter = getTransporter();

  if (!transporter) {
    console.log("==============================================");
    console.log(`Verification email for: ${email}`);
    console.log(`Verification link: ${verificationUrl}`);
    console.log("==============================================");

    return;
  }

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

      <p>
        <a href="${verificationUrl}">
          Confirm my account
        </a>
      </p>

      <p>This link expires in one hour.</p>
    `,
  });
}