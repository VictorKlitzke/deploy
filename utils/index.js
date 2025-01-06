const verificationCodes = require('../store/verification');
const nodemailer = require('nodemailer');
require("dotenv").config();

function formmater(valor) {
  return parseFloat(valor.replace(/\./g, '').replace(',', '.').trim());
}

function verificationEmail(newemail) {
  return new Promise((resolve, reject) => {

    if (!verificationCodes.has(newemail)) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      verificationCodes.set(newemail, {
        code: verificationCode,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });

      setTimeout(() => {
        verificationCodes.delete(newemail);
      }, 60 * 60 * 1000);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.sendMail(
      {
        from: process.env.EMAIL_USER,
        to: newemail,
        subject: 'Código de Verificação',
        text: `Seu código de verificação é: ${verificationCodes.get(newemail).code}`,
      },
      (error, info) => {
        if (error) {
          console.error('Erro ao enviar o e-mail:', error);
          return reject(error);
        }
        console.log('E-mail enviado:', info.response);
        resolve();
      }
    );
  });
}

module.exports = { formmater, verificationEmail };