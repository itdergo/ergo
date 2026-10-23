import nodemailer from "nodemailer";
const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
);
function createTransport() {
  if (!smtpConfigured) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}
const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com";
async function sendInquiryNotification(inquiry) {
  if (!smtpConfigured) {
    console.warn("[email] SMTP not configured \u2014 skipping inquiry notification for:", inquiry.email);
    return;
  }
  const transporter = createTransport();
  if (!transporter) {
    console.warn("[email] Failed to create SMTP transport \u2014 skipping notification");
    return;
  }
  const subject = `New inquiry from ${inquiry.name} (${inquiry.email})`;
  const lines = [
    `A new inquiry has been submitted.`,
    ``,
    `Name:    ${inquiry.name}`,
    `Email:   ${inquiry.email}`
  ];
  if (inquiry.company) lines.push(`Company: ${inquiry.company}`);
  if (inquiry.phone) lines.push(`Phone:   ${inquiry.phone}`);
  if (inquiry.source) lines.push(`Source:  ${inquiry.source}`);
  lines.push(``, `Message:`, inquiry.message);
  try {
    await transporter.sendMail({
      from: FROM,
      to: FROM,
      subject,
      text: lines.join("\n")
    });
    console.log(`[email] Inquiry notification sent for ${inquiry.email}`);
  } catch (err) {
    console.error("[email] Failed to send inquiry notification:", err);
  }
}
export {
  sendInquiryNotification
};
