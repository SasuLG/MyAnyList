import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, url: string) => {
  const mailOptions = {
    from: `"MyAnyList" <${process.env.EMAIL_USER}>`, 
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Confirmez votre adresse e-mail</h2>
        <p style="color: #555; line-height: 1.6;">
          Merci de vous être inscrit sur MyAnyList ! Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail et finaliser votre inscription.
        </p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a73e8; border-radius: 5px; text-decoration: none; font-weight: bold; cursor: pointer;">
          Vérifiez votre adresse e-mail
        </a>
        <p style="color: #555; line-height: 1.6; margin-top: 20px;">
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Cordialement,<br>L'équipe MyAnyList
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (to: string, url: string) => {
  const mailOptions = {
    from: `"MyAnyList" <${process.env.EMAIL_USER}>`, 
    to,
    subject: 'Réinitialisez votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Réinitialisez votre mot de passe</h2>
        <p style="color: #555; line-height: 1.6;">
          Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.
        </p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #1a73e8; border-radius: 5px; text-decoration: none; font-weight: bold; cursor: pointer;">
          Réinitialisez votre mot de passe
        </a>
        <p style="color: #555; line-height: 1.6; margin-top: 20px;">
          Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet e-mail.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Cordialement,<br>L'équipe MyAnyList
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
