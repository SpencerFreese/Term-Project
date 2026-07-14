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

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  token: string,
) {
  const resetUrl =
    `${getApplicationUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const transporter = getTransporter();

  if (!transporter) {
    console.log("==============================================");
    console.log(`Password reset email for: ${email}`);
    console.log(`Password reset link: ${resetUrl}`);
    console.log("==============================================");

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

export async function sendProfileUpdatedEmail(
  email: string,
  firstName: string,
) {
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
  