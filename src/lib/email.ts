import nodemailer from 'nodemailer';

// Configure the SMTP transport using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this if using another SMTP service like hostinger SMTP (host: 'smtp.hostinger.com', port: 465, secure: true)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Madinah Salam Wisata" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
