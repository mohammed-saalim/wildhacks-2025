import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import logo from '../assets/InView-light.png'; // make sure this path is correct

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
            transform: 'perspective(1000px) rotateX(1deg)',
            transition: 'all 0.3s ease-in-out'
          }}
        >
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
              style={{  height: '85px',        // ⬆️ Increased height
                maxWidth: '150px',     // ⬅️ Avoids stretching
                maxHeight: '100%',
                objectFit: 'contain',
                marginRight: '10px',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
            />
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Home', 'Interview', 'Upload'].map((label, index) => (
              <Button
                key={index}
                color="inherit"
                component={Link}
                to={`/${label.toLowerCase() === 'home' ? '' : label.toLowerCase()}`}
                sx={{
                  color: 'white',
                  fontWeight: 600,
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
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Navbar;
