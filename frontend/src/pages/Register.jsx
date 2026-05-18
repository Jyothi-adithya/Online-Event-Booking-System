import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Paper,
  InputAdornment, IconButton, Divider, CircularProgress, Alert, MenuItem
} from '@mui/material';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff, ConfirmationNumber } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { register as registerAPI } from '../services/eventService';
import toast from 'react-hot-toast';

export default function Register() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await registerAPI(form);
      login(data.data.user, data.data.token);
      toast.success('Welcome to EventHub! 🎉');
      navigate(form.role === 'organizer' ? '/organizer' : '/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 20%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.1) 0%, transparent 60%)',
      py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <ConfirmationNumber sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>Create Account</Typography>
            <Typography color="text.secondary" mt={0.5}>Join EventHub and start booking</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required
              InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
            <TextField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
            <TextField label="Password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(p => !p)}>{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
              }} />
            <TextField label="Phone (optional)" name="phone" value={form.phone} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />
            <TextField select label="Join as" name="role" value={form.role} onChange={handleChange}>
              <MenuItem value="user">Customer — Book Events</MenuItem>
              <MenuItem value="organizer">Organizer — Host Events</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, mt: 1 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }}>Already have an account?</Divider>
          <Button fullWidth component={Link} to="/login" variant="outlined">Sign In</Button>
        </Paper>
      </Container>
    </Box>
  );
}
