import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Paper,
  InputAdornment, IconButton, Divider, CircularProgress, Alert
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, ConfirmationNumber } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../services/eventService';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/events';
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPass,setShowPass]= useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await loginAPI(form);
      login(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.full_name}! 👋`);
      const dest = data.data.user.role === 'admin' ? '/admin'
        : data.data.user.role === 'organizer' ? '/organizer' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 30%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(6,182,212,0.1) 0%, transparent 60%)',
      py: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <ConfirmationNumber sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>Welcome Back</Typography>
            <Typography color="text.secondary" mt={0.5}>Sign in to your EventHub account</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required autoFocus
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />
            <TextField label="Password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPass(p => !p)}>{showPass ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
              }} />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, mt: 1 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
          <Divider sx={{ my: 3 }}>Don&apos;t have an account?</Divider>
          <Button fullWidth component={Link} to="/register" variant="outlined">Create Account</Button>
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" fontWeight={600}>
              Demo Credentials
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Admin: admin@eventhub.com / admin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
