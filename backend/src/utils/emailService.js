import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: "Online Auction Platform",
    to: email,
    subject: "Email Verification OTP for Online Auction Platform",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
