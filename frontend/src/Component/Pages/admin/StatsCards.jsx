import React from 'react';

const StatsCards = ({ stats }) => {
  const cards = [
    { title: 'Total Sales', value: `£${stats?.totalSales?.toLocaleString() || '0'}`, icon: '💰', color: '#c6a43f' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: '#2196f3' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '⏳', color: '#ff9800' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: '🛍️', color: '#9c27b0' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#4caf50' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-info">
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;