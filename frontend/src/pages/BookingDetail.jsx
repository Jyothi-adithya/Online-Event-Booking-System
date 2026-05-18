import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Paper, Chip,
  Divider, CircularProgress, Alert, Stack, Avatar
} from '@mui/material';
import {
  CheckCircle, ConfirmationNumber, CalendarMonth,
  LocationOn, Cancel, ArrowBack, Receipt
} from '@mui/icons-material';
import { getBooking, cancelBooking } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = { confirmed: 'success', pending: 'warning', cancelled: 'error', refunded: 'secondary' };

export default function BookingDetail() {
  const { id }     = useParams();
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [booking,  setBooking]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getBooking(id).then(r => setBooking(r.data.data)).catch(() => toast.error('Booking not found')).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking? Refund will be processed.')) return;
    setCancelling(true);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled. Refund initiated.');
      setBooking(p => ({ ...p, status: 'cancelled' }));
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
    finally { setCancelling(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress size={60} /></Box>;
  if (!booking) return <Container><Alert severity="error" sx={{ mt: 4 }}>Booking not found</Alert></Container>;

  const isConfirmed = booking.status === 'confirmed';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/bookings')} sx={{ mb: 3, color: 'text.secondary' }}>
          My Bookings
        </Button>

        {state?.success && (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3, fontSize: '1rem' }}>
            🎉 Booking confirmed! Your ticket has been reserved successfully.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            {/* Booking Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" fontWeight={800}>{booking.event_title}</Typography>
                <Chip label={booking.status.toUpperCase()} color={statusColors[booking.status] || 'default'} fontWeight={700} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.15)' }}><ConfirmationNumber color="primary" /></Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Booking Reference</Typography>
                    <Typography fontWeight={700} fontFamily="monospace" fontSize="1.1rem">{booking.booking_reference}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.15)' }}><CalendarMonth color="primary" /></Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Event Date</Typography>
                    <Typography fontWeight={600}>{new Date(booking.event_date).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} · {booking.start_time?.slice(0,5)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.15)' }}><LocationOn color="primary" /></Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Venue</Typography>
                    <Typography fontWeight={600}>{booking.venue}, {booking.city}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>

            {/* Seats */}
            {booking.seats?.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Booked Seats</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {booking.seats.map(seat => (
                    <Box key={seat.seat_code} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={seat.seat_code} size="small" color="primary" />
                        <Chip label={seat.seat_type} size="small" variant="outlined" />
                      </Box>
                      <Typography fontWeight={600}>₹{parseFloat(seat.price).toLocaleString('en-IN')}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700}>Total Paid</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.light">
                    ₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Payment */}
            {booking.payment && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Payment Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Method</Typography>
                    <Typography fontWeight={600}>{booking.payment.payment_method?.toUpperCase()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Transaction ID</Typography>
                    <Typography fontWeight={600} fontFamily="monospace">{booking.payment.transaction_id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Status</Typography>
                    <Chip label={booking.payment.payment_status} size="small" color={booking.payment.payment_status === 'success' ? 'success' : 'warning'} />
                  </Box>
                </Stack>
              </Paper>
            )}
          </Grid>

          {/* Actions Panel */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Actions</Typography>
              <Divider sx={{ mb: 2 }} />
              {isConfirmed && (
                <Button fullWidth variant="outlined" color="error" startIcon={<Cancel />}
                  onClick={handleCancel} disabled={cancelling} sx={{ mb: 2 }}>
                  {cancelling ? <CircularProgress size={20} color="inherit" /> : 'Cancel Booking'}
                </Button>
              )}
              <Button fullWidth variant="outlined" color="primary" startIcon={<Receipt />} onClick={() => window.print()}>
                Print Ticket
              </Button>
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Typography variant="body2" color="success.main" fontWeight={600} textAlign="center">
                  Booked on {new Date(booking.created_at).toLocaleDateString('en-IN')}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
