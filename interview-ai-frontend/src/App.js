import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SecureRoute from "./pages/SecureRoute";
import HomePage from "./pages/HomePage";
import InterviewPage from "./pages/InterviewPage";
import ResumeUploader from "./pages/ResumeUploader";
import Navbar from "./components/Navbar";
import FeedbackPage from "./pages/FeedbackPage";
import { LoginCallback } from '@okta/okta-react';
import AuthPage from "./pages/AuthPage.js";
import Landing from "./pages/Landing.js"; 


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} /> {/* Login page */}
        <Route path="/login/callback" element={<LoginCallback />} /> {/* Okta callback */}

        {/* Protected Routes */}
        <Route 
          path="/landing" 
          element={
            <SecureRoute>
              <Landing />
            </SecureRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <SecureRoute>
              <HomePage />
            </SecureRoute>
          } 
        />
        <Route 
          path="/interview" 
          element={
            <SecureRoute>
              <InterviewPage />
            </SecureRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <SecureRoute>
              <ResumeUploader />
            </SecureRoute>
          } 
        />
        <Route 
          path="/feedback" 
          element={
            <SecureRoute>
              <FeedbackPage />
            </SecureRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
