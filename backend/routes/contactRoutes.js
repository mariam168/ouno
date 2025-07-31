
const express = require('express');
const router = express.Router(); 
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    const { name, subject, email, phone, message } = req.body;
    if (!name || !subject || !email || !message) {
        return res.status(400).json({ message: 'Please fill in all required fields (Name, Subject, Email, Message).' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const mailOptions = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: process.env.EMAIL_USER,
            subject: `New Contact Message: ${subject} from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #0056b3;">New Message from Contact Form</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                    <h3 style="color: #0056b3;">Message:</h3>
                    <p style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; background-color: #f9f9f9;">
                        ${message}
                    </p>
                    <p style="font-size: 0.9em; color: #777;">This message was sent from your e-commerce website contact form.</p>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);

        console.log(`Contact message sent from ${email}`);
        res.status(200).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Error sending contact message:', error);
        if (error.code === 'EAUTH') {
            res.status(500).json({ message: 'Email sending failed: Authentication error. Check EMAIL_USER and EMAIL_PASS in .env. For Gmail, use an App Password if 2FA is enabled.' });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ message: 'Email sending failed: Connection refused. Check EMAIL_HOST and EMAIL_PORT in .env, and ensure your mail server is accessible.' });
        } else {
            res.status(500).json({ message: 'Failed to send message due to a server error.', error: error.message });
        }
    }
});

module.exports = router;
