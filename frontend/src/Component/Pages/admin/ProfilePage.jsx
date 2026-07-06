// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';

// const ProfilePage = () => {
//   // Get user info from Redux
//   const { userInfo } = useSelector((state) => state.auth);

//   // If no user is logged in
//   if (!userInfo) {
//     return (
//       <div style={{ textAlign: 'center', padding: '50px' }}>
//         <h2>Please Login</h2>
//         <p>You need to be logged in to view your profile.</p>
//         <Link to="/login" style={{ 
//           background: '#c6a43f', 
//           color: '#1a1a1a', 
//           padding: '10px 20px',
//           textDecoration: 'none',
//           borderRadius: '5px',
//           display: 'inline-block',
//           marginTop: '20px'
//         }}>
//           Login Now
//         </Link>
//       </div>
//     );
//   }

//   return (
//     // <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
//     //   <div style={{ 
//     //     background: 'white', 
//     //     borderRadius: '10px', 
//     //     padding: '30px',
//     //     boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//     //   }}>
//     //     <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>My Profile</h1>
        
//     //     <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//     //       <div style={{
//     //         width: '100px',
//     //         height: '100px',
//     //         background: '#c6a43f',
//     //         borderRadius: '50%',
//     //         display: 'flex',
//     //         alignItems: 'center',
//     //         justifyContent: 'center',
//     //         fontSize: '40px',
//     //         fontWeight: 'bold',
//     //         color: 'white',
//     //         margin: '0 auto'
//     //       }}>
//     //         {userInfo.name?.charAt(0).toUpperCase()}
//     //       </div>
//     //     </div>

//     //     <div style={{ marginBottom: '15px' }}>
//     //       <strong>Name:</strong> {userInfo.name}
//     //     </div>
        
//     //     <div style={{ marginBottom: '15px' }}>
//     //       <strong>Email:</strong> {userInfo.email}
//     //     </div>
        
//     //     <div style={{ marginBottom: '15px' }}>
//     //       <strong>Account Type:</strong> {userInfo.isAdmin ? 'Admin' : 'Customer'}
//     //     </div>
        
//     //     <div style={{ marginBottom: '15px' }}>
//     //       <strong>User ID:</strong> {userInfo._id}
//     //     </div>

//     //     <Link to="/shop" style={{
//     //       display: 'block',
//     //       textAlign: 'center',
//     //       background: '#c6a43f',
//     //       color: '#1a1a1a',
//     //       padding: '12px',
//     //       textDecoration: 'none',
//     //       borderRadius: '5px',
//     //       marginTop: '30px',
//     //       fontWeight: 'bold'
//     //     }}>
//     //       Continue Shopping
//     //     </Link>
//     //   </div>
//     // </div>


 
//     <div style={{ 
//       maxWidth: '600px', 
//       margin: '100px auto', // Margin thora barha dein taake header se niche aa jaye
//       padding: '20px',
//       minHeight: '400px' // Height fix karein
//     }}>
//       <div style={{ 
//         background: '#ffffff', // Pakka white color
//         borderRadius: '10px', 
//         padding: '30px',
//         boxShadow: '0 4px 20px rgba(0,0,0,0.1)', // Thora wazay shadow
//         border: '1px solid #eee' // Border taake frame nazar aaye
//       }}>
//         <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#1a1a1a' }}>My Profile</h1>
        
//         {/* Avatar Section */}
//         <div style={{ textAlign: 'center', marginBottom: '30px' }}>
//           <div style={{
//             width: '100px',
//             height: '100px',
//             background: '#c6a43f',
//             borderRadius: '50%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '40px',
//             fontWeight: 'bold',
//             color: 'white',
//             margin: '0 auto'
//           }}>
//             {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
//           </div>
//         </div>

//         {/* Info Section */}
//         <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
//           <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>
//             <strong style={{ color: '#c6a43f' }}>Name:</strong> {userInfo.name}
//           </p>
//           <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>
//             <strong style={{ color: '#c6a43f' }}>Email:</strong> {userInfo.email}
//           </p>
//           <p style={{ margin: '10px 0', fontSize: '1.1rem' }}>
//             <strong style={{ color: '#c6a43f' }}>Account Type:</strong> {userInfo.isAdmin ? 'Admin' : 'Customer'}
//           </p>
//         </div>

//         <Link to="/" style={{
//           display: 'block',
//           textAlign: 'center',
//           background: '#c6a43f',
//           color: 'white',
//           padding: '12px',
//           textDecoration: 'none',
//           borderRadius: '5px',
//           marginTop: '30px',
//           fontWeight: 'bold'
//         }}>
//           Back to Home
//         </Link>
//       </div>
//     </div>

//   );
// };

// export default ProfilePage;



import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  // Redux se user info lena
  const { userInfo } = useSelector((state) => state.auth);

  // Console mein data check karne ke liye useEffect
  useEffect(() => {
    if (userInfo) {
      console.log("✅ REDUX USER DATA:", userInfo);
    } else {
      console.log("❌ USER INFO NOT FOUND: State is empty or user is logged out.");
    }
  }, [userInfo]);

  // Agar user logged in nahi hai
  if (!userInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '150px 20px', minHeight: '80vh' }}>
        <h2 style={{ color: '#1a1a1a' }}>Please Login</h2>
        <p>You need to be logged in to view your profile.</p>
        <Link to="/login" style={{ 
          background: '#c6a43f', 
          color: 'white', 
          padding: '12px 25px',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block',
          marginTop: '20px'
        }}>
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      paddingTop: '120px', // Header se door rakhne ke liye padding barha di
      paddingBottom: '50px',
      position: 'relative',
      zIndex: '1'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        background: 'white', 
        borderRadius: '15px', 
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid #eee',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '10px', color: '#1a1a1a', fontSize: '28px' }}>My Profile</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Your account information</p>
        
        {/* User Initial Avatar */}
        <div style={{
          width: '90px',
          height: '90px',
          background: 'linear-gradient(135deg, #c6a43f 0%, #a3852d 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '35px',
          fontWeight: 'bold',
          color: 'white',
          margin: '0 auto 25px',
          boxShadow: '0 5px 15px rgba(198, 164, 63, 0.4)'
        }}>
          {userInfo.name?.charAt(0).toUpperCase() || 'U'}
        </div>

        {/* User Details Section */}
        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <div style={detailRowStyle}>
            <span style={labelStyle}>Full Name:</span>
            <span style={valueStyle}>{userInfo.name}</span>
          </div>
          
          <div style={detailRowStyle}>
            <span style={labelStyle}>Email Address:</span>
            <span style={valueStyle}>{userInfo.email}</span>
          </div>
          
          <div style={detailRowStyle}>
            <span style={labelStyle}>Role:</span>
            <span style={{...valueStyle, color: userInfo.isAdmin ? '#d4af37' : '#28a745', fontWeight: 'bold'}}>
              {userInfo.isAdmin ? '👑 Admin' : '👤 Customer'}
            </span>
          </div>
        </div>

        <Link to="/womens" style={{
          display: 'block',
          background: '#c6a43f',
          color: 'white',
          padding: '14px',
          textDecoration: 'none',
          borderRadius: '8px',
          marginTop: '30px',
          fontWeight: '600'
        }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

// Internal CSS styles
const detailRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '15px 0',
  borderBottom: '1px solid #f0f0f0'
};

const labelStyle = {
  color: '#777',
  fontSize: '14px'
};

const valueStyle = {
  color: '#333',
  fontSize: '15px',
  fontWeight: '500'
};

export default ProfilePage;