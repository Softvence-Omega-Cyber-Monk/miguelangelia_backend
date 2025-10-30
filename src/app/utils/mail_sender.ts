import nodemailer from "nodemailer";

export const sendMail = async ({
  to,
  subject,
  textBody,
  htmlBody,
}: {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Your App Name" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: textBody,
    html: htmlBody,
  });
};
