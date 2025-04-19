import React, { useEffect } from 'react';
import { useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  Alert
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Custom pie slice colors
const PIE_COLORS = ['#6366f1', '#818cf8', '#4f46e5', '#a5b4fc'];

const FeedbackPage = () => {
  const location = useLocation();
  const { emotionData, videoUrl, evaluation } = location.state || {};

  useEffect(() => {
    console.log("📥 FeedbackPage received:", { emotionData, videoUrl, evaluation });
  }, []);

  if (!emotionData && !evaluation && !videoUrl) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">No feedback data available.</Typography>
      </Box>
    );
  }

  // Filter key emotions
  const filteredEmotions = ['happy', 'neutral', 'surprised', 'angry'];
  const emotionChartData = emotionData?.emotion_scores
    ? Object.entries(emotionData.emotion_scores)
        .filter(([emotion]) => filteredEmotions.includes(emotion))
        .map(([emotion, value]) => ({
          name: emotion,
          value: parseFloat((value * 100).toFixed(1))
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

  const score = (
    (emotionData.is_confident ? 0.4 : 0) +
    (1 - emotionData.stress_level) * 0.3 +
    (emotionData.focus_score * 0.2) +
    (emotionData.is_confused ? 0 : 0.1)
  ) * 100;

  return (
    <Box sx={{ minHeight: '100vh', py: 6, background: 'linear-gradient(to bottom, #eef2ff, #f0f4ff)' }}>
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 6,
            p: 5,
            backgroundColor: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#3f3d56' }}>
            Interview Feedback
          </Typography>

          <Divider sx={{ my: 3 }} />

          {videoUrl && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Interview Recording
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <video
                  controls
                  src={videoUrl}
                  style={{
                    width: '75%',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            </Box>
          )}

          {emotionData?.candidate_present && (
            <>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Emotion Summary
              </Typography>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={emotionChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {emotionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Derived Metrics */}
              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📈 Derived Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={1}
                      sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      <Typography fontWeight={600}>🔥 Stress Level</Typography>
                      <Typography>{(emotionData.stress_level * 100).toFixed(1)}%</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc' }}>
                      <Typography fontWeight={600}>🌀 Confused?</Typography>
                      <Typography>{emotionData.is_confused ? "Yes" : "No"}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc' }}>
                      <Typography fontWeight={600}>💪 Confident?</Typography>
                      <Typography>{emotionData.is_confident ? "Yes" : "No"}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc' }}>
                      <Typography fontWeight={600}>🎯 Focus Score</Typography>
                      <Typography>{(emotionData.focus_score * 100).toFixed(1)}%</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Summary */}
              <Alert severity="warning" sx={{ mt: 4 }}>
                <Typography fontWeight={600}>📝 Summary</Typography>
                <Typography>{summaryFeedback()}</Typography>
              </Alert>
            </>
          )}

          {/* Fallback if candidate not visible */}
          {emotionData?.candidate_present === false ? (
  <Alert severity="warning">⚠️ Candidate was not detected in any frames.</Alert>
) : emotionData?.candidate_present === true && emotionData?.focus_score < 0.5 ? (
  <Alert severity="info">⚠️ Candidate focus or visibility may have fluctuated.</Alert>
) : null}


          {/* Evaluation Block
          {evaluation && (
            <Alert severity="success" sx={{ mt: 5 }}>
              <Typography fontWeight={600}>🧠 Gemini Evaluation</Typography>
              <Typography whiteSpace="pre-line">{evaluation}</Typography>
            </Alert>
          )} */}
          {evaluation && (
          <Alert severity="success" sx={{ mt: 5 }}>
            <Typography fontWeight={600}>Gemini Evaluation</Typography>
                      <Typography whiteSpace="pre-line">
            {typeof evaluation.summary === 'string' 
              ? evaluation.summary 
              : JSON.stringify(evaluation, null, 2)}
          </Typography>

          </Alert>
        )}


         {/* 🎯 Emotion Score Block */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
            color: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" fontWeight={700}>Emotion-Based Score</Typography>
          <Typography variant="h2" fontWeight={800} sx={{ my: 1 }}>
            {Math.round(score)}%
          </Typography>
          <Typography variant="subtitle1">
            Based on body language indicators (confidence, focus, stress, confusion)
          </Typography>
        </Box>

       
        {typeof evaluation?.score === 'number' && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(to right, #10b981, #34d399)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" fontWeight={700}>Gemini Evaluation</Typography>
            <Typography variant="h2" fontWeight={800} sx={{ my: 1 }}>
              {Math.round(evaluation.score)}%
            </Typography>
            <Typography variant="subtitle1">
              Based on your answers and overall communication clarity
            </Typography>
          </Box>
        )}


        </Paper>
      </Container>
    </Box>
  );
};

export default FeedbackPage;