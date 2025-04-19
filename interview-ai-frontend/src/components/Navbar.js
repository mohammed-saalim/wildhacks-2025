import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/InView-light.png';
import userIcon from '../assets/user-icon-white.png';

function Navbar() {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const isGuest = token === 'demo-token';
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    navigate('/');
    window.location.reload();
  };

  const navItems = isLoggedIn
  ? ['Home', 'Interview', 'Upload', 'About']
  : ['Home', 'About'];


  return (
    <Box sx={{ bgcolor: '#e0e7ff', py: 4 }}>
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

          {/* Navigation + User */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {navItems.map((label, index) => {
              const route =
                label.toLowerCase() === 'home'
                  ? '/'
                  : label.toLowerCase() === 'interview'
                  ? '/interview-setup'
                  : `/${label.toLowerCase()}`;

              return (
                <Button
                  key={index}
                  component={Link}
                  to={route}
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
              );
            })}

            {(isLoggedIn || isGuest) ? (
              <>
                <Tooltip title="Account">
                  <IconButton onClick={handleMenuOpen}>
                    <img
                      src={userIcon}
                      alt="User Icon"
                      style={{
                        height: '32px',
                        width: '32px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease-in-out',
                        filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))',
                      }}
                    />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  sx={{ mt: '40px' }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {isGuest ? (
                  <MenuItem onClick={() => navigate('/authenticate')}>Login / Register</MenuItem>
                ) : ([
                  <MenuItem key="profile" component={Link} to="/profile" onClick={handleMenuClose}>
                    Profile
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleLogout}>Logout</MenuItem>
                ])}

                </Menu>
              </>
            ) : (
              <Tooltip title="Login / Signup">
                <Link to="/authenticate">
                  <img
                    src={userIcon}
                    alt="User Icon"
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
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Navbar;
