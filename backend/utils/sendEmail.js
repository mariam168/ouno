const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, 
        to: options.email, 
        subject: options.subject, 
        html: options.message, 
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
       
        return true; 
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('Nodemailer response:', error.response);
        }
        return false; 
    }
};

module.exports = sendEmail;
