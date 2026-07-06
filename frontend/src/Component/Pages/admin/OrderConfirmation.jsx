// src/Component/Pages/OrderConfirmation.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Clock,
  ArrowLeft,
  Download,
  Printer,
  Share2,
  ShoppingBag,
  CreditCard,
  Home,
  X,
  MessageCircle,
  AtSign,
  User,
  Building,
  FileText,
  Receipt,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // ✅ Get real order data from location state or localStorage
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
      return;
    }

    // ✅ Get the most recent order from localStorage (real data)
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      if (orders.length > 0) {
        // ✅ Get the latest order
        const latestOrder = orders[orders.length - 1];
        setOrder(latestOrder);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    }
    setLoading(false);
  }, [location.state]);

  // ✅ Generate Professional Invoice HTML with Real Data
  const generateInvoiceHTML = () => {
    if (!order) return '';

    const orderDate = new Date(order.orderDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    const deliveryDate = estimatedDelivery.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // ✅ Real customer data
    const customerName = order.customer?.firstName && order.customer?.lastName 
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : order.customer?.name || 'Customer';

    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice_${order.orderId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; padding: 40px 20px; color: #1a1a1a; }
        .invoice-container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .invoice-header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
        .logo-section h1 { font-size: 28px; letter-spacing: 1px; margin-bottom: 5px; }
        .logo-section p { opacity: 0.8; font-size: 14px; }
        .invoice-title h2 { font-size: 32px; font-weight: 300; margin-bottom: 8px; }
        .invoice-title p { text-align: right; font-size: 14px; opacity: 0.9; }
        .invoice-details { padding: 30px 40px; background: #fafafa; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .detail-box { flex: 1; }
        .detail-box h4 { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-box p { font-size: 16px; margin-bottom: 4px; color: #1a1a1a; }
        .status-badge { display: inline-block; background: #4caf50; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .items-table { padding: 30px 40px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e0e0e0; color: #666; font-weight: 600; font-size: 14px; }
        td { padding: 16px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
        .item-name { font-weight: 500; }
        .totals-section { padding: 20px 40px 30px; background: #fafafa; border-top: 1px solid #e0e0e0; }
        .totals { max-width: 300px; margin-left: auto; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #ddd; margin-top: 8px; padding-top: 16px; }
        .footer { padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; background: white; }
        .thankyou { font-size: 16px; color: #4caf50; margin-bottom: 8px; }
        .customer-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media print { body { background: white; padding: 0; } }
        @media (max-width: 768px) { .customer-details { grid-template-columns: 1fr; } .invoice-header { flex-direction: column; gap: 20px; } .invoice-title h2 { font-size: 24px; } }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="logo-section">
            <h1>QASR-E-LIBAS</h1>
            <p>Luxury Fashion Store</p>
          </div>
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p>#${order.orderId}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="detail-box">
            <h4>Order Date</h4>
            <p>${orderDate}</p>
          </div>
          <div class="detail-box">
            <h4>Estimated Delivery</h4>
            <p>${deliveryDate}</p>
          </div>
          <div class="detail-box">
            <h4>Status</h4>
            <span class="status-badge">${order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'Shipped' : 'Confirmed'}</span>
          </div>
        </div>
        
        <div class="invoice-details" style="background: white; border-bottom: none; padding-top: 0;">
          <div class="customer-details">
            <div class="detail-box">
              <h4>Bill To</h4>
              <p><strong>${customerName}</strong></p>
              <p>${order.customer?.address || 'N/A'}</p>
              ${order.customer?.apartment ? `<p>${order.customer?.apartment}</p>` : ''}
              <p>${order.customer?.city || ''}, ${order.customer?.postalCode || ''}</p>
              <p>${order.customer?.country || 'United Kingdom'}</p>
              <p>📧 ${order.customer?.email || 'N/A'}</p>
              <p>📞 ${order.customer?.phone || 'N/A'}</p>
            </div>
            <div class="detail-box">
              <h4>Payment Method</h4>
              <p>${order.paymentMethod === 'card' ? '💳 Credit/Debit Card' : 
                 order.paymentMethod === 'paypal' ? '📱 PayPal' : 
                 order.paymentMethod === 'banktransfer' ? '🏦 Bank Transfer' : 
                 '💳 Credit/Debit Card'}</p>
              <p>Transaction ID: <strong>${order.transactionId || 'TXN-' + order.orderId.slice(-8)}</strong></p>
              <p>Status: <span style="color:#4caf50;">✓ ${order.paymentStatus === 'paid' ? 'Paid' : 'Completed'}</span></p>
            </div>
          </div>
        </div>
        
        <div class="items-table">
          <table>
            <thead>
              <tr><th>Item</th><th>Quantity</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th></tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td class="item-name">${item.name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td style="text-align:right;">£${(item.price || 0).toFixed(2)}</td>
                  <td style="text-align:right;">£${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals-section">
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>£${(order.subtotal || 0).toFixed(2)}</span></div>
            ${order.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-£${(order.discount || 0).toFixed(2)}</span></div>` : ''}
            <div class="total-row"><span>Shipping</span><span>${order.shipping === 0 ? 'FREE' : `£${(order.shipping || 0).toFixed(2)}`}</span></div>
            <div class="total-row"><span>Tax (20% VAT)</span><span>£${(order.tax || 0).toFixed(2)}</span></div>
            <div class="total-row grand-total"><span>Grand Total</span><span>£${(order.total || 0).toFixed(2)}</span></div>
          </div>
        </div>
        
        <div class="footer">
          <div class="thankyou">✨ Thank you for shopping with QASR-E-LIBAS! ✨</div>
          <p>If you have any questions, please contact info@qasrelibas.co.uk | +44 7979 389080</p>
          <p>This is a system generated invoice, no signature required.</p>
        </div>
      </div>
    </body>
    </html>`;
  };

  // ✅ Download Invoice
  const handleDownloadInvoice = () => {
    try {
      const invoiceHTML = generateInvoiceHTML();
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${order.orderId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  // ✅ Share via WhatsApp
  const shareViaWhatsApp = () => {
    const customerName = order.customer?.firstName && order.customer?.lastName 
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : 'Customer';

    const message = encodeURIComponent(
      `🎉 *QASR-E-LIBAS Order Confirmation!* 🎉\n\n` +
      `*Customer:* ${customerName}\n` +
      `*Order #:* ${order.orderId}\n` +
      `*Order Date:* ${new Date(order.orderDate).toLocaleDateString('en-GB')}\n` +
      `*Total Amount:* £${(order.total || 0).toFixed(2)}\n` +
      `*Items:* ${order.items?.length || 0} item(s)\n\n` +
      `Thank you for shopping with QASR-E-LIBAS! ✨`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowShareModal(false);
    toast.success('Opening WhatsApp...');
  };

  // ✅ Share via Email
  const shareViaEmail = () => {
    const customerName = order.customer?.firstName && order.customer?.lastName 
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : 'Customer';

    const subject = encodeURIComponent(`Order Confirmation - ${order.orderId}`);
    const body = encodeURIComponent(
      `Dear ${customerName},\n\n` +
      `Thank you for your order with QASR-E-LIBAS!\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 ORDER DETAILS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Order Number: ${order.orderId}\n` +
      `Order Date: ${new Date(order.orderDate).toLocaleDateString('en-GB')}\n` +
      `Order Status: Confirmed\n` +
      `Payment Method: ${order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                        order.paymentMethod === 'paypal' ? 'PayPal' : 
                        order.paymentMethod === 'banktransfer' ? 'Bank Transfer' : 'Card'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛍️ ITEMS ORDERED\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${order.items?.map(item => `• ${item.name} x ${item.quantity} = £${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`).join('\n')}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 ORDER SUMMARY\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Subtotal: £${(order.subtotal || 0).toFixed(2)}\n` +
      `Shipping: ${order.shipping === 0 ? 'FREE' : `£${(order.shipping || 0).toFixed(2)}`}\n` +
      `Tax (VAT): £${(order.tax || 0).toFixed(2)}\n` +
      `TOTAL: £${(order.total || 0).toFixed(2)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 SHIPPING ADDRESS\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `${customerName}\n` +
      `${order.customer?.address || 'N/A'}\n` +
      `${order.customer?.city || ''}, ${order.customer?.postalCode || ''}\n` +
      `${order.customer?.country || 'United Kingdom'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Thank you for shopping with QASR-E-LIBAS! ✨\n` +
      `For any questions, contact us at info@qasrelibas.co.uk\n\n` +
      `Best regards,\n` +
      `The QASR-E-LIBAS Team`
    );
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
    setShowShareModal(false);
    toast.success('Opening email client...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="confirmation-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  // ✅ No order found
  if (!order) {
    return (
      <div className="confirmation-error">
        <div className="error-icon">⚠️</div>
        <h2>Order Not Found</h2>
        <p>We couldn't find your order details.</p>
        <Link to="/shop" className="shop-again-btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  // ✅ Get real customer name
  const customerName = order.customer?.firstName && order.customer?.lastName 
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : order.customer?.name || 'Customer';

  // ✅ Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ Get order status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  // ✅ Get order status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Confirmed';
    }
  };

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>
          <h1>Thank You for Your Order!</h1>
          <p>Your order has been placed successfully</p>
          <div className="order-number">
            <span>Order #</span>
            <strong>{order.orderId}</strong>
          </div>
          <div className="order-date">
            <Calendar size={14} />
            <span>Placed on {new Date(order.orderDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleDownloadInvoice} className="action-btn">
            <Download size={18} /> Download Invoice
          </button>
          <button onClick={handlePrint} className="action-btn">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleShareClick} className="action-btn">
            <Share2 size={18} /> Share
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <div className="share-modal-header">
                <h3>Share Order Details</h3>
                <button className="close-modal" onClick={() => setShowShareModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="share-options">
                <button className="share-option whatsapp" onClick={shareViaWhatsApp}>
                  <MessageCircle size={24} />
                  <div>
                    <strong>WhatsApp</strong>
                    <p>Share via WhatsApp</p>
                  </div>
                </button>
                <button className="share-option email" onClick={shareViaEmail}>
                  <AtSign size={24} />
                  <div>
                    <strong>Email</strong>
                    <p>Share via Email</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Status Timeline */}
        <div className="order-status-section">
          <h3>Order Status</h3>
          <div className="status-timeline">
            <div className={`status-step ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
              <div className="status-dot"></div>
              <div className="status-content">
                <strong>Order Confirmed</strong>
                <span>We've received your order</span>
              </div>
            </div>
            <div className={`status-step ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
              <div className="status-dot"></div>
              <div className="status-content">
                <strong>Processing</strong>
                <span>Preparing your items</span>
              </div>
            </div>
            <div className={`status-step ${order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
              <div className="status-dot"></div>
              <div className="status-content">
                <strong>Shipped</strong>
                <span>On its way to you</span>
              </div>
            </div>
            <div className={`status-step ${order.status === 'delivered' ? 'completed' : ''}`}>
              <div className="status-dot"></div>
              <div className="status-content">
                <strong>Delivered</strong>
                <span>Successfully delivered</span>
              </div>
            </div>
          </div>
          <div className={`status-badge ${getStatusClass(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="delivery-info">
          <div className="info-card">
            <Truck size={20} />
            <div className="info-content">
              <strong>Estimated Delivery</strong>
              <p>{getEstimatedDelivery()}</p>
            </div>
          </div>
          <div className="info-card">
            <Package size={20} />
            <div className="info-content">
              <strong>Shipping Method</strong>
              <p>Royal Mail Tracked 48</p>
            </div>
          </div>
          <div className="info-card">
            <Clock size={20} />
            <div className="info-content">
              <strong>Tracking Number</strong>
              <p>Will be emailed within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h3>Order Summary</h3>
          
          <div className="order-items">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                  <span className="item-quantity">{item.quantity}</span>
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>£{(item.price || 0).toFixed(2)} each</p>
                </div>
                <div className="item-total">
                  £{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>£{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="total-row discount">
                <span>Discount</span>
                <span>-£{(order.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : `£${(order.shipping || 0).toFixed(2)}`}</span>
            </div>
            <div className="total-row">
              <span>Tax (20% VAT)</span>
              <span>£{(order.tax || 0).toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>£{(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Billing Information - Real Customer Data */}
        <div className="customer-info-section">
          <div className="info-column">
            <h3><MapPin size={18} /> Shipping Address</h3>
            <div className="address-details">
              <p><strong>{customerName}</strong></p>
              <p>{order.customer?.address || 'N/A'}</p>
              {order.customer?.apartment && <p>{order.customer?.apartment}</p>}
              <p>{order.customer?.city || ''}, {order.customer?.postalCode || ''}</p>
              <p>{order.customer?.country || 'United Kingdom'}</p>
              <p className="contact-info">
                <Phone size={12} /> {order.customer?.phone || 'N/A'}
              </p>
              <p className="contact-info">
                <Mail size={12} /> {order.customer?.email || 'N/A'}
              </p>
            </div>
          </div>
          <div className="info-column">
            <h3><CreditCard size={18} /> Payment Method</h3>
            <div className="payment-details">
              <div className="payment-method-badge">
                {order.paymentMethod === 'card' && '💳 Credit/Debit Card'}
                {order.paymentMethod === 'paypal' && '📱 PayPal'}
                {order.paymentMethod === 'apple' && '🍎 Apple Pay'}
                {order.paymentMethod === 'banktransfer' && '🏦 Bank Transfer'}
                {!order.paymentMethod && '💳 Credit/Debit Card'}
              </div>
              <p>Your payment has been processed securely.</p>
              <div className="secure-badge">
                <CheckCircle size={14} /> {order.paymentStatus === 'paid' ? 'Payment Confirmed' : 'Payment Completed'}
              </div>
            </div>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="need-help-section">
          <h3>Need Help?</h3>
          <p>If you have any questions about your order, our support team is here to help.</p>
          <div className="help-buttons">
            <Link to="/contact" className="help-btn">
              Contact Support
            </Link>
            <Link to="/track" className="help-btn secondary">
              Track Your Order
            </Link>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="continue-section">
          <Link to="/womens" className="continue-shopping-link">
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          <Link to="/" className="home-link">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;