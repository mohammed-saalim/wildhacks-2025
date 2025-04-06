import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(to right, #3b3c58, #6366f1)',
        color: 'white',
        py: 3,
        textAlign: 'center',
        mt: 10,
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} InView. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
