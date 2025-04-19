import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#e0e7ff'}}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Mohammed Saalim Kartapillai •{' '}
        <a
          href="https://github.com/mohammed-saalim/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: '#3f51b5' }}
        >
          GitHub
        </a>{' '}
        |{' '}
        <a
          href="https://www.linkedin.com/in/mohammed-saalim/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: '#3f51b5' }}
        >
          LinkedIn
        </a>
      </Typography>
    </Box>

  );
};

export default Footer;
