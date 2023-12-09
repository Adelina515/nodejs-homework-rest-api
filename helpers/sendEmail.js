const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendEmail(message) {
  message.from = "adelgodlevska@gmail.com";
  sgMail.send(message);
}
module.exports = sendEmail;
