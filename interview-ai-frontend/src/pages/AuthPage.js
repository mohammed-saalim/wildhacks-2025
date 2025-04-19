import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Stack,
  Fade,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Chip
} from '@mui/material';
import axios from 'axios';

const skillsList = ['React', 'JavaScript', 'Node.js', 'Python', 'Tailwind', 'TypeScript', 'MUI', 'Redux', 'Next.js'];
const certsList = ['AWS Certified Developer', 'Google UX Design', 'Microsoft Azure Fundamentals', 'Certified Kubernetes Administrator'];
const backendBaseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    domain: '',
    skills: [],
    certifications: []
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      domain: '',
      skills: [],
      certifications: []
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiChange = (e, field) => {
    const {
      target: { value }
    } = e;
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleAuth = async () => {
    const endpoint = isLogin
      ? `${backendBaseUrl}/api/auth/login`
      : `${backendBaseUrl}/api/auth/register`;

    const payload = isLogin
      ? { usernameOrEmail: formData.username, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          domain: formData.domain,
          skills: formData.skills,
          certifications: formData.certifications
        };

    try {
      const response = await axios.post(endpoint, payload);
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/';
      } else {
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
                <>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />

                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />

                  <TextField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />

                  <TextField
                    label="Domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Skills</InputLabel>
                    <Select
                      multiple
                      name="skills"
                      value={formData.skills}
                      onChange={(e) => handleMultiChange(e, 'skills')}
                      input={<OutlinedInput label="Skills" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {skillsList.map((skill) => (
                        <MenuItem key={skill} value={skill}>
                          {skill}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Certifications</InputLabel>
                    <Select
                      multiple
                      name="certifications"
                      value={formData.certifications}
                      onChange={(e) => handleMultiChange(e, 'certifications')}
                      input={<OutlinedInput label="Certifications" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {certsList.map((cert) => (
                        <MenuItem key={cert} value={cert}>
                          {cert}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {isLogin && (
                <>
                  <TextField
                    label="Username or Email"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                  />
                </>
              )}

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
              <Button
                variant="text"
                onClick={() => {
                  localStorage.setItem("token", "demo-token"); // fake token if needed
                  localStorage.setItem("user", JSON.stringify({ name: "Demo User", username: "demo" }));
                  window.location.href = '/';
                }}
                sx={{
                  color: '#6b7280',
                  textTransform: 'none',
                  mt: 1,
                  fontWeight: 500,
                  '&:hover': {
                    color: '#4f46e5',
                    textDecoration: 'underline'
                  }
                }}
              >
                Skip Login / Continue as Guest →
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
