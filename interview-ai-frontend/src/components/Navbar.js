import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/InView-light.png';
import userIcon from '../assets/user-icon-white.png'; // 🔁 Add your user icon here

function Navbar() {
  return (
    <Box sx={{ background: 'linear-gradient(to bottom, #eef2ff, #f0f4ff)', py: 4 }}>
      <Container maxWidth="md">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #3b3c58, #6366f1)',
            borderRadius: '2rem',
            boxShadow: '8px 8px 20px rgba(0,0,0,0.2), -6px -6px 12px rgba(255,255,255,0.3)',
            px: 4,
            py: 0,
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Typography
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <img
              src={logo}
              alt="InView logo"
              style={{
                height: '85px',
                maxWidth: '150px',
                maxHeight: '100%',
                objectFit: 'contain',
                marginRight: '10px',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
              }}
            />
          </Typography>

          {/* Navigation and Login Icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {['Home', 'Interview', 'Upload'].map((label, index) => (
              <Button
                key={index}
                component={Link}
                to={`/${label.toLowerCase() === 'home' ? '' : label.toLowerCase()}`}
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.05)',
                    borderRadius: '1rem'
                  }
                }}
              >
                {label}
              </Button>
            ))}

            {/* User Icon */}
            <Tooltip title="Login / Signup">
              <Link to="/authenticate">
                <img
                  src={userIcon}
                  alt="Login/Signup"
                  style={{
                    height: '32px',
                    width: '32px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                />
              </Link>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Navbar;
