const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  // construct an instance which takes in info about User and Url
  constructor(user, url, img) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.img = img;
    this.from = 'The Escapist <thescapist92@gmail.com';
  }

  // Create Transport (email sending service) based on enviorenement (prod, dev)
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // using elasticemail to send real emails

      return nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 587,
        auth: {
          user: process.env.ELASTICMAIL_USERNAME,
          pass: process.env.ELASTICMAIL,
        },
      });
    }
    // Using Nodmailer to catch emails (using mailtrap to fake SMTP server and test the email service)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      img: this.img,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWeclome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)'
    );
  }

  async sendActivationLink() {
    await this.send(
      'accountActivation',
      'Your account activation link (valid for only 7 days)'
    );
  }

  async sendQr() {
    await this.send(
      'qrEmail',
      'Your QR for two factor authenthication (valid for only 5 min)'
    );
  }
};

//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });
//     // activate in gmail "less secure app" option, use Sandrgrid or Mailgun
