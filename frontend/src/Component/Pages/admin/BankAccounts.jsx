// src/Component/Admin/BankAccounts.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Building,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import './BankAccounts.css';

const BankAccounts = () => {
  // ✅ Get user info from Redux
  const { userInfo } = useSelector((state) => state.auth);
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    sortCode: ''
  });

  // ✅ Fetch accounts on component mount
  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      toast.error('Access denied. Admin only.');
      return;
    }
    fetchAccounts();
  }, [userInfo]);

  // ✅ Get auth config with token
  const getAuthConfig = () => {
    const token = userInfo?.token;
    if (!token) {
      toast.error('Please login again');
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // ✅ Fetch all bank accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const config = getAuthConfig();
      if (!config) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/admin/bank-accounts', config);
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load bank accounts');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle add account
  const handleAddAccount = async (e) => {
    e.preventDefault();
    
    // ✅ Validate fields
    if (!newAccount.accountNumber || newAccount.accountNumber.length !== 8) {
      toast.error('Account number must be exactly 8 digits');
      return;
    }
    
    if (!newAccount.sortCode || newAccount.sortCode.length !== 6) {
      toast.error('Sort code must be exactly 6 digits');
      return;
    }
    
    if (!newAccount.accountName.trim()) {
      toast.error('Account name is required');
      return;
    }
    
    if (!newAccount.bankName.trim()) {
      toast.error('Bank name is required');
      return;
    }
    
    try {
      const config = getAuthConfig();
      if (!config) return;
      
      await axios.post('/api/admin/bank-accounts', newAccount, config);
      toast.success('Bank account added successfully! ✅');
      setNewAccount({ accountNumber: '', accountName: '', bankName: '', sortCode: '' });
      setShowAddForm(false);
      fetchAccounts(); // ✅ Refresh the list
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add account');
      }
    }
  };

  // ✅ Handle remove account
  const handleRemoveAccount = async (accountNumber) => {
    if (!confirm(`Are you sure you want to remove account ${accountNumber}?`)) return;
    
    try {
      const config = getAuthConfig();
      if (!config) return;
      
      await axios.delete(`/api/admin/bank-accounts/${accountNumber}`, config);
      toast.success('Bank account removed successfully! 🗑️');
      fetchAccounts(); // ✅ Refresh the list
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to remove account');
      }
    }
  };

  // ✅ Handle toggle account status (Activate/Deactivate)
  const handleToggleAccount = async (accountNumber) => {
    try {
      const config = getAuthConfig();
      if (!config) return;
      
      await axios.patch(`/api/admin/bank-accounts/${accountNumber}/toggle`, {}, config);
      toast.success('Account status updated! 🔄');
      fetchAccounts(); // ✅ Refresh the list
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to update account status');
      }
    }
  };

  // ✅ Handle edit account
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setNewAccount({
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      bankName: account.bankName,
      sortCode: account.sortCode
    });
    setShowAddForm(true);
  };

  // ✅ Handle update account
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    
    if (!newAccount.accountNumber || newAccount.accountNumber.length !== 8) {
      toast.error('Account number must be exactly 8 digits');
      return;
    }
    
    if (!newAccount.sortCode || newAccount.sortCode.length !== 6) {
      toast.error('Sort code must be exactly 6 digits');
      return;
    }
    
    try {
      const config = getAuthConfig();
      if (!config) return;
      
      await axios.put(`/api/admin/bank-accounts/${editingAccount.accountNumber}`, newAccount, config);
      toast.success('Bank account updated successfully! 📝');
      setNewAccount({ accountNumber: '', accountName: '', bankName: '', sortCode: '' });
      setShowAddForm(false);
      setEditingAccount(null);
      fetchAccounts(); // ✅ Refresh the list
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update account');
      }
    }
  };

  // ✅ Handle cancel form
  const handleCancelForm = () => {
    setNewAccount({ accountNumber: '', accountName: '', bankName: '', sortCode: '' });
    setShowAddForm(false);
    setEditingAccount(null);
  };

  // ✅ Handle input change with formatting
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'accountNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 8);
      setNewAccount(prev => ({ ...prev, [name]: cleaned }));
      return;
    }
    
    if (name === 'sortCode') {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      setNewAccount(prev => ({ ...prev, [name]: cleaned }));
      return;
    }
    
    setNewAccount(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="bank-accounts-loading">
        <div className="spinner"></div>
        <p>Loading bank accounts...</p>
      </div>
    );
  }

  return (
    <div className="bank-accounts-admin">
      {/* Header */}
      <div className="bank-accounts-header">
        <div className="header-left">
          <CreditCard size={28} />
          <h2>Bank Account Management</h2>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={fetchAccounts}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            className="add-btn-header"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                setEditingAccount(null);
                setNewAccount({ accountNumber: '', accountName: '', bankName: '', sortCode: '' });
              }
            }}
          >
            <Plus size={16} /> {showAddForm ? 'Cancel' : 'Add Account'}
          </button>
        </div>
      </div>

      {/* Add/Edit Account Form */}
      {showAddForm && (
        <div className="add-account-form">
          <h3>{editingAccount ? '✏️ Edit Bank Account' : '➕ Add New Bank Account'}</h3>
          <form onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}>
            <div className="form-grid">
              <div className="form-group">
                <label>Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={newAccount.accountNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 35461763"
                  required
                  maxLength="8"
                  disabled={!!editingAccount}
                />
                <small>8 digits (e.g., 12345678)</small>
              </div>
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  name="accountName"
                  value={newAccount.accountName}
                  onChange={handleInputChange}
                  placeholder="e.g., QASR-E-LIBAS LTD"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  name="bankName"
                  value={newAccount.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g., REVOLUT Bank UK"
                  required
                />
              </div>
              <div className="form-group">
                <label>Sort Code *</label>
                <input
                  type="text"
                  name="sortCode"
                  value={newAccount.sortCode}
                  onChange={handleInputChange}
                  placeholder="e.g., 230120"
                  required
                  maxLength="6"
                />
                <small>6 digits (e.g., 123456)</small>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="accounts-list">
        <div className="list-header">
          <h3>Active Bank Accounts</h3>
          <span className="account-count">{accounts.length} accounts</span>
        </div>
        
        {accounts.length === 0 ? (
          <div className="no-accounts">
            <div className="no-accounts-icon">🏦</div>
            <p>No bank accounts configured</p>
            <p className="no-accounts-sub">Click "Add Account" to add your first bank account</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account, index) => (
              <div key={index} className="account-card">
                <div className="account-card-header">
                  <div className="account-icon">
                    <Building size={24} />
                  </div>
                  <div className="account-status">
                    <span className={`status-badge ${account.isActive !== false ? 'active' : 'inactive'}`}>
                      {account.isActive !== false ? (
                        <><CheckCircle size={12} /> Active</>
                      ) : (
                        <><XCircle size={12} /> Inactive</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="account-card-body">
                  <h4>{account.accountName}</h4>
                  <div className="account-details">
                    <p><strong>Account:</strong> {account.accountNumber}</p>
                    <p><strong>Bank:</strong> {account.bankName}</p>
                    <p><strong>Sort Code:</strong> {account.sortCode}</p>
                  </div>
                </div>
                <div className="account-card-actions">
                  <button 
                    className="action-btn toggle"
                    onClick={() => handleToggleAccount(account.accountNumber)}
                    title={account.isActive !== false ? 'Deactivate' : 'Activate'}
                  >
                    {account.isActive !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditAccount(account)}
                    title="Edit Account"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleRemoveAccount(account.accountNumber)}
                    title="Remove Account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccounts;