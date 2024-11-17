import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ModelProfile from './components/ModelProfile';
import AdminPanel from './components/AdminPanel';
import AgeVerificationModal from './components/AgeVerificationModal';
import { Toaster } from 'react-hot-toast';

function App() {
  const { ageVerified } = useStore();
  const { user } = useAuthStore();

  if (!ageVerified) {
    return <AgeVerificationModal />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/modelo" 
          element={
            user?.role === 'model' ? (
              <Navigate to="/profile" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            user?.role === 'model' ? (
              <ModelProfile />
            ) : (
              <Navigate to="/modelo" replace />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            user?.role === 'admin' ? (
              <AdminPanel />
            ) : (
              <AdminLogin />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;