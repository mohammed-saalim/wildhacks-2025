// FeedbackPage.jsx
import React, { useEffect } from 'react';
import { useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const FeedbackPage = () => {

  useEffect(() => {
    console.log("📥 FeedbackPage received:", { emotionData, videoUrl, evaluation });
  }, []);
  
  
  const location = useLocation();
  const { emotionData, videoUrl, evaluation } = location.state || {};

  if (!emotionData && !evaluation && !videoUrl) {
    return <div className="p-6">No feedback data available.</div>;
  }

  const emotionChartData =
    emotionData?.emotion_scores
      ? Object.entries(emotionData.emotion_scores).map(([emotion, value]) => ({
          emotion,
          value: (value * 100).toFixed(1),
        }))
      : [];

  const summaryFeedback = () => {
    if (!emotionData || !emotionData.candidate_present) {
      return "The candidate was not consistently visible in the camera. Please ensure a stable setup next time.";
    }

    let summary = "The candidate maintained a ";
    summary += emotionData.is_confident ? "confident" : "less confident";
    summary += ", ";
    summary += emotionData.stress_level > 0.5 ? "highly stressed" : "calm";
    summary += ", and ";
    summary += emotionData.is_confused ? "confused" : "clear";
    summary += " demeanor. Focus levels were ";
    summary += emotionData.focus_score > 0.75
      ? "excellent."
      : emotionData.focus_score > 0.5
      ? "moderate."
      : "low.";

    return summary;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Interview Feedback 📊</h1>

      {videoUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">🎬 Interview Recording</h2>
          <video
            controls
            src={videoUrl}
            className="rounded-lg border shadow-md w-full max-w-2xl"
          >
            Sorry, your browser does not support the video tag.
          </video>
        </div>
      )}

      {emotionData?.candidate_present ? (
        <>
          <h2 className="text-xl font-semibold mb-4">😊 Emotion Summary</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emotionChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="emotion" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="value" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">📈 Derived Metrics</h2>
            <ul className="list-disc pl-6">
              <li><strong>🔥 Stress Level:</strong> {(emotionData.stress_level * 100).toFixed(1)}%</li>
              <li><strong>🌀 Confused?</strong> {emotionData.is_confused ? "Yes" : "No"}</li>
              <li><strong>💪 Confident?</strong> {emotionData.is_confident ? "Yes" : "No"}</li>
              <li><strong>🎯 Focus Score:</strong> {(emotionData.focus_score * 100).toFixed(1)}%</li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h2 className="text-lg font-semibold mb-1">📝 Summary</h2>
            <p>{summaryFeedback()}</p>
          </div>
        </>
      ) : emotionData ? (
        <p className="text-red-600 font-semibold mt-4">⚠️ Candidate was not present in most frames</p>
      ) : null}

      {evaluation && (
        <div className="mt-10 p-4 bg-green-50 border-l-4 border-green-400">
          <h2 className="text-lg font-semibold mb-2">🧠 Gemini Evaluation</h2>
          <p className="whitespace-pre-wrap">{evaluation}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
