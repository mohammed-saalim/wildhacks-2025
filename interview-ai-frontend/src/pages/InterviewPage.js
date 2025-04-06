import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Stack } from '@mui/material';
import EmotionRecorder from './EmotionRecorder'; // adjust if the path differs
import { useNavigate } from 'react-router-dom';

const InterviewPage = () => {
  const recorderRef = useRef(null);
  const navigate = useNavigate();

  const [conversation, setConversation] = useState([
    { sender: 'llm', message: 'Tell me about yourself.' }
  ]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const containerRef = useRef(null);

  const handleStartInterview = () => {
    if (recorderRef.current?.start) {
      recorderRef.current.start();
      setInterviewStarted(true);
    }
  };

  const handleEndInterview = () => {
    if (recorderRef.current?.stop) {
      recorderRef.current.stop((data, videoUrl) => {
        setEmotionData(data);
        navigate("/feedback", { state: { emotionData: data, videoUrl } });
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #e0e7ff, #f8fafc)', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ color: '#3f3d56' }}>
          Interview Session
        </Typography>

        <Box position="relative">
          <Paper
            elevation={4}
            sx={{
              p: 3,
              minHeight: '450px',
              backgroundColor: '#ffffff',
              borderRadius: 4,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflowY: 'auto',
              maxHeight: '450px',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '4px' }
            }}
            ref={containerRef}
          >
            {conversation.map((msg, idx) => (
              <Typography
                key={idx}
                sx={{
                  mb: 2,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  fontWeight: msg.sender === 'llm' ? 600 : 400,
                  color: msg.sender === 'llm' ? '#1e293b' : '#475569'
                }}
              >
                {msg.sender === 'llm' ? 'Interviewer: ' : 'You: '} {msg.message}
              </Typography>
            ))}
          </Paper>

          {/* Webcam Overlay */}
          <EmotionRecorder ref={recorderRef} />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mt={4}>
          {!interviewStarted ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartInterview}
              sx={{ minWidth: 180, backgroundColor: '#3b82f6', textTransform: 'none' }}
            >
              Start Interview
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={handleEndInterview}
              sx={{ minWidth: 180, textTransform: 'none', fontWeight: 600 }}
            >
              End Interview
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default InterviewPage;
