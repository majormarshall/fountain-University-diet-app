const sgMail = require('@sendgrid/mail')
const nodemailer = require('nodemailer')
const sendEmail = async ({ to, subject, html }) => {
  if(process.env.SENDGRID_API_KEY){
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = { to, from: process.env.EMAIL_FROM, subject, html }
    return sgMail.send(msg)
  } else {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: process.env.SENDGRID_SMTP_USER || 'apikey',
        pass: process.env.SENDGRID_SMTP_PASSWORD || ''
      }
    })
    return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html })
  }
}
module.exports = { sendEmail }
