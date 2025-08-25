import { MailService } from '@sendgrid/mail';
import { generateInvoicePDF } from './pdfService';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string | { email: string; name?: string };
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    if (params.attachments) emailData.attachments = params.attachments;
    
    // console.log('Sending email with data:', JSON.stringify({
    //   to: emailData.to,
    //   from: emailData.from,
    //   subject: emailData.subject
    // }, null, 2));
    
    await mailService.send(emailData);
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    console.error('Error response body:', error.response?.body);
    console.error('Error status:', error.code || error.status);
    return false;
  }
}

// Email Templates
export const EmailTemplates = {
  welcome: (userEmail: string, userId: string) => ({
    subject: 'Welcome to Phoenix Vacation Group!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🚢 Welcome Aboard!</h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there,</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Welcome to <strong>Phoenix Vacation Group</strong>! We're thrilled to have you join our community of cruise enthusiasts.
          </p>
          
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Your Account Details:</strong><br>
              Email: ${userEmail}<br>
              Account ID: ${userId}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            You can now browse our exclusive cruise destinations, make bookings, and manage your reservations all in one place.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Start Exploring Cruises
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Happy sailing!<br>
            The Phoenix Vacation Group Team
          </p>
        </div>
      </div>
    `,
    text: `Welcome to Phoenix Vacation Group! Your account has been created successfully. Email: ${userEmail}, Account ID: ${userId}. Start exploring cruises at ${process.env.FRONTEND_URL || 'http://localhost:5000'}`
  }),

  paymentStatus: (amount: string, createdAt: string, status: string, confirmationNumber?: string) => ({
    subject: `Payment ${status === 'paid' ? 'Confirmed' : 'Update'} - Phoenix Vacation Group`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${status === 'paid' ? '#059669' : status === 'failed' ? '#dc2626' : '#d97706'}; margin: 0; font-size: 28px;">
              ${status === 'paid' ? '✅' : status === 'failed' ? '❌' : '⏳'} Payment ${status === 'paid' ? 'Confirmed' : status === 'failed' ? 'Failed' : 'Processing'}
            </h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${status === 'paid' ? 'Great news! Your payment has been successfully processed.' : 
              status === 'failed' ? 'We encountered an issue processing your payment.' : 
              'Your payment is currently being processed.'}
          </p>
          
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Payment Details:</strong><br>
              Amount: $${amount}<br>
              Date: ${new Date(createdAt).toLocaleDateString()}<br>
              Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
              ${confirmationNumber ? `<br>Confirmation: ${confirmationNumber}` : ''}
            </p>
          </div>
          
          ${status === 'paid' ? `
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Your cruise booking is now confirmed! You'll receive your detailed itinerary and boarding information shortly.
            </p>
          ` : status === 'failed' ? `
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Please try a different payment method or contact our support team for assistance.
            </p>
          ` : `
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We'll notify you once the payment is complete.
            </p>
          `}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/reservations" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View My Reservations
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Questions? Contact our support team.<br>
            The Phoenix Vacation Group Team
          </p>
        </div>
      </div>
    `,
    text: `Payment ${status} - Amount: $${amount}, Date: ${new Date(createdAt).toLocaleDateString()}, Status: ${status}${confirmationNumber ? `, Confirmation: ${confirmationNumber}` : ''}`
  }),

  bookingStatus: (bookingDetails: any, status: string) => ({
    subject: `Booking ${status === 'confirmed' ? 'Confirmed' : 'Update'} - ${bookingDetails.cruise?.name || 'Your Cruise'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${status === 'confirmed' ? '#059669' : status === 'cancelled' ? '#dc2626' : '#d97706'}; margin: 0; font-size: 28px;">
              ${status === 'confirmed' ? '🎉' : status === 'cancelled' ? '❌' : '📝'} Booking ${status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Updated'}
            </h1>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            ${status === 'confirmed' ? 'Congratulations! Your cruise booking has been confirmed.' : 
              status === 'cancelled' ? 'Your booking has been cancelled as requested.' : 
              'Your booking details have been updated.'}
          </p>
          
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Booking Details:</strong><br>
              Cruise: ${bookingDetails.cruise?.name || 'N/A'}<br>
              Ship: ${bookingDetails.cruise?.ship || 'N/A'}<br>
              Departure: ${bookingDetails.cruise?.departureDate ? new Date(bookingDetails.cruise.departureDate).toLocaleDateString() : 'N/A'}<br>
              Guests: ${bookingDetails.guestCount || 'N/A'}<br>
              Cabin: ${bookingDetails.cabinType?.name || 'N/A'}<br>
              Confirmation: ${bookingDetails.confirmationNumber || 'N/A'}<br>
              Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
          
          ${status === 'confirmed' ? `
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Get ready for an amazing cruise experience! We'll send you detailed boarding information as your departure date approaches.
            </p>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/reservations" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Booking Details
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Safe travels!<br>
            The Phoenix Vacation Group Team
          </p>
        </div>
      </div>
    `,
    text: `Booking ${status} - ${bookingDetails.cruise?.name || 'Your Cruise'}, Confirmation: ${bookingDetails.confirmationNumber || 'N/A'}, Status: ${status}`
  })
};

// Get verified sender email - use environment variable or verified sender from account
const getVerifiedSender = () => {
  return process.env.SENDGRID_FROM_EMAIL || 'huzaifa6807@gmail.com';
};

// Email sending functions
export async function sendWelcomeEmail(userEmail: string, userId: string): Promise<boolean> {
  const template = EmailTemplates.welcome(userEmail, userId);
  return await sendEmail({
    to: userEmail,
    from: {
      email: getVerifiedSender(),
      name: 'Phoenix Vacation Group'
    },
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

export async function sendPaymentStatusEmail(
  userEmail: string, 
  amount: string, 
  createdAt: string, 
  status: string, 
  confirmationNumber?: string
): Promise<boolean> {
  const template = EmailTemplates.paymentStatus(amount, createdAt, status, confirmationNumber);
  return await sendEmail({
    to: userEmail,
    from: {
      email: getVerifiedSender(),
      name: 'Phoenix Vacation Group - Payments'
    },
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

export async function sendBookingStatusEmail(
  userEmail: string, 
  bookingDetails: any, 
  status: string
): Promise<boolean> {
  const template = EmailTemplates.bookingStatus(bookingDetails, status);
  
  let attachments: any[] = [];
  
  // Generate PDF invoice for confirmed bookings
  if (status === 'confirmed' && bookingDetails) {
    try {
      const invoiceData = {
        booking: bookingDetails,
        cruise: bookingDetails.cruise,
        cabinType: bookingDetails.cabinType,
        generatedAt: new Date().toISOString(),
        invoiceNumber: `INV-${bookingDetails.confirmationNumber}-${Date.now()}`
      };
      
      const pdfBuffer = await generateInvoicePDF(invoiceData);
      if (pdfBuffer) {
        attachments.push({
          content: pdfBuffer.toString('base64'),
          filename: `invoice-${bookingDetails.confirmationNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        });
        console.log(`PDF invoice attached to email for booking: ${bookingDetails.confirmationNumber}`);
      }
    } catch (error) {
      console.error('Failed to generate PDF invoice for email:', error);
      // Continue sending email without attachment if PDF generation fails
    }
  }
  
  return await sendEmail({
    to: userEmail,
    from: {
      email: getVerifiedSender(),
      name: 'Phoenix Vacation Group - Bookings'
    },
    subject: template.subject,
    html: template.html,
    text: template.text,
    attachments: attachments.length > 0 ? attachments : undefined
  });
}