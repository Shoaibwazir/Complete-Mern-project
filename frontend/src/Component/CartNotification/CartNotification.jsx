import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaCheckCircle, FaArrowRight, FaTimes } from 'react-icons/fa';
import './CartNotification.css';

const CartNotification = ({ product, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleGoToCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="cart-notification">
      <div className="notification-content">
        <div className="notification-icon">
          <FaCheckCircle />
        </div>
        <div className="notification-message">
          <h4>Added to Cart!</h4>
          <p>{product?.name} has been added to your cart.</p>
        </div>
        <div className="notification-actions">
          <button className="view-cart-btn" onClick={handleViewCart}>
            <FaShoppingCart /> View Cart
          </button>
          <button className="checkout-btn" onClick={handleGoToCheckout}>
            Go to Checkout <FaArrowRight />
          </button>
        </div>
        <button className="close-notification" onClick={() => { setIsVisible(false); onClose(); }}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default CartNotification;