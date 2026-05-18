import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Paper, Chip,
  Divider, MenuItem, TextField, Stack, Alert, CircularProgress
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { createBooking } from '../services/eventService';
import toast from 'react-hot-toast';

const paymentMethods = [
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'upi',  label: 'UPI',                 icon: '📱' },
  { value: 'netbanking', label: 'Net Banking',    icon: '🏦' },
  { value: 'wallet',     label: 'Wallet',         icon: '👛' },
];

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [method,  setMethod]  = useState('card');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const event   = state?.event;
  const seats   = state?.selected_seats || [];
  const total   = seats.reduce((s, seat) => s + parseFloat(seat.price), 0);

  if (!event || !seats.length) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="warning">No booking data. Please select seats first.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/events')} variant="contained">Browse Events</Button>
      </Container>
    );
  }

  const handleConfirm = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await createBooking({
        event_id: event.id,
        seat_ids: seats.map(s => s.id),
        payment_method: method,
      });
      toast.success('Booking confirmed! 🎉');
      navigate(`/bookings/${data.data.booking_id}`, { replace: true, state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={800} gutterBottom>Confirm Booking</Typography>
        <Typography color="text.secondary" gutterBottom>Review your order and complete payment</Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Order Summary */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography fontWeight={600} fontSize="1.1rem">{event.title}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(event.event_date).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                {' · '}{event.venue}, {event.city}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {seats.map(seat => (
                  <Box key={seat.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={seat.seat_code} size="small" color="primary" />
                      <Chip label={seat.seat_type} size="small" variant="outlined" />
                    </Box>
                    <Typography fontWeight={600}>₹{parseFloat(seat.price).toLocaleString('en-IN')}</Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
                <Typography variant="h5" fontWeight={800} color="primary.light">
                  ₹{total.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Paper>

            {/* Payment Selection */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Payment Method</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {paymentMethods.map(m => (
                  <Box key={m.value}
                    onClick={() => setMethod(m.value)}
                    sx={{
                      p: 2, borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                      border: '2px solid', transition: 'all 0.2s',
                      borderColor: method === m.value ? 'primary.main' : 'rgba(255,255,255,0.08)',
                      background: method === m.value ? 'rgba(124,58,237,0.1)' : 'transparent',
                    }}>
                    <Typography fontSize="1.4rem">{m.icon}</Typography>
                    <Typography fontWeight={method === m.value ? 700 : 400}>{m.label}</Typography>
                    {method === m.value && <CheckCircle color="primary" sx={{ ml: 'auto' }} />}
                  </Box>
                ))}
              </Stack>
              <Alert severity="info" sx={{ mt: 2, fontSize: '0.82rem' }}>
                This is a simulated payment — no real charges will occur.
              </Alert>
            </Paper>
          </Grid>

          {/* Action Panel */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Payment Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Seats</Typography>
                  <Typography fontWeight={600}>{seats.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Payment</Typography>
                  <Typography fontWeight={600}>{paymentMethods.find(m => m.value === method)?.label}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={600}>₹{total.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Platform Fee</Typography>
                  <Typography fontWeight={600} color="success.main">FREE</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h5" fontWeight={800} color="primary.light">₹{total.toLocaleString('en-IN')}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" onClick={handleConfirm}
                disabled={loading} sx={{ py: 1.8, fontSize: '1rem' }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : `Pay ₹${total.toLocaleString('en-IN')}`}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                🔒 Encrypted · Simulated Payment
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
