import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency, bookingId, description } = req.body;

    if (!amount || !currency || !bookingId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Convert amount to cents for Stripe (Stripe expects amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Validate amount limits for different currencies
    const minAmounts = { usd: 50, eur: 50, sgd: 50, thb: 2000 }; // cents
    const maxAmounts = { usd: 99999999, eur: 99999999, sgd: 99999999, thb: 99999999 }; // cents

    const currencyLower = currency.toLowerCase();
    const minAmount = minAmounts[currencyLower as keyof typeof minAmounts] || 50;
    const maxAmount = maxAmounts[currencyLower as keyof typeof maxAmounts] || 99999999;

    if (amountInCents < minAmount) {
      return res.status(400).json({ 
        message: `Amount too small. Minimum amount for ${currency.toUpperCase()} is ${minAmount / 100}` 
      });
    }

    if (amountInCents > maxAmount) {
      return res.status(400).json({ 
        message: `Amount too large. Maximum amount for ${currency.toUpperCase()} is ${maxAmount / 100}` 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currencyLower,
      description: description || `Cruise booking ${bookingId}`,
      metadata: {
        bookingId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: "Error creating payment intent",
      details: error.message 
    });
  }
}