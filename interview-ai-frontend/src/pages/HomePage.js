import React from 'react';
import { Box, Button, Container, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img3.png';

const features = [
  {
    title: 'AI-Powered Interview Sessions',
    description: 'Practice interviews tailored to your job domain, powered by real-time AI.',
    img: img1,
  },
  {
    title: 'Personalized Feedback & Insights',
    description: 'Understand your strengths and improvement areas with actionable feedback.',
    img: img2,
  },
  {
    title: 'Smart Resume Context Matching',
    description: 'Our system reads your resume and job descriptions to personalize everything.',
    img: img3,
  }
];

const HomePage = () => {
  return (
    <Box sx={{ background: 'linear-gradient(to bottom, #eef2ff, #f0f4ff)', minHeight: '100vh', pt: 10 }}>
      {/* Hero Section */}
      <Container maxWidth="md" sx={{ textAlign: 'center', mb: 10 }}>
        <Typography
          variant="h2"
          fontWeight={700}
          gutterBottom
          sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Welcome to InView
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Smart, AI-powered interview preparation with feedback that helps you grow.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" size="large" component={Link} to="/interview-setup" sx={{ borderRadius: 3 }}>
            Get Started
          </Button>
        </Box>
      </Container>

      {/* Feature Sections with Images */}
      <Container maxWidth="lg">
        {features.map((feature, index) => (
          <Grid
            container
            columns={12}
            spacing={4}
            alignItems="center"
            justifyContent="center"
            sx={{
              mb: index === features.length - 1 ? 0 : 10, // no bottom margin after the last section
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse'
            }}
            
            key={index}
          >
            <Grid span={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  px: 3,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                <Typography variant="h5" fontWeight={700} mb={2}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>

            <Grid span={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  animation: 'float 5s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                    '100%': { transform: 'translateY(0px)' },
                  }
                }}
              >
                <img
                  src={feature.img}
                  alt={feature.title}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        ))}
      </Container>
    </Box>
  );
};

export default HomePage;
