// Try to import html-pdf-node, fallback if not available
let htmlPdf: any = null;
try {
  htmlPdf = require('html-pdf-node');
} catch (error) {
  console.log('html-pdf-node not available, PDF generation will be disabled');
}

interface InvoiceData {
  booking: any;
  cruise: any;
  cabinType: any;
  generatedAt: string;
  invoiceNumber: string;
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer | null> {
  if (!htmlPdf) {
    console.log('html-pdf-node not available, skipping PDF generation');
    return null;
  }

  try {
    const htmlContent = generateInvoiceHTML(invoiceData);

    const options = {
      format: 'A4' as const,
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      printBackground: true,
      displayHeaderFooter: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor',
      ],
    };

    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    console.log('PDF invoice generated successfully');
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    console.log(
      'PDF generation failed - system dependencies may be missing. Email will be sent without PDF attachment.'
    );
    return null;
  }
}

function generateInvoiceHTML(invoiceData: InvoiceData): string {
  const { booking, cruise, cabinType, generatedAt, invoiceNumber } = invoiceData;

  const formatCurrency = (amount: string | number, currency: string = 'USD') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin: 0;
        }
        .invoice-title {
          font-size: 24px;
          color: #666;
          margin: 10px 0;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-block {
          flex: 1;
        }
        .info-block h3 {
          color: #2563eb;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .booking-details {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          padding: 5px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-label {
          font-weight: bold;
          color: #4a5568;
        }
        .detail-value {
          color: #1a202c;
        }
        .price-breakdown {
          background-color: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 5px 0;
        }
        .total-row {
          border-top: 2px solid #2563eb;
          font-weight: bold;
          font-size: 18px;
          color: #2563eb;
          margin-top: 15px;
          padding-top: 15px;
        }
        .guest-info {
          margin: 20px 0;
        }
        .guest {
          background-color: #f1f5f9;
          padding: 10px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #666;
          font-size: 12px;
        }
        .payment-status {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status-paid {
          background-color: #d4fdd4;
          color: #166534;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="company-name">Phoenix Vacation Group</h1>
        <h2 class="invoice-title">Cruise Booking Invoice</h2>
      </div>

      <div class="invoice-info">
        <div class="info-block">
          <h3>Invoice Details</h3>
          <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p><strong>Generated:</strong> ${formatDate(generatedAt)}</p>
          <p><strong>Confirmation:</strong> ${booking.confirmationNumber}</p>
        </div>
        <div class="info-block">
          <h3>Payment Status</h3>
          <span class="payment-status ${booking.paymentStatus === 'completed' ? 'status-paid' : 'status-pending'}">
            ${booking.paymentStatus}
          </span>
        </div>
      </div>

      <div class="booking-details">
        <h3 style="color: #2563eb; margin-top: 0;">Cruise Details</h3>
        <div class="detail-row">
          <span class="detail-label">Cruise:</span>
          <span class="detail-value">${cruise?.name || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ship:</span>
          <span class="detail-value">${cruise?.ship || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cruise Line:</span>
          <span class="detail-value">${cruise?.cruiseLine || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Departure:</span>
          <span class="detail-value">${cruise?.departureDate ? formatDate(cruise.departureDate) : 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Return:</span>
          <span class="detail-value">${cruise?.returnDate ? formatDate(cruise.returnDate) : 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${cruise?.duration || 'N/A'} days</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Departure Port:</span>
          <span class="detail-value">${cruise?.departurePort || 'N/A'}</span>
        </div>
      </div>

      <div class="booking-details">
        <h3 style="color: #2563eb; margin-top: 0;">Accommodation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Cabin Type:</span>
          <span class="detail-value">${cabinType?.name || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cabin Category:</span>
          <span class="detail-value">${cabinType?.type || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${cabinType?.description || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Max Occupancy:</span>
          <span class="detail-value">${cabinType?.maxOccupancy || 'N/A'} guests</span>
        </div>
      </div>

      <div class="guest-info">
        <h3 style="color: #2563eb;">Guest Information</h3>
        <div class="detail-row">
          <span class="detail-label">Primary Guest:</span>
          <span class="detail-value">${booking.primaryGuestName || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${booking.primaryGuestEmail || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Guests:</span>
          <span class="detail-value">${booking.guestCount || 0}</span>
        </div>
        ${
          booking.guests && booking.guests.length > 0
            ? `
          <h4 style="margin: 15px 0 10px 0;">All Guests:</h4>
          ${booking.guests
            .map(
              (guest: any, index: number) => `
            <div class="guest">
              <strong>Guest ${index + 1}:</strong> ${guest.firstName} ${guest.lastName}
              ${guest.age ? ` (Age: ${guest.age})` : ''}
              ${guest.passportNumber ? ` | Passport: ${guest.passportNumber}` : ''}
            </div>
          `
            )
            .join('')}
        `
            : ''
        }
      </div>

      <div class="price-breakdown">
        <h3 style="color: #2563eb; margin-top: 0;">Price Breakdown</h3>
        <div class="price-row">
          <span>Base Cruise Price:</span>
          <span>${formatCurrency(cruise?.basePrice || '0', booking.currency)}</span>
        </div>
        ${
          cabinType?.priceModifier && parseFloat(cabinType.priceModifier) !== 1
            ? `
          <div class="price-row">
            <span>Cabin Upgrade (${cabinType.name}):</span>
            <span>${formatCurrency(parseFloat(cruise?.basePrice || '0') * (parseFloat(cabinType.priceModifier) - 1), booking.currency)}</span>
          </div>
        `
            : ''
        }
        <div class="price-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(parseFloat(booking.totalAmount) - parseFloat(booking.taxAmount || '0') - parseFloat(booking.gratuityAmount || '0'), booking.currency)}</span>
        </div>
        <div class="price-row">
          <span>Taxes & Fees:</span>
          <span>${formatCurrency(booking.taxAmount || '0', booking.currency)}</span>
        </div>
        <div class="price-row">
          <span>Gratuities:</span>
          <span>${formatCurrency(booking.gratuityAmount || '0', booking.currency)}</span>
        </div>
        <div class="price-row total-row">
          <span>Total Amount:</span>
          <span>${formatCurrency(booking.totalAmount || '0', booking.currency)}</span>
        </div>
      </div>

      <div class="footer">
        <p><strong>Phoenix Vacation Group</strong></p>
        <p>Thank you for choosing us for your cruise vacation!</p>
        <p>For questions or support, please contact us at support@phoenixvacationgroup.com</p>
        <p style="margin-top: 20px; font-size: 10px; color: #999;">
          This is a computer-generated invoice. No signature required.
        </p>
      </div>
    </body>
    </html>
  `;
}
