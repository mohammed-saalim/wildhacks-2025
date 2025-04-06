import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import InterviewPage from "./pages/InterviewPage";
import ResumeUploader from "./pages/ResumeUploader";
import Navbar from "./components/Navbar";
import FeedbackPage from "./pages/FeedbackPage";



function App() {


  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/authenticate" element={<AuthPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/upload" element={<ResumeUploader />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
