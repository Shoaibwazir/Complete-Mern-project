// src/utils/validation.js
// ✅ COMPLETE VALIDATION FILE

// ========================================
// COUNTRY LIST
// ========================================
export const countryList = [
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'New Zealand', label: '🇳🇿 New Zealand' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Italy', label: '🇮🇹 Italy' },
  { value: 'Spain', label: '🇪🇸 Spain' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' },
  { value: 'Belgium', label: '🇧🇪 Belgium' },
  { value: 'Sweden', label: '🇸🇪 Sweden' },
  { value: 'Norway', label: '🇳🇴 Norway' },
  { value: 'Denmark', label: '🇩🇰 Denmark' },
  { value: 'Finland', label: '🇫🇮 Finland' },
  { value: 'Ireland', label: '🇮🇪 Ireland' },
  { value: 'Switzerland', label: '🇨🇭 Switzerland' },
  { value: 'Austria', label: '🇦🇹 Austria' },
  { value: 'Greece', label: '🇬🇷 Greece' },
  { value: 'Portugal', label: '🇵🇹 Portugal' },
  { value: 'Poland', label: '🇵🇱 Poland' },
  { value: 'Turkey', label: '🇹🇷 Turkey' },
  { value: 'Russia', label: '🇷🇺 Russia' },
  { value: 'Ukraine', label: '🇺🇦 Ukraine' },
  { value: 'Romania', label: '🇷🇴 Romania' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'Pakistan', label: '🇵🇰 Pakistan' },
  { value: 'Bangladesh', label: '🇧🇩 Bangladesh' },
  { value: 'Sri Lanka', label: '🇱🇰 Sri Lanka' },
  { value: 'Nepal', label: '🇳🇵 Nepal' },
  { value: 'UAE', label: '🇦🇪 UAE' },
  { value: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' },
  { value: 'Qatar', label: '🇶🇦 Qatar' },
  { value: 'Kuwait', label: '🇰🇼 Kuwait' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'China', label: '🇨🇳 China' },
  { value: 'South Korea', label: '🇰🇷 South Korea' },
  { value: 'Malaysia', label: '🇲🇾 Malaysia' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Hong Kong', label: '🇭🇰 Hong Kong' },
  { value: 'South Africa', label: '🇿🇦 South Africa' },
  { value: 'Egypt', label: '🇪🇬 Egypt' },
  { value: 'Morocco', label: '🇲🇦 Morocco' },
  { value: 'Nigeria', label: '🇳🇬 Nigeria' },
  { value: 'Kenya', label: '🇰🇪 Kenya' },
  { value: 'Brazil', label: '🇧🇷 Brazil' },
  { value: 'Mexico', label: '🇲🇽 Mexico' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Chile', label: '🇨🇱 Chile' },
  { value: 'Colombia', label: '🇨🇴 Colombia' },
  { value: 'Peru', label: '🇵🇪 Peru' },
  { value: 'Other', label: '🌍 Other' },
];

// ========================================
// ✅ COUNTRY PHONE REGEX
// ========================================
export const countryPhoneRegex = {
  'United Kingdom': /^(?:(?:\+44|0)(?:\d\s?){10,11})$/,
  'United States': /^(?:\+1|1)?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  'Canada': /^(?:\+1|1)?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
  'Australia': /^(?:\+61|0)(?:[2-478]\d{8}|\d{9})$/,
  'New Zealand': /^(?:\+64|0)[2-9]\d{7,9}$/,
  'Germany': /^(?:\+49|0)[1-9]\d{9,11}$/,
  'France': /^(?:\+33|0)[1-9]\d{8}$/,
  'Italy': /^(?:\+39|0)\d{9,11}$/,
  'Spain': /^(?:\+34|0)[6-9]\d{8}$/,
  'Netherlands': /^(?:\+31|0)[1-9]\d{8}$/,
  'Belgium': /^(?:\+32|0)[4-9]\d{7,8}$/,
  'Sweden': /^(?:\+46|0)[1-9]\d{7,8}$/,
  'Norway': /^(?:\+47|0)[2-9]\d{7}$/,
  'Denmark': /^(?:\+45|0)[2-9]\d{7}$/,
  'Finland': /^(?:\+358|0)[1-9]\d{7,9}$/,
  'Ireland': /^(?:\+353|0)[1-9]\d{7,8}$/,
  'Switzerland': /^(?:\+41|0)[2-9]\d{8}$/,
  'Austria': /^(?:\+43|0)[1-9]\d{8,10}$/,
  'Greece': /^(?:\+30|0)[2-9]\d{9}$/,
  'Portugal': /^(?:\+351|0)[2-9]\d{8}$/,
  'Poland': /^(?:\+48|0)[1-9]\d{8}$/,
  'Turkey': /^(?:\+90|0)[1-9]\d{9,10}$/,
  'Russia': /^(?:\+7|8)\d{10}$/,
  'Ukraine': /^(?:\+380|0)[1-9]\d{8}$/,
  'Romania': /^(?:\+40|0)[1-9]\d{8}$/,
  'India': /^(?:\+91|0)[6-9]\d{9}$/,
  'Pakistan': /^(?:\+92|0)[3-4]\d{9}$/,
  'Bangladesh': /^(?:\+880|0)[1-9]\d{8,9}$/,
  'Sri Lanka': /^(?:\+94|0)[1-9]\d{8}$/,
  'Nepal': /^(?:\+977|0)[9]\d{8,9}$/,
  'UAE': /^(?:\+971|0)[1-9]\d{8}$/,
  'Saudi Arabia': /^(?:\+966|0)[1-9]\d{8}$/,
  'Qatar': /^(?:\+974|0)[1-9]\d{7}$/,
  'Kuwait': /^(?:\+965|0)[1-9]\d{7}$/,
  'Japan': /^(?:\+81|0)[1-9]\d{9}$/,
  'China': /^(?:\+86|0)[1-9]\d{10}$/,
  'South Korea': /^(?:\+82|0)[1-9]\d{8,9}$/,
  'Malaysia': /^(?:\+60|0)[1-9]\d{8,9}$/,
  'Singapore': /^(?:\+65|0)[1-9]\d{7}$/,
  'Hong Kong': /^(?:\+852|0)[1-9]\d{7}$/,
  'South Africa': /^(?:\+27|0)[1-9]\d{8}$/,
  'Egypt': /^(?:\+20|0)[1-9]\d{9}$/,
  'Morocco': /^(?:\+212|0)[1-9]\d{9}$/,
  'Nigeria': /^(?:\+234|0)[7-9]\d{9}$/,
  'Kenya': /^(?:\+254|0)[1-9]\d{9}$/,
  'Brazil': /^(?:\+55|0)[1-9]\d{9,10}$/,
  'Mexico': /^(?:\+52|0)[1-9]\d{9,10}$/,
  'Argentina': /^(?:\+54|0)[1-9]\d{9}$/,
  'Chile': /^(?:\+56|0)[1-9]\d{8}$/,
  'Colombia': /^(?:\+57|0)[1-9]\d{9}$/,
  'Peru': /^(?:\+51|0)[1-9]\d{9}$/,
  'Other': /^\+?\d{8,15}$/,
};

// ========================================
// ✅ VALIDATION FUNCTIONS
// ========================================

// ✅ NAME VALIDATION
export const validateInternationalName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (trimmed.length > 50) return false;
  // Allow letters, spaces, hyphens, apostrophes, dots
  const nameRegex = /^[a-zA-Z\s\-'\.]{2,50}$/;
  return nameRegex.test(trimmed);
};

// ✅ EMAIL VALIDATION
export const validateInternationalEmail = (email) => {
  if (!email) return false;
  const trimmed = email.trim();
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;
  
  // Block temporary email domains
  const tempEmailDomains = [
    'tempmail', 'throwaway', '10minutemail', 'guerrillamail',
    'dispostable', 'mailinator', 'yopmail', 'trashmail',
    'spamgourmet', 'sogetthis', 'spambox', 'fakeinbox',
    'tempinbox', 'mailnesia', 'guerrillamail', 'jetable',
    'mailexpire', 'spambox', 'throwawaymail', 'mailinator',
    'spamdecoy', 'temp-mail', 'trash2009', 'trash2009',
    'www.10minutemail.com', 'www.guerrillamail.com', 'www.yopmail.com'
  ];
  
  const domain = trimmed.split('@')[1]?.toLowerCase() || '';
  return !tempEmailDomains.some(temp => domain.includes(temp));
};

// ✅ PHONE VALIDATION
export const validateInternationalPhone = (phone, country = 'United Kingdom') => {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (trimmed.length < 5) return false;
  
  const regex = countryPhoneRegex[country] || countryPhoneRegex['Other'];
  return regex.test(trimmed.replace(/\s/g, ''));
};

// ✅ ADDRESS VALIDATION
export const validateInternationalAddress = (address, country = 'United Kingdom') => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  if (trimmed.length < 3) return false;
  if (trimmed.length > 200) return false;
  // Address should have at least one number and one letter
  const hasNumber = /\d/.test(trimmed);
  const hasLetter = /[a-zA-Z]/.test(trimmed);
  return hasNumber && hasLetter;
};

// ✅ CITY VALIDATION
export const validateInternationalCity = (city, country = 'United Kingdom') => {
  if (!city || typeof city !== 'string') return false;
  const trimmed = city.trim();
  if (trimmed.length < 2) return false;
  if (trimmed.length > 50) return false;
  // Allow letters, spaces, hyphens, apostrophes
  const cityRegex = /^[a-zA-Z\s\-'\.]{2,50}$/;
  return cityRegex.test(trimmed);
};

// ✅ POSTCODE VALIDATION
export const validateInternationalPostcode = (postcode, country = 'United Kingdom') => {
  if (!postcode) return false;
  const trimmed = postcode.trim().toUpperCase();
  
  // UK Postcode validation
  if (country === 'United Kingdom') {
    // UK postcode format: SW1A 1AA, M1 1AE, etc.
    const ukPostcodeRegex = /^([A-Z]{1,2}[0-9][A-Z0-9]?)\s*([0-9][A-Z]{2})$/;
    return ukPostcodeRegex.test(trimmed);
  }
  
  // Other countries - at least 3 characters
  if (trimmed.length < 3) return false;
  if (trimmed.length > 12) return false;
  
  // Allow letters, numbers, spaces, hyphens
  const postcodeRegex = /^[a-zA-Z0-9\s\-]{3,12}$/;
  return postcodeRegex.test(trimmed);
};

// ========================================
// ✅ GET PHONE EXAMPLE
// ========================================
export const getPhoneExample = (country) => {
  const examples = {
    'United Kingdom': '07700 900000',
    'United States': '(555) 555-5555',
    'Canada': '(555) 555-5555',
    'Australia': '0412 345 678',
    'New Zealand': '021 123 4567',
    'Germany': '0151 12345678',
    'France': '06 12 34 56 78',
    'Italy': '345 123 4567',
    'Spain': '612 345 678',
    'Netherlands': '06 12345678',
    'Belgium': '0471 12 34 56',
    'Sweden': '070 123 45 67',
    'Norway': '412 34 567',
    'Denmark': '20 12 34 56',
    'Finland': '040 123 4567',
    'Ireland': '087 123 4567',
    'Switzerland': '076 123 45 67',
    'Austria': '0660 1234567',
    'Greece': '694 123 4567',
    'Portugal': '912 345 678',
    'Poland': '512 345 678',
    'Turkey': '532 123 4567',
    'Russia': '912 345 6789',
    'Ukraine': '067 123 4567',
    'Romania': '0712 345 678',
    'India': '98765 43210',
    'Pakistan': '0312 3456789',
    'Bangladesh': '01712 345678',
    'Sri Lanka': '071 234 5678',
    'Nepal': '984 123 4567',
    'UAE': '50 123 4567',
    'Saudi Arabia': '05 1234 5678',
    'Qatar': '3312 3456',
    'Kuwait': '555 12345',
    'Japan': '090 1234 5678',
    'China': '139 1234 5678',
    'South Korea': '010 1234 5678',
    'Malaysia': '012 345 6789',
    'Singapore': '8123 4567',
    'Hong Kong': '5123 4567',
    'South Africa': '082 123 4567',
    'Egypt': '010 1234 5678',
    'Morocco': '0612 345678',
    'Nigeria': '080 1234 5678',
    'Kenya': '0712 345678',
    'Brazil': '(11) 91234-5678',
    'Mexico': '55 1234 5678',
    'Argentina': '11 2345 6789',
    'Chile': '9 1234 5678',
    'Colombia': '312 345 6789',
    'Peru': '912 345 678',
    'Other': '+44 7700 900000',
  };
  return examples[country] || examples['Other'];
};

// ========================================
// ✅ GET COUNTRY CODE
// ========================================
export const getCountryCode = (country) => {
  const codes = {
    'United Kingdom': '+44',
    'United States': '+1',
    'Canada': '+1',
    'Australia': '+61',
    'New Zealand': '+64',
    'Germany': '+49',
    'France': '+33',
    'Italy': '+39',
    'Spain': '+34',
    'Netherlands': '+31',
    'Belgium': '+32',
    'Sweden': '+46',
    'Norway': '+47',
    'Denmark': '+45',
    'Finland': '+358',
    'Ireland': '+353',
    'Switzerland': '+41',
    'Austria': '+43',
    'Greece': '+30',
    'Portugal': '+351',
    'Poland': '+48',
    'Turkey': '+90',
    'Russia': '+7',
    'Ukraine': '+380',
    'Romania': '+40',
    'India': '+91',
    'Pakistan': '+92',
    'Bangladesh': '+880',
    'Sri Lanka': '+94',
    'Nepal': '+977',
    'UAE': '+971',
    'Saudi Arabia': '+966',
    'Qatar': '+974',
    'Kuwait': '+965',
    'Japan': '+81',
    'China': '+86',
    'South Korea': '+82',
    'Malaysia': '+60',
    'Singapore': '+65',
    'Hong Kong': '+852',
    'South Africa': '+27',
    'Egypt': '+20',
    'Morocco': '+212',
    'Nigeria': '+234',
    'Kenya': '+254',
    'Brazil': '+55',
    'Mexico': '+52',
    'Argentina': '+54',
    'Chile': '+56',
    'Colombia': '+57',
    'Peru': '+51',
    'Other': '+44',
  };
  return codes[country] || codes['Other'];
};