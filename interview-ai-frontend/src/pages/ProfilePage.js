import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/authenticate');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        alert('Session expired or invalid. Please log in again.');
        navigate('/authenticate');
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: 'linear-gradient(to bottom, #eef2ff, #f0f4ff)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 6,
            p: 5,
            background: 'linear-gradient(135deg, #3b3c58, #6366f1)',
            color: 'white',
            boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
            User Profile
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="gray">Full Name</Typography>
              <Typography variant="h6" fontWeight={500}>{user.name || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="gray">Email Address</Typography>
              <Typography variant="h6" fontWeight={500}>{user.email || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="gray">Username</Typography>
              <Typography variant="h6" fontWeight={500}>{user.username || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="gray">Domain</Typography>
              <Typography variant="h6" fontWeight={500}>{user.domain || '-'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" color="gray">Skills</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                {(user.skills && user.skills.length > 0) ? (
                  user.skills.map((skill, idx) => (
                    <Chip
                      key={idx}
                      label={skill}
                      sx={{
                        backgroundColor: '#818cf8',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        px: 2,
                        py: 0.5,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2">No skills added</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" color="gray">Certifications</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                {(user.certifications && user.certifications.length > 0) ? (
                  user.certifications.map((cert, idx) => (
                    <Chip
                      key={idx}
                      label={cert}
                      sx={{
                        backgroundColor: '#6366f1',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        px: 2,
                        py: 0.5,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2">No certifications added</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfilePage;
