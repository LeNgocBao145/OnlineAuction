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

// Generic email sender
export async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `Online Auction Platform <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

// OTP Email
export async function sendOTPEmail(email, otp) {
  const subject = "Email Verification OTP for Online Auction Platform";
  const html = `
    <h2>Email Verification</h2>
    <p>Your OTP code is: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;
  await sendEmail(email, subject, html);
}

// Bid Success Email
export async function sendBidSuccessEmail(to, productName, bidAmount, productUrl) {
  const subject = `Bid Successful - ${productName}`;
  const html = `
    <h2>Bid Placed Successfully</h2>
    <p>Your bid of <strong>$${bidAmount}</strong> has been placed on <strong>${productName}</strong>.</p>
    <p><a href="${productUrl}">View Product</a></p>
  `;
  await sendEmail(to, subject, html);
}

// Outbid Notification Email
export async function sendOutbidEmail(to, productName, newBidAmount, productUrl) {
  const subject = `You've Been Outbid - ${productName}`;
  const html = `
    <h2>You've Been Outbid</h2>
    <p>Someone has placed a higher bid of <strong>$${newBidAmount}</strong> on <strong>${productName}</strong>.</p>
    <p><a href="${productUrl}">Place a New Bid</a></p>
  `;
  await sendEmail(to, subject, html);
}

// New Bid Notification to Seller
export async function sendNewBidToSellerEmail(to, productName, bidAmount, bidderName, productUrl) {
  const subject = `New Bid on Your Product - ${productName}`;
  const html = `
    <h2>New Bid Received</h2>
    <p><strong>${bidderName}</strong> placed a bid of <strong>$${bidAmount}</strong> on your product <strong>${productName}</strong>.</p>
    <p><a href="${productUrl}">View Product</a></p>
  `;
  await sendEmail(to, subject, html);
}

// Bid Rejected Email
export async function sendBidRejectedEmail(to, productName, productUrl) {
  const subject = `Bid Rejected - ${productName}`;
  const html = `
    <h2>Bid Rejected</h2>
    <p>Your bid on <strong>${productName}</strong> has been rejected by the seller.</p>
    <p>You are no longer able to bid on this product.</p>
  `;
  await sendEmail(to, subject, html);
}

// Auction Ended - No Winner
export async function sendAuctionEndedNoWinnerEmail(to, productName, productUrl) {
  const subject = `Auction Ended - ${productName}`;
  const html = `
    <h2>Auction Ended</h2>
    <p>The auction for <strong>${productName}</strong> has ended with no bids.</p>
    <p><a href="${productUrl}">View Product</a></p>
  `;
  await sendEmail(to, subject, html);
}

// Auction Ended - Winner Notification
export async function sendAuctionWinnerEmail(to, productName, winningBid, productUrl) {
  const subject = `Congratulations! You Won - ${productName}`;
  const html = `
    <h2>Congratulations!</h2>
    <p>You won the auction for <strong>${productName}</strong> with a bid of <strong>$${winningBid}</strong>.</p>
    <p><a href="${productUrl}">Complete Order</a></p>
  `;
  await sendEmail(to, subject, html);
}

// Auction Ended - Seller Notification
export async function sendAuctionEndedToSellerEmail(to, productName, winnerName, winningBid, productUrl) {
  const subject = `Auction Ended - ${productName}`;
  const html = `
    <h2>Auction Ended</h2>
    <p>Your auction for <strong>${productName}</strong> has ended.</p>
    <p>Winner: <strong>${winnerName}</strong></p>
    <p>Winning Bid: <strong>$${winningBid}</strong></p>
    <p><a href="${productUrl}">Complete Order</a></p>
  `;
  await sendEmail(to, subject, html);
}

// Question Asked Email
export async function sendQuestionAskedEmail(to, productName, buyerName, question, productUrl) {
  const subject = `New Question on Your Product - ${productName}`;
  const html = `
    <h2>New Question</h2>
    <p><strong>${buyerName}</strong> asked a question about <strong>${productName}</strong>:</p>
    <blockquote>${question}</blockquote>
    <p><a href="${productUrl}">Answer Question</a></p>
  `;
  await sendEmail(to, subject, html);
}

// Question Answered Email
export async function sendQuestionAnsweredEmail(to, productName, answer, productUrl) {
  const subject = `Question Answered - ${productName}`;
  const html = `
    <h2>Question Answered</h2>
    <p>The seller has answered a question about <strong>${productName}</strong>:</p>
    <blockquote>${answer}</blockquote>
    <p><a href="${productUrl}">View Product</a></p>
  `;
  await sendEmail(to, subject, html);
}
