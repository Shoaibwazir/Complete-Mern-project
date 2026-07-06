// Backend/routes/bankVerification.js
// ✅ COMPLETE FIXED VERSION - WITH GET ROUTE

import express from 'express';

const router = express.Router();

// ========================================
// ✅ REAL BANK ACCOUNTS
// ========================================
const REAL_BANK_ACCOUNTS = {
  '35461763': {
    accountName: 'QASR-E-LIBAS LTD',
    bankName: 'REVOLUT Bank UK',
    sortCode: '230120',
    isActive: true,
    verified: true
  },
  '12345678': {
    accountName: 'QASR-E-LIBAS LTD',
    bankName: 'HSBC UK',
    sortCode: '123456',
    isActive: true,
    verified: true
  },
};

// ========================================
// ✅ GET ROUTE - For testing in browser
// ========================================
router.get('/verify-bank-account', (req, res) => {
  res.json({
    success: true,
    message: '✅ Bank Verification API is working!',
    instructions: {
      method: 'POST',
      url: '/api/verify-bank-account',
      body: {
        accountNumber: '35461763',
        sortCode: '230120',
        accountHolderName: 'QASR-E-LIBAS LTD',
        bankName: 'REVOLUT Bank UK'
      }
    },
    availableAccounts: Object.keys(REAL_BANK_ACCOUNTS).map(acc => ({
      accountNumber: acc,
      bankName: REAL_BANK_ACCOUNTS[acc].bankName,
      sortCode: REAL_BANK_ACCOUNTS[acc].sortCode
    }))
  });
});

// ========================================
// ✅ POST ROUTE - Verify Bank Account
// ========================================
router.post('/verify-bank-account', async (req, res) => {
  try {
    const { accountNumber, sortCode, accountHolderName, bankName } = req.body;
    
    console.log('🔍 Verifying bank account:', {
      accountNumber,
      sortCode,
      accountHolderName,
      bankName
    });
    
    // ✅ Validate all fields
    if (!accountNumber || !sortCode || !accountHolderName || !bankName) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'All fields are required'
      });
    }
    
    const cleanAccount = accountNumber.replace(/\D/g, '');
    const cleanSortCode = sortCode.replace(/\D/g, '');
    
    // ✅ Check length
    if (cleanAccount.length !== 8) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Account number must be exactly 8 digits'
      });
    }
    
    if (cleanSortCode.length !== 6) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Sort code must be 6 digits'
      });
    }
    
    // ✅ Check if account exists in REAL_BANK_ACCOUNTS
    if (REAL_BANK_ACCOUNTS[cleanAccount]) {
      const accountData = REAL_BANK_ACCOUNTS[cleanAccount];
      
      // Check sort code matches
      if (accountData.sortCode !== cleanSortCode) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: '❌ Sort code does not match our records. Please check and try again.'
        });
      }
      
      const verificationId = `VER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      console.log('✅ Bank account verified:', { 
        verificationId, 
        cleanAccount, 
        cleanSortCode,
        accountName: accountData.accountName
      });
      
      return res.json({
        success: true,
        valid: true,
        verificationId,
        message: '✅ Bank account verified successfully',
        accountDetails: {
          accountNumber: cleanAccount,
          sortCode: cleanSortCode,
          accountHolderName: accountData.accountName,
          bankName: accountData.bankName,
          isRealAccount: true
        }
      });
    }
    
    // ❌ Account not found
    console.log('❌ Bank account not found:', { cleanAccount });
    
    return res.status(400).json({
      success: false,
      valid: false,
      message: '❌ Invalid account number. Please check and try again.',
      errorCode: 'ACCOUNT_NOT_FOUND'
    });
    
  } catch (error) {
    console.error('❌ Bank verification error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Bank verification service unavailable. Please try again.',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// ========================================
// ✅ ADMIN API - Get all bank accounts
// ========================================
router.get('/admin/bank-accounts', async (req, res) => {
  try {
    const accounts = Object.keys(REAL_BANK_ACCOUNTS).map(accountNumber => ({
      accountNumber,
      ...REAL_BANK_ACCOUNTS[accountNumber]
    }));
    
    res.json({
      success: true,
      accounts
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank accounts'
    });
  }
});

// ========================================
// ✅ ADMIN API - Add bank account
// ========================================
router.post('/admin/bank-accounts', async (req, res) => {
  try {
    const { accountNumber, accountName, bankName, sortCode } = req.body;
    
    if (!accountNumber || !accountName || !bankName || !sortCode) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    const cleanAccount = accountNumber.replace(/\D/g, '');
    const cleanSortCode = sortCode.replace(/\D/g, '');
    
    if (cleanAccount.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'Account number must be 8 digits'
      });
    }
    
    if (cleanSortCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Sort code must be 6 digits'
      });
    }
    
    REAL_BANK_ACCOUNTS[cleanAccount] = {
      accountName,
      bankName,
      sortCode: cleanSortCode,
      isActive: true,
      verified: true,
      addedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Bank account added successfully',
      account: {
        accountNumber: cleanAccount,
        ...REAL_BANK_ACCOUNTS[cleanAccount]
      }
    });
  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bank account'
    });
  }
});

// ========================================
// ✅ ADMIN API - Delete bank account
// ========================================
router.delete('/admin/bank-accounts/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const cleanAccount = accountNumber.replace(/\D/g, '');
    
    if (REAL_BANK_ACCOUNTS[cleanAccount]) {
      delete REAL_BANK_ACCOUNTS[cleanAccount];
      res.json({
        success: true,
        message: 'Bank account removed successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }
  } catch (error) {
    console.error('Error removing bank account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bank account'
    });
  }
});

export default router;