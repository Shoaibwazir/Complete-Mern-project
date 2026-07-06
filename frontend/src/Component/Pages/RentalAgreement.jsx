// src/Component/Pages/RentalAgreement.jsx
// ✅ COMPLETE FIXED VERSION WITH ID IMAGE UPLOAD VISIBLE

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Download,
  Printer,
  Share2,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  Calendar,
  User,
  Package,
  DollarSign,
  FileCheck,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Gem,
  Sparkles,
  Info,
  Copy,
  Check,
  X,
  Loader2,
  Camera,
  Upload,
  FileText,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './RentalAgreement.css';

// ========================================
// ✅ DATE HELPERS
// ========================================
const getDaySuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatDateWithSuffix = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month}, ${year}`;
  } catch {
    return dateString;
  }
};

// ========================================
// ✅ CUSTOMER PDF FORM WITH ID UPLOAD
// ========================================
const CustomerPDFForm = ({ agreement, onDownloaded }) => {
  const [customerData, setCustomerData] = useState({
    fullName: agreement?.customerName || '',
    email: agreement?.customerEmail || '',
    phone: agreement?.customerPhone || '',
    address: '',
    city: '',
    postcode: '',
    idType: 'Passport',
    idNumber: '',
  });
  const [idImage, setIdImage] = useState(null);
  const [idImagePreview, setIdImagePreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [downloaded, setDownloaded] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ✅ Handle ID Image Upload
  const handleIdImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, JPG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setIdImagePreview(e.target.result);
      setIdImage(file);
      setIdUploaded(true);
      toast.success('ID image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  // ✅ Remove ID Image
  const removeIdImage = () => {
    setIdImage(null);
    setIdImagePreview(null);
    setIdUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!customerData.fullName.trim()) newErrors.fullName = 'Full name required';
    if (!customerData.email.trim() || !customerData.email.includes('@')) newErrors.email = 'Valid email required';
    if (!customerData.phone.trim() || customerData.phone.length < 10) newErrors.phone = 'Valid phone required';
    if (!customerData.address.trim()) newErrors.address = 'Address required';
    if (!customerData.city.trim()) newErrors.city = 'City required';
    if (!customerData.postcode.trim()) newErrors.postcode = 'Postcode required';
    
    // ✅ ID Image is now required
    if (!idUploaded && !idImage) {
      newErrors.idImage = 'Please upload a clear photo of your Driving Licence or Passport';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePDF = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields and upload ID image');
      return;
    }

    setGenerating(true);
    toast.loading('Generating PDF with ID image...');

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW = 210;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = 20;

      const addLine = (extra = 0) => { y += 6 + extra; };
      const checkPage = (needed = 20) => {
        if (y + needed > 270) { doc.addPage(); y = 20; }
      };

      // ── Dark header ──
      doc.setFillColor(20, 20, 40);
      doc.rect(0, 0, pageW, 35, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('QASR-E-LIBAS LTD', margin, 16);
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text('Luxury Rental Agreement', margin, 24);
      doc.text('Unit 107, Jubilee Trade Centre, Birmingham B5 6ND', margin, 30);
      doc.setTextColor(212, 175, 55);
      doc.text('+44 7979 389080  |  info@qasrelibas.co.uk', pageW - margin, 30, { align: 'right' });

      y = 45;

      // Agreement ID
      const agreementId = `REN-${Date.now().toString().slice(-8)}`;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Agreement ID: ${agreementId}`, margin, y);
      doc.text(`Date: ${formatDateWithSuffix(new Date())}`, pageW - margin, y, { align: 'right' });
      addLine(4);

      // Title bar
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, contentW, 10, 'F');
      doc.setTextColor(20, 20, 40);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('RENTAL AGREEMENT SUMMARY', pageW / 2, y + 7, { align: 'center' });
      addLine(14);

      const sectionTitle = (title) => {
        checkPage(14);
        doc.setFillColor(20, 20, 40);
        doc.rect(margin, y, contentW, 8, 'F');
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 3, y + 5.5);
        addLine(10);
      };

      const row = (label, value, redValue = false) => {
        checkPage(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(label, margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(redValue ? 180 : 30, redValue ? 50 : 30, 30);
        doc.text(String(value ?? ''), margin + 65, y);
        addLine();
      };

      // ── Customer Details ──
      sectionTitle('CUSTOMER DETAILS');
      row('Full Name:', customerData.fullName);
      row('Email Address:', customerData.email);
      row('Phone Number:', customerData.phone);
      row('Address:', customerData.address);
      row('City:', customerData.city);
      row('Postcode:', customerData.postcode);
      row('ID Type:', customerData.idType);
      row('ID Number:', customerData.idNumber || 'Not provided');
      addLine(2);

      // ── ID IMAGE SECTION ──
      if (idImagePreview) {
        checkPage(40);
        sectionTitle('ID DOCUMENT PHOTO');
        
        // Add ID image to PDF
        try {
          const imgData = idImagePreview;
          const imgWidth = 80;
          const imgHeight = 55;
          const imgX = (pageW - imgWidth) / 2;
          
          doc.addImage(imgData, 'JPEG', imgX, y, imgWidth, imgHeight);
          addLine(imgHeight + 8);
          
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Customer ID Document (Driving Licence / Passport)', pageW / 2, y, { align: 'center' });
          addLine(6);
        } catch (err) {
          console.error('Error adding image to PDF:', err);
          doc.setFontSize(8);
          doc.setTextColor(200, 50, 50);
          doc.text('* ID Image could not be embedded in PDF', margin + 2, y);
          addLine(6);
        }
      }

      // ── Item Details ──
      sectionTitle('ITEM DETAILS');
      row('Item Name:', agreement?.itemName);
      row('Collection Date:', formatDateWithSuffix(agreement?.collectionDate));
      row('Collection Time:', agreement?.collectionTime || '10:00 AM');
      row('Return Date:', formatDateWithSuffix(agreement?.returnDate));
      row('Return Time:', agreement?.returnTime || '10:00 AM');
      row('Rental Period:', `${agreement?.rentalDays} day${agreement?.rentalDays > 1 ? 's' : ''}`);
      addLine(2);

      // ── Payment Summary ──
      sectionTitle('PAYMENT SUMMARY');
      row('Rent Per Day:', `£${(agreement?.perDayRate || agreement?.rentFee / agreement?.rentalDays)?.toFixed(2)}`);
      row(`Rental Fee (${agreement?.rentalDays} day${agreement?.rentalDays > 1 ? 's' : ''}):`, `£${agreement?.rentFee?.toFixed(2)}`);
      row('Security Deposit (Outstanding):', `£${agreement?.depositFee?.toFixed(2)}`, true);

      // Grand total block
      checkPage(12);
      doc.setFillColor(20, 20, 40);
      doc.rect(margin, y, contentW, 10, 'F');
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL TO PAY:', margin + 3, y + 7);
      doc.text(`£${agreement?.totalPaid?.toFixed(2)}`, pageW - margin - 3, y + 7, { align: 'right' });
      addLine(14);

      // Deposit note
      checkPage(20);
      doc.setFillColor(255, 248, 230);
      doc.rect(margin, y, contentW, 16, 'F');
      doc.setTextColor(180, 120, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('SECURITY DEPOSIT NOTE:', margin + 3, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text('Deposit is refundable after inspection. Processed within 7-10 business days after return.', margin + 3, y + 10);
      doc.text('The deposit amount shown above is OUTSTANDING and payable at collection.', margin + 3, y + 15);
      addLine(20);

      // ── Terms ──
      sectionTitle('TERMS & CONDITIONS');
      const terms = agreement?.terms || [
        'A video/photo record of the dress will be taken before collection.',
        'If any washable or removable marks are found, a 20% reduction may apply.',
        'For stains, holes, or visible damage, a 40% or higher reduction may apply.',
        'If the dress is severely damaged, the deposit will not be refunded.',
        'Items must be returned in original condition with all tags attached.',
        'Late returns subject to additional daily charges.',
        'Dry cleaning included in rental price.',
        'Deposit refunded within 7-10 business days after return.',
        'Free size exchange within 24 hours of delivery.',
        'Free cancellation up to 24 hours before rental start date.',
        '⚠️ A valid ID (Driving Licence or Passport) is required for all rentals.',
        '⚠️ The customer is fully responsible for the item during the rental period.',
      ];

      terms.forEach((term, i) => {
        checkPage(8);
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(`${i + 1}. ${term}`, contentW - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 5 + 2;
      });

      addLine(4);

      // ── Signatures ──
      checkPage(40);
      doc.setDrawColor(180, 180, 180);
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Signature:', margin, y);
      doc.line(margin + 38, y, margin + 100, y);
      doc.text('Date:', margin + 105, y);
      doc.line(margin + 115, y, pageW - margin, y);
      addLine(12);
      doc.text('QASR-E-LIBAS Representative:', margin, y);
      doc.line(margin + 55, y, margin + 120, y);
      doc.text('Date:', margin + 125, y);
      doc.line(margin + 135, y, pageW - margin, y);
      addLine(14);

      // ── Page footer ──
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(20, 20, 40);
        doc.rect(0, 285, pageW, 12, 'F');
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('QASR-E-LIBAS LTD  |  Unit 107, Jubilee Trade Centre, Birmingham B5 6ND  |  +44 7979 389080  |  info@qasrelibas.co.uk', pageW / 2, 292, { align: 'center' });
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin, 292, { align: 'right' });
      }

      const filename = `QEL-Rental-${customerData.fullName.replace(/\s+/g, '-')}-${agreementId}.pdf`;
      doc.save(filename);

      toast.dismiss();
      toast.success('✅ PDF downloaded successfully with ID image!');
      setDownloaded(true);
      if (onDownloaded) onDownloaded();
    } catch (err) {
      console.error('PDF error:', err);
      toast.dismiss();
      toast.error('PDF generation failed. Make sure jspdf is installed: npm install jspdf');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="agreement-section" style={{ background: '#fff', border: '2px solid #d4af37', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#14142a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Download size={18} color="#d4af37" /> Download Agreement PDF
      </h3>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
        Fill in your details and upload your ID to download the agreement
      </p>

      {downloaded && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} color="#22c55e" />
          <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '600' }}>PDF downloaded! Check your Downloads folder.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {[
          { name: 'fullName', label: 'Full Name *', placeholder: 'Enter full name', span: 2 },
          { name: 'email', label: 'Email *', placeholder: 'your@email.com', type: 'email' },
          { name: 'phone', label: 'Phone *', placeholder: '+44 7700 900000', type: 'tel' },
          { name: 'address', label: 'Address *', placeholder: '123 Main Street', span: 2 },
          { name: 'city', label: 'City *', placeholder: 'Birmingham' },
          { name: 'postcode', label: 'Postcode *', placeholder: 'B1 1AA' },
        ].map((field) => (
          <div key={field.name} style={{ gridColumn: field.span === 2 ? '1 / -1' : 'auto' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={customerData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: `1px solid ${errors[field.name] ? '#e74c3c' : '#ddd'}`,
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors[field.name] && <span style={{ fontSize: '11px', color: '#e74c3c' }}>{errors[field.name]}</span>}
          </div>
        ))}

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>ID Type</label>
          <select
            name="idType"
            value={customerData.idType}
            onChange={handleChange}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
          >
            <option value="Passport">Passport</option>
            <option value="Driving Licence">Driving Licence</option>
            <option value="National ID">National ID</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>ID Number (Optional)</label>
          <input
            type="text"
            name="idNumber"
            value={customerData.idNumber}
            onChange={handleChange}
            placeholder="Document number"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* ✅ ID IMAGE UPLOAD SECTION - VISIBLE NOW */}
        <div style={{ gridColumn: '1 / -1', marginTop: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>
            <Camera size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Upload Driving Licence / Passport Photo *
            <span style={{ fontSize: '10px', color: '#999', fontWeight: '400', display: 'block' }}>
              Please upload a clear photo (JPEG, PNG, max 5MB)
            </span>
          </label>
          
          {!idUploaded ? (
            <div 
              style={{
                border: `2px dashed ${errors.idImage ? '#e74c3c' : '#d4af37'}`,
                borderRadius: '10px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#faf8f3',
                transition: 'all 0.3s',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } };
                  handleIdImageUpload(fakeEvent);
                }
              }}
            >
              <Upload size={40} color="#d4af37" style={{ marginBottom: '10px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '0' }}>
                Click or drag to upload ID photo
              </p>
              <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0' }}>
                Driving Licence or Passport
              </p>
              <p style={{ fontSize: '11px', color: '#ccc', margin: '8px 0 0' }}>
                Supported: JPEG, PNG, JPG, WEBP (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleIdImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{
              border: '2px solid #86efac',
              borderRadius: '10px',
              padding: '16px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '70px',
                  height: '50px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#e5e5e5',
                  border: '1px solid #ddd',
                  flexShrink: 0,
                }}>
                  <img 
                    src={idImagePreview} 
                    alt="ID Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> ID Uploaded
                  </span>
                  <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                    {customerData.idType} - {customerData.idNumber || 'Document uploaded'}
                  </span>
                </div>
              </div>
              <button
                onClick={removeIdImage}
                style={{
                  background: '#fee2e2',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  color: '#dc2626',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={14} />
                Remove
              </button>
            </div>
          )}
          {errors.idImage && (
            <span style={{ fontSize: '11px', color: '#e74c3c', display: 'block', marginTop: '6px' }}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {errors.idImage}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={generatePDF}
        disabled={generating}
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '14px',
          background: generating ? '#999' : 'linear-gradient(135deg, #d4af37, #b8922a)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: generating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.3s',
        }}
      >
        {generating ? <><Loader2 size={20} className="spinning" /> Generating PDF...</> : <><Download size={20} /> Download Agreement PDF</>}
      </button>
      
      <div style={{ marginTop: '14px', padding: '12px 16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <AlertTriangle size={18} color="#92400e" style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <p style={{ fontSize: '12px', color: '#92400e', margin: '0', fontWeight: '600' }}>
            ID Photo is Mandatory
          </p>
          <p style={{ fontSize: '11px', color: '#78350f', margin: '2px 0 0' }}>
            A clear photo of your Driving Licence or Passport is required for all rentals. 
            This will be attached to your agreement PDF for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

// ========================================
// MAIN RENTAL AGREEMENT PAGE
// ========================================
const RentalAgreement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const state = location.state;
    if (state?.rentalData) {
      setAgreement(state.rentalData);
      setLoading(false);
      return;
    }
    const savedData = localStorage.getItem('rentalAgreementData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed && parsed.itemName) {
          setAgreement(parsed);
          setLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem('rentalAgreementData');
      }
    }
    toast.error('No rental agreement found');
    navigate('/rental-shop');
  }, [location, navigate]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = `Rental Agreement - ${agreement?.itemName}\nCustomer: ${agreement?.customerName}\nTotal: £${agreement?.totalPaid}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Rental Agreement - QASR-E-LIBAS', text });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') toast.error('Failed to share');
    }
  };

  const handleSendEmail = () => {
    const subject = `Rental Agreement - ${agreement?.itemName}`;
    const body = `QASR-E-LIBAS LTD - Rental Agreement\n\nItem: ${agreement?.itemName}\nCollection: ${formatDateWithSuffix(agreement?.collectionDate)}\nReturn: ${formatDateWithSuffix(agreement?.returnDate)}\nRental Days: ${agreement?.rentalDays}\n\nRent Fee: £${agreement?.rentFee?.toFixed(2)}\nSecurity Deposit: £${agreement?.depositFee?.toFixed(2)}\nTotal Paid: £${agreement?.totalPaid?.toFixed(2)}\n\nThank you for choosing QASR-E-LIBAS LTD.`;
    window.location.href = `mailto:${agreement?.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success('Opening email...');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="agreement-loading">
        <div className="spinner"></div>
        <p>Loading agreement...</p>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="agreement-error">
        <AlertCircle size={48} />
        <h3>No Agreement Found</h3>
        <p>Please complete a rental booking first</p>
        <button onClick={() => navigate('/rental-shop')} className="back-btn-agreement">Browse Rentals</button>
      </div>
    );
  }

  return (
    <div className="rental-agreement-page">
      <div className="agreement-container">

        {/* Actions Bar */}
        <div className="agreement-actions">
          <button onClick={() => navigate(-1)} className="action-btn back">
            <ChevronLeft size={20} /> Back
          </button>
          <div className="action-group">
            <button onClick={handlePrint} className="action-btn print" title="Print Agreement">
              <Printer size={18} /> Print
            </button>
            <button onClick={handleShare} className="action-btn share" title="Share Agreement">
              <Share2 size={18} /> Share
            </button>
            <button onClick={handleSendEmail} className="action-btn email" title="Email Agreement">
              <Mail size={18} /> Email
            </button>
            <button onClick={handleCopyLink} className="action-btn copy" title="Copy Link">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Agreement Content */}
        <div className="agreement-content" ref={printRef} id="agreement-content">

          {/* Header */}
          <div className="agreement-header">
            <div className="header-logo">
              <div className="logo-icon"><Gem size={28} /></div>
              <div className="logo-text">
                <h1>QASR-E-<span>LIBAS</span></h1>
                <p>Luxury Rental</p>
              </div>
            </div>
            <div className="header-badge">
              <FileCheck size={20} />
              <span>Rental Agreement</span>
            </div>
          </div>

          {/* Title */}
          <div className="agreement-title">
            <h2>Rental Agreement Summary</h2>
            <p>Please review and keep this document for your records</p>
          </div>

          {/* Status */}
          <div className="agreement-status">
            <div className="status-badge confirmed">
              <CheckCircle size={16} /> Confirmed
            </div>
            <span className="agreement-date">
              <Calendar size={14} />
              {formatDateWithSuffix(agreement.agreementDate || new Date())}
            </span>
          </div>

          {/* Main Content */}
          <div className="agreement-main">

            {/* Item Details */}
            <div className="agreement-section">
              <h3><Package size={20} /> Item Details</h3>
              <div className="section-grid">
                <div className="grid-item">
                  <span className="label">Item Name</span>
                  <span className="value">{agreement.itemName || 'N/A'}</span>
                </div>
                <div className="grid-item">
                  <span className="label">Agreement ID</span>
                  <span className="value">REN-{Date.now().toString().slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="agreement-section">
              <h3><User size={20} /> Customer Details</h3>
              <div className="section-grid">
                <div className="grid-item">
                  <span className="label">Customer Name</span>
                  <span className="value">{agreement.customerName || 'Guest'}</span>
                </div>
                <div className="grid-item">
                  <span className="label">Email</span>
                  <span className="value">{agreement.customerEmail || 'N/A'}</span>
                </div>
                <div className="grid-item">
                  <span className="label">Phone</span>
                  <span className="value">{agreement.customerPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="agreement-section">
              <h3><Calendar size={20} /> Rental Details</h3>
              <div className="section-grid">
                <div className="grid-item">
                  <span className="label">Collection Date & Time</span>
                  <span className="value">
                    {formatDateWithSuffix(agreement.collectionDate)} at {agreement.collectionTime || '10:00 AM'}
                  </span>
                </div>
                <div className="grid-item">
                  <span className="label">Return Date & Time</span>
                  <span className="value">
                    {formatDateWithSuffix(agreement.returnDate)} at {agreement.returnTime || '10:00 AM'}
                  </span>
                </div>
                <div className="grid-item">
                  <span className="label">Rental Days</span>
                  <span className="value">{agreement.rentalDays || 1} days</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="agreement-section payment-section">
              <h3><DollarSign size={20} /> Payment Summary</h3>
              <div className="payment-grid">
                <div className="payment-item">
                  <span className="label">Rent Fee</span>
                  <span className="value">£{agreement.rentFee?.toFixed(2) || '0.00'}</span>
                  <span className="badge paid">Paid</span>
                </div>
                <div className="payment-item">
                  <span className="label">Security Deposit</span>
                  <span className="value">£{agreement.depositFee?.toFixed(2) || '0.00'}</span>
                  <span className="badge pending">Outstanding</span>
                </div>
                <div className="payment-item total">
                  <span className="label">Total to Pay</span>
                  <span className="value grand">£{agreement.totalPaid?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* ✅ PDF DOWNLOAD FORM WITH ID UPLOAD - VISIBLE */}
            <CustomerPDFForm
              agreement={agreement}
              onDownloaded={() => toast.success('Agreement saved!')}
            />

            {/* Terms & Conditions */}
            <div className="agreement-section terms-section">
              <h3><Shield size={20} /> Terms & Conditions</h3>
              <div className="terms-content">
                <p className="terms-note">
                  The deposit will be refunded after inspection of the dress, as per the following conditions:
                </p>
                <ul className="terms-list">
                  {agreement.terms?.map((term, index) => (
                    <li key={index}>
                      <CheckCircle size={16} />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
                {/* ✅ Additional Terms for ID */}
                <div style={{ 
                  background: '#fef3c7', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  marginTop: '12px',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <p style={{ fontSize: '13px', color: '#92400e', margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <strong>ID Requirement:</strong> A valid Driving Licence or Passport photo is required for this rental. 
                    The customer has uploaded their ID document which is attached to this agreement.
                  </p>
                </div>
                {agreement.additionalNotes && (
                  <div className="additional-notes">
                    <Info size={16} />
                    <p>{agreement.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="agreement-footer">
              <div className="footer-message">
                <Sparkles size={16} />
                <p>Thank you for choosing QASR-E-LIBAS LTD</p>
              </div>
              <div className="footer-contact">
                <div className="contact-item"><Phone size={14} /><span>+44 7460 816860</span></div>
                <div className="contact-item"><Mail size={14} /><span>qasrelibasltd@gmail.com</span></div>
                <div className="contact-item"><MapPin size={14} /><span>Unit 107, Jubilee Trade Centre, Birmingham B5 6ND</span></div>
              </div>
              <div className="footer-signature">
                <div className="signature-line">
                  <span>Customer Signature</span>
                  <span>Date</span>
                </div>
                <div className="signature-line">
                  <span>QASR-E-LIBAS Representative</span>
                  <span>Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="agreement-quick-actions">
          <h4>Quick Actions</h4>
          <div className="quick-action-grid">
            <button className="quick-action" onClick={handlePrint}>
              <Printer size={20} /><span>Print Agreement</span>
            </button>
            <button className="quick-action" onClick={handleSendEmail}>
              <Mail size={20} /><span>Email Customer</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/rental-shop')}>
              <Package size={20} /><span>More Rentals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalAgreement;