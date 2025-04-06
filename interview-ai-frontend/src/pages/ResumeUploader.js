import React, { useState } from 'react';
import { Box, Button, Container, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';

const ResumeUploader = () => {
  const [jd, setJd] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '',
    certificates: '',
    username: ''
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);

      const formData = new FormData();
      formData.append('resume', file);

      try {
        const response = await axios.post('/api/extract-resume-data', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const { name, email, skills, certificates } = response.data;
        setFormData((prev) => ({
          ...prev,
          name,
          email,
          skills,
          certificates
        }));
      } catch (error) {
        console.error('Error extracting resume data:', error);
      }
    } else {
      alert('Only PDF files are accepted.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      jd,
      ...formData
    };

    try {
      await axios.post('/api/update-candidate-profile', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>


      <Typography variant="h4" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Upload Resume</Typography>

      <Select
        fullWidth
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        displayEmpty
        sx={{ mb: 3 }}
      >
        <MenuItem value="" disabled>Select Job Description</MenuItem>
        <MenuItem value="JD 1">JD 1</MenuItem>
        <MenuItem value="JD 2">JD 2</MenuItem>
        <MenuItem value="JD 3">JD 3</MenuItem>
        <MenuItem value="JD 4">JD 4</MenuItem>
      </Select>

      <Button variant="contained" component="label" sx={{ mb: 3, backgroundColor: '#1976d2' }}>
        Upload Resume (PDF only)
        <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
      </Button>

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Full Name" name="name" value={formData.name} onChange={handleInputChange} fullWidth />
        <TextField label="Email" name="email" value={formData.email} onChange={handleInputChange} fullWidth />
        <TextField label="Skills" name="skills" value={formData.skills} onChange={handleInputChange} fullWidth />
        <TextField label="Certificates" name="certificates" value={formData.certificates} onChange={handleInputChange} fullWidth />
        <TextField label="Username" name="username" value={formData.username} onChange={handleInputChange} fullWidth />
        <Button variant="contained" sx={{ mt: 2, backgroundColor: '#1976d2' }} onClick={handleSubmit}>Submit</Button>
      </Box>
    </Container>
  );
};

export default ResumeUploader;