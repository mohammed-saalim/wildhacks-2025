import React, { useState } from 'react';
import { Box, Container, Paper, TextField, Typography, Button, Stack, Fade } from '@mui/material';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #e0e7ff, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Paper elevation={6} sx={{ borderRadius: 4, p: 4, backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom sx={{ color: '#3f3d56' }}>
              {isLogin ? 'Login to InView' : 'Create an Account'}
            </Typography>

            <Stack spacing={3}>
              {!isLogin && (
                <TextField label="Full Name" fullWidth variant="outlined" />
              )}
              <TextField label="Username" fullWidth variant="outlined" />
              <TextField label="Password" type="password" fullWidth variant="outlined" />
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '999px',
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                    boxShadow: '0 6px 18px rgba(99,102,241,0.6)'
                  }
                }}
              >
                {isLogin ? 'Login' : 'Register'}
              </Button>
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <Box
                    component="span"
                    onClick={toggleMode}
                    sx={{
                      color: '#4f46e5',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: '#4338ca'
                      }
                    }}
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </Box>
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default AuthPage;
