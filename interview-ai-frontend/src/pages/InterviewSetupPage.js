import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const [selectedJD, setSelectedJD] = useState('');
  const [customJD, setCustomJD] = useState('');

  const handleStartInterview = () => {
    const finalJD = selectedJD === 'custom' ? customJD : selectedJD;
    console.log('JD sent to LLM:', finalJD);
  
    // ✅ Pass finalJD as route state
    navigate('/interview', { state: { role: finalJD } });
  };

  return (
    <Box sx={{ background: 'linear-gradient(to bottom, #eef2ff, #f0f4ff)', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            p: 5,
            background: 'linear-gradient(135deg, #3b3c58, #6366f1)',
            color: 'white',
            boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
            Interview Setup
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
            Select a Job Description
          </Typography>

          <Select
            fullWidth
            value={selectedJD}
            onChange={(e) => setSelectedJD(e.target.value)}
            displayEmpty
            sx={{
              backgroundColor: '#f3f4f6',
              color: '#111827',
              borderRadius: 2,
              mb: selectedJD === 'custom' ? 2 : 4
            }}
          >
            <MenuItem value="" disabled>Select a JD</MenuItem>
            <MenuItem value="Frontend Developer at SaaS Co.">Frontend Developer at SaaS Co.</MenuItem>
            <MenuItem value="Backend Engineer at FinTech">Backend Engineer at FinTech</MenuItem>
            <MenuItem value="Data Scientist at HealthAI">Data Scientist at HealthAI</MenuItem>
            <MenuItem value="DevOps Specialist at CloudStart">DevOps Specialist at CloudStart</MenuItem>
            <MenuItem value="custom">Custom JD</MenuItem>
          </Select>

          {selectedJD === 'custom' && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Enter your custom Job Description
              </Typography>
              <TextField
                multiline
                rows={4}
                placeholder="Paste or write a custom JD here..."
                fullWidth
                value={customJD}
                onChange={(e) => setCustomJD(e.target.value)}
                sx={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: 2,
                  mb: 4
                }}
              />
            </>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleStartInterview}
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              backgroundColor: '#4f46e5',
              borderRadius: 3,
              '&:hover': {
                backgroundColor: '#4338ca'
              }
            }}
          >
            Start Interview
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default InterviewSetupPage;
