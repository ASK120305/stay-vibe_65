import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verify Your Email - Stay Vibe Plan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Stay Vibe Plan</h1>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Welcome, ${data.name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with Stay Vibe Plan. To complete your registration, 
            please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with us, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Stay Vibe Plan. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Reset Your Password - Stay Vibe Plan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Stay Vibe Plan</h1>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${data.name},
          </p>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 10 minutes for security reasons.
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Stay Vibe Plan. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  bookingConfirmation: (data) => ({
    subject: `Booking Confirmation - ${data.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hi ${data.guestName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Your booking has been confirmed. Here are your booking details:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
            <p><strong>Hotel:</strong> ${data.hotelName}</p>
            <p><strong>Room:</strong> ${data.roomType}</p>
            <p><strong>Check-in:</strong> ${data.checkInDate}</p>
            <p><strong>Check-out:</strong> ${data.checkOutDate}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We look forward to welcoming you!
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Stay Vibe Plan. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  bookingCancellation: (data) => ({
    subject: `Booking Cancelled - ${data.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hi ${data.guestName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Your booking has been cancelled as requested.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Cancelled Booking Details</h3>
            <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
            <p><strong>Hotel:</strong> ${data.hotelName}</p>
            <p><strong>Original Check-in:</strong> ${data.checkInDate}</p>
            <p><strong>Original Check-out:</strong> ${data.checkOutDate}</p>
            <p><strong>Refund Amount:</strong> $${data.refundAmount}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Your refund will be processed within 5-7 business days.
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Stay Vibe Plan. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    let emailContent;
    
    if (options.template && emailTemplates[options.template]) {
      emailContent = emailTemplates[options.template](options.data);
    } else {
      emailContent = {
        subject: options.subject,
        html: options.html || options.message
      };
    }

    const message = {
      from: `"Stay Vibe Plan" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(message);
    
    logger.info(`Email sent to ${options.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending error:', error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmail = async (emails, template, data) => {
  try {
    const promises = emails.map(email => 
      sendEmail({
        email,
        template,
        data
      })
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    logger.info(`Bulk email sent: ${successful} successful, ${failed} failed`);
    
    return { successful, failed, results };
  } catch (error) {
    logger.error('Bulk email sending error:', error);
    throw error;
  }
};

export default { sendEmail, sendBulkEmail };