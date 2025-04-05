import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InterviewPage from "./pages/InterviewPage";
import ResumeUploader from "./pages/ResumeUploader";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/upload" element={<ResumeUploader />} />
      </Routes>
    </Router>
  );
}

export default App;
