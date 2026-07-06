// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import { Provider } from 'react-redux'; // 1. Ye import karen
// import store from '../src/redux/store';     // 2. Apne store ka sahi path den (e.g., ./store ya ./redux/store)
// import App from './App';
// import { main } from 'framer-motion/m';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     {/* 3. Provider ko yahan wrap karen */}
//     <Provider store={store}>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </Provider>
//   </React.StrictMode>
// );
// export default main



import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import './index.css';
import './styles/form-fixes.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>  {/* ✅ Make sure this exists */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);