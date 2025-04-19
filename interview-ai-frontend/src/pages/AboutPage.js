import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

const AboutPage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: '#f0f4ff'
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url("/saalim.jpeg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(1px) brightness(0.75)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="md"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 10,
          display: 'flex',
          justifyContent: 'flex-start', // 👈 moves content to left
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 5,
            borderRadius: 4,
            maxWidth: 540, // 👈 narrow box
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255,255,255,0.85)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            About InView
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>InView</strong> is a smart interview preparation platform designed to give users a real-time, AI-powered interview experience. With emotion detection, resume-to-question personalization, and LLM-based feedback, it aims to simulate high-stakes interviews in a stress-free environment.
          </Typography>
          <Typography variant="body1" paragraph>
            This application was entirely conceptualized, designed, and developed by <strong>Mohammed Saalim Kartapillai</strong>. It integrates cutting-edge technologies like FastAPI, React, MongoDB, TensorFlow (FER), and Gemini API, all containerized and deployed via Render and Vercel.
          </Typography>
          <Typography variant="body1" paragraph>
            Whether you're preparing for your next big role or just looking to sharpen your interview skills, InView is here to help you grow with actionable feedback and insights.
          </Typography>
          <Typography variant="body1">
            Get in touch or follow my work:{' '}
            <a href="https://github.com/mohammed-saalim/" target="_blank" rel="noopener noreferrer">GitHub</a> |{' '}
            <a href="https://www.linkedin.com/in/mohammed-saalim/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;
