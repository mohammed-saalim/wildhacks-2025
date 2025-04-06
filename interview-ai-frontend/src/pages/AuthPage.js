import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Stack,
  Fade
} from '@mui/material';
import axios from 'axios';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', username: '', password: '' }); // reset fields
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    const endpoint = isLogin
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register';

    const payload = isLogin
      ? { usernameOrEmail: formData.username, password: formData.password }
      : {
          name: formData.name,
          email: `${formData.username}`, // just dummy for now
          username: formData.username,
          password: formData.password
        };

    try {
      const response = await axios.post(endpoint, payload);
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('✅ Logged in!');
        window.location.href = '/profile'; // or redirect as needed
      } else {
        alert('✅ Registered! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Authentication failed'}`);
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #e0e7ff, #f8fafc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: 4,
              backgroundColor: 'white',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              textAlign="center"
              gutterBottom
              sx={{ color: '#3f3d56' }}
            >
              {isLogin ? 'Login to InView' : 'Create an Account'}
            </Typography>

            <Stack spacing={3}>
              {!isLogin && (
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                />
              )}
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleAuth}
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
