import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const [selectedJD, setSelectedJD] = useState('');
  const [customJD, setCustomJD] = useState('');
  const [useVoice, setUseVoice] = useState(false);

  const handleStartInterview = () => {
    const finalJD = selectedJD === 'custom' ? customJD : selectedJD;
    console.log('JD sent to LLM:', finalJD);

    navigate('/interview', { state: { role: finalJD, useVoice } });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 8,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/apple-garage.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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
            <MenuItem value="" disabled>General Knowledge Interview</MenuItem>
            <MenuItem value="Frontend Developer at SaaS Co.">Frontend Developer at SaaS Co.</MenuItem>
            <MenuItem value="Backend Engineer at FinTech">Backend Engineer at FinTech</MenuItem>
            <MenuItem value="Data Scientist at HealthAI">Data Scientist at HealthAI</MenuItem>
            <MenuItem value="DevOps Specialist at CloudStart">DevOps Specialist at CloudStart</MenuItem>
            <MenuItem value="custom">Custom Job Description</MenuItem>
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

          <FormControlLabel
            control={
              <Switch
                checked={useVoice}
                onChange={(e) => setUseVoice(e.target.checked)}
                color="secondary"
              />
            }
            label="Enable AI Voice Interviewer"
            sx={{ mb: 3 }}
          />

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
