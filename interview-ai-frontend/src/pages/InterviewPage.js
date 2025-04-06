import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Stack } from '@mui/material';

const InterviewPage = () => {
  const [conversation, setConversation] = useState([
    { sender: 'llm', message: 'Tell me about yourself.' }
  ]);
  const [listening, setListening] = useState(false);
  const containerRef = useRef(null);

  const handleStartListening = () => {
    setListening(true);
    setTimeout(() => {
      const userResponse = 'I am a frontend developer with 3 years of experience.';
      const newLLMResponse = 'What is your experience working in a team?';
      setConversation(prev => [
        ...prev,
        { sender: 'user', message: userResponse },
        { sender: 'llm', message: newLLMResponse }
      ]);
      setListening(false);
    }, 2000);
  };

  const handleNextQuestion = () => {
    const followUp = 'How do you handle tight deadlines?';
    setConversation(prev => [...prev, { sender: 'llm', message: followUp }]);
  };

  const handleEndInterview = () => {
    alert('Interview ended. Thank you!');
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
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '4px'
              }
            }}
            ref={containerRef}
          >
            <Box sx={{ mb: 2 }}>
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
            </Box>
          </Paper>

          {/* Fixed Webcam Box */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 30,
              width: 120,
              height: 90,
              borderRadius: 2,
              backgroundColor: '#1e1e2f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000
            }}
          >
            <Typography variant="caption" color="white">Webcam</Typography>
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartListening}
            disabled={listening}
            sx={{ minWidth: 180, backgroundColor: '#3b82f6', textTransform: 'none' }}
          >
            {listening ? 'Listening...' : 'Start Talking'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleNextQuestion}
            sx={{ borderColor: '#6366f1', color: '#6366f1', textTransform: 'none', fontWeight: 600 }}
          >
            Next Question
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleEndInterview}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            End Interview
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default InterviewPage;
