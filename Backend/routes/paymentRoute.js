// server/routes/paymentRoutes.js

import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ✅ Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use latest stable version
});

// ========================================
// ✅ CREATE PAYMENT INTENT
// ========================================
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, customerDetails } = req.body;

    console.log('💰 Creating payment intent:', {
      amount,
      currency,
      customerDetails: {
        name: customerDetails?.name,
        email: customerDetails?.email,
        phone: customerDetails?.phone
      }
    });

    // ✅ Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Amount must be greater than 0.'
      });
    }

    // ✅ Validate customer details
    if (!customerDetails || !customerDetails.name || !customerDetails.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer name and email are required'
      });
    }

    // ✅ Build shipping address
    const shippingAddress = customerDetails.address ? {
      name: customerDetails.name,
      address: {
        line1: customerDetails.address.line1 || '',
        city: customerDetails.address.city || '',
        postal_code: customerDetails.address.postal_code || '',
        country: customerDetails.address.country || 'GB'
      }
    } : undefined;

    // ✅ Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in pence/cents
      currency: currency || 'gbp',
      metadata: {
        customerName: customerDetails.name || '',
        customerEmail: customerDetails.email || '',
        customerPhone: customerDetails.phone || '',
        site: 'QASR-E-LIBAS',
        environment: process.env.NODE_ENV || 'development'
      },
      receipt_email: customerDetails.email,
      description: 'QASR-E-LIBAS LTD - Order Payment',
      shipping: shippingAddress,
      // ✅ Add automatic payment methods
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      // ✅ Add statement descriptor for bank statements
      statement_descriptor: 'QASR-E-LIBAS LTD',
      // ✅ Add statement descriptor suffix
      statement_descriptor_suffix: 'CLOTHING',
    });

    console.log('✅ Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('❌ Stripe Error:', error);
    
    // ✅ Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(402).json({
        success: false,
        error: error.message,
        code: error.code,
        decline_code: error.decline_code,
        type: 'card_error'
      });
    }

    if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        type: 'rate_limit_error'
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: error.message,
        type: 'invalid_request_error'
      });
    }

    // ✅ Generic error
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent',
      type: 'server_error'
    });
  }
});

// ========================================
// ✅ CONFIRM PAYMENT
// ========================================
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    console.log('🔍 Confirming payment:', paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    console.log('✅ Payment confirmed:', {
      id: paymentIntent.id,
      status: paymentIntent.status
    });

    res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// ✅ GET PAYMENT STATUS
// ========================================
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    console.log('🔍 Checking payment status:', paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      }
    });

  } catch (error) {
    console.error('❌ Payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// ✅ CANCEL PAYMENT
// ========================================
router.post('/cancel-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    console.log('🔍 Cancelling payment:', paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    console.log('✅ Payment cancelled:', {
      id: paymentIntent.id,
      status: paymentIntent.status
    });

    res.status(200).json({
      success: true,
      message: 'Payment cancelled successfully',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    });

  } catch (error) {
    console.error('❌ Cancel payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// ✅ REFUND PAYMENT
// ========================================
router.post('/refund-payment', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    console.log('🔍 Processing refund:', { paymentIntentId, amount, reason });

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount || undefined, // If not provided, refund full amount
      reason: reason || 'requested_by_customer'
    });

    console.log('✅ Refund processed:', {
      id: refund.id,
      amount: refund.amount,
      status: refund.status
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        currency: refund.currency
      }
    });

  } catch (error) {
    console.error('❌ Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// ✅ TEST ENDPOINT - Check Stripe Connection
// ========================================
router.get('/test-stripe', async (req, res) => {
  try {
    // ✅ Test Stripe connection
    const balance = await stripe.balance.retrieve();
    
    res.status(200).json({
      success: true,
      message: 'Stripe connection successful!',
      available_balance: balance.available.map(b => ({
        amount: b.amount / 100,
        currency: b.currency
      })),
      pending_balance: balance.pending.map(b => ({
        amount: b.amount / 100,
        currency: b.currency
      }))
    });
  } catch (error) {
    console.error('❌ Stripe connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      tip: 'Check your STRIPE_SECRET_KEY in .env file'
    });
  }
});

export default router;