import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ConfirmationNumber } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Box sx={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
      <Container maxWidth="sm">
        <Typography variant="h1" fontWeight={900} sx={{
          fontSize:'8rem', background:'linear-gradient(135deg,#7C3AED,#06B6D4)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1,
        }}>404</Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>Page Not Found</Typography>
        <Typography color="text.secondary" mb={4}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button component={Link} to="/" variant="contained" size="large" startIcon={<ConfirmationNumber />}>
          Back to Home
        </Button>
      </Container>
    </Box>
  );
}
