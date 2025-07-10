import nodemailer from 'nodemailer';

export const sendPasswordResetCode = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // или любой другой почтовый сервис
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Крестики-Нолики Онлайн" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Код для сброса пароля',
    html: `<p>Здравствуйте,</p><p>Ваш код для сброса пароля: <strong>${code}</strong></p><p>Он будет действителен в течение 10 минут.</p>`,
  };

  await transporter.sendMail(mailOptions);
};