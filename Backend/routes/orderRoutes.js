import express from 'express';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getEmailConfig, sendEmail } from '../utils/emailService.js';

const router = express.Router();

const buildOrderEmailHtml = (title, order, customer) => {
  const itemsHtml = (order.orderItems || [])
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}</td>` +
        `<td style="padding:8px;border-bottom:1px solid #eee;">£${Number(item.price).toFixed(2)}</td></tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;}
  .container{max-width:620px;margin:0 auto;background:#fff;padding:28px;border-radius:12px;}
  .header{text-align:center;border-bottom:3px solid #c5a880;padding-bottom:16px;margin-bottom:20px;}
  .gold{color:#c5a880;}
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{text-align:left;padding:8px;background:#f9fafb;font-size:13px;}
  .total{font-size:18px;font-weight:700;color:#1a1a2e;margin-top:12px;}
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>QASR-E-<span class="gold">LIBAS</span></h1><p>${title}</p></div>
    <p><strong>Order:</strong> ${order.orderNumber || order._id}</p>
    <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName} (${customer.email})</p>
    <p><strong>Phone:</strong> ${customer.phone || '—'}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod} — ${order.isPaid ? 'Paid' : 'Pending'}</p>
    <p><strong>Address:</strong> ${customer.address}, ${customer.city}, ${customer.postalCode}, ${customer.country}</p>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p class="total">Total: £${Number(order.totalPrice).toFixed(2)}</p>
  </div>
</body></html>`;
};

const sendOrderNotifications = async (order, customer) => {
  const { adminEmail, adminCcEmail } = getEmailConfig();

  await sendEmail({
    to: adminEmail,
    cc: adminCcEmail,
    replyTo: customer.email,
    subject: `🛍️ New Order ${order.orderNumber || order._id} — QASR-E-LIBAS LTD`,
    html: buildOrderEmailHtml('New Order Received', order, customer),
  });

  await sendEmail({
    to: customer.email,
    subject: `Order Confirmation — ${order.orderNumber || order._id}`,
    html: buildOrderEmailHtml('Thank You For Your Order', order, customer),
  });
};

// @desc    Guest checkout (no login required)
// @route   POST /api/orders/guest
// @access  Public
router.post('/guest', async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult,
      isPaid,
      status,
      orderNumber,
    } = req.body;

    if (!orderItems?.length) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress?.email || !shippingAddress?.firstName) {
      return res.status(400).json({ message: 'Customer details are required' });
    }

    const generatedOrderNumber =
      orderNumber || `QEL-${Date.now().toString(36).toUpperCase()}`;

    const order = new Order({
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      itemsPrice: itemsPrice ?? 0,
      taxPrice: taxPrice ?? 0,
      shippingPrice: shippingPrice ?? 0,
      totalPrice: totalPrice ?? 0,
      orderNumber: generatedOrderNumber,
      isPaid: Boolean(isPaid),
      paidAt: isPaid ? Date.now() : undefined,
      status: status || (isPaid ? 'processing' : 'pending'),
      paymentResult: paymentResult || undefined,
    });

    const createdOrder = await order.save();

    try {
      await sendOrderNotifications(createdOrder, shippingAddress);
    } catch (emailError) {
      console.error('Order email notification failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      order: createdOrder,
      orderNumber: generatedOrderNumber,
    });
  } catch (error) {
    console.error('Guest order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Track an order by order number (public, optional email check)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    if (!orderNumber?.trim()) {
      return res.status(400).json({ success: false, message: 'Order number is required' });
    }

    const order = await Order.findOne({
      orderNumber: new RegExp(`^${orderNumber.trim()}$`, 'i'),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found with this number. Please check and try again.',
      });
    }

    // Optional extra verification — if email is provided, it must match
    if (email && order.shippingAddress?.email?.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(404).json({
        success: false,
        message: 'No order found matching this order number and email.',
      });
    }

    // Build a simple tracking history from the order's known state
    const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusSteps.indexOf(order.status);

    const trackingHistory = [
      {
        status: 'Order Placed',
        date: order.createdAt ? new Date(order.createdAt).toLocaleString() : null,
        description: 'Your order has been confirmed',
        completed: true,
      },
      {
        status: 'Processing',
        date: currentIndex >= 1 ? new Date(order.updatedAt || order.createdAt).toLocaleString() : null,
        description: 'Your order is being prepared',
        completed: currentIndex >= 1,
      },
      {
        status: 'Shipped',
        date: currentIndex >= 2 ? new Date(order.updatedAt || order.createdAt).toLocaleString() : null,
        description: 'Your order has been dispatched',
        completed: currentIndex >= 2,
      },
      {
        status: 'Delivered',
        date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : null,
        description: 'Your order has been delivered',
        completed: Boolean(order.isDelivered),
      },
    ];

    const responseOrder = {
      orderNumber: order.orderNumber || order._id,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery || null,
      carrier: order.carrier || null,
      trackingNumber: order.trackingNumber || null,
      trackingUrl: order.trackingUrl || null,
      items: (order.orderItems || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        firstName: order.shippingAddress?.firstName,
        lastName: order.shippingAddress?.lastName,
        address: order.shippingAddress?.address,
        city: order.shippingAddress?.city,
        postalCode: order.shippingAddress?.postalCode,
        country: order.shippingAddress?.country,
      },
      trackingHistory,
    };

    res.json({ success: true, order: responseOrder });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tracking info' });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'processing';
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time
      };
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== ADMIN ROUTES ==========

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = status;
      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      await order.save();
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await order.deleteOne();
    res.json({ message: 'Order removed successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;