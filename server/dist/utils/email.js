"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
// importing nodemailer for sending emails
const nodemailer_1 = __importDefault(require("nodemailer"));
// Creating a transporter for sending emails
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    // host: "smtp.gmail.com",
    // port: 587,
    // secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Sender gmail address
        pass: process.env.EMAIL_PASSWORD, // App password from gmail account
    },
});
// Function to send emails
const sendEmail = async ({ to, subject, text }) => {
    try {
        const mailOptions = {
            from: {
                name: 'StuVendor',
                address: process.env.EMAIL_USER,
            },
            to,
            subject,
            text,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        // throw new Error('Failed to send email');
    }
};
exports.sendEmail = sendEmail;
// Creating a transporter for sending mails
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   // host: "smtp.gmail.com",
//   // port: 587,
//   // secure: false, // true for port 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER, // Sender gmail address
//     pass: process.env.EMAIL_PASSWORD, // App password from gmail account
//   },
// });
// Send welcome mail after successful registration
// const mailOptions = {
//   from: {
//     name: 'StuVendor',
//     address: process.env.EMAIL_USER as string
//   }, // sender address
//   to: email, // email list of receivers
//   // to: 'alawodetemitope9@gmail.com', // email list of receivers
//   subject: "Hello, welcome to StuVendor!", // Subject line
//   text: `Hello ${name},\n\nThank you for registering with StuVendor! We're excited to have you on board. Start exploring vendors for your domestic needs or set up your vendor profile to begin selling.\n\nBest regards,\nThe StuVendor Team`,
//   // html: "<b>Hello world?</b>", // html body
// };
// transporter.sendMail(mailOptions);    
// console.log('Mail has been sent successfully!!');
// For reset password
// const mailOptions = {
//     from: {
//       name: 'StuVendor',
//       address: process.env.EMAIL_USER as string
//     }, // sender address
//     to: email, // email list of receivers
//     // to: 'alawodetemitope9@gmail.com', 
//     subject: 'Password Reset Request', // Subject line
//     text: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nBest regards,\nThe StuVendor Team`,
//   };
//   transporter.sendMail(mailOptions);
//   // await transporter.sendMail(mailOptions);
//   console.log('Mail has been sent successfully!!');
