import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Chip, Button,
  CircularProgress, Alert, Divider, Stack, Pagination
} from '@mui/material';
import { ConfirmationNumber, CalendarMonth, LocationOn, ArrowForward } from '@mui/icons-material';
import { getMyBookings } from '../services/eventService';

const statusColors = { confirmed: 'success', pending: 'warning', cancelled: 'error', refunded: 'secondary' };

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const limit = 8;

  useEffect(() => {
    setLoading(true);
    getMyBookings({ page, limit })
      .then(r => { setBookings(r.data.data.rows); setTotal(r.data.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.06) 0%, transparent 50%)' }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={800} gutterBottom>My Bookings</Typography>
        <Typography color="text.secondary" gutterBottom>{total} booking{total !== 1 ? 's' : ''} total</Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : bookings.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ConfirmationNumber sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>No bookings yet</Typography>
            <Button component={Link} to="/events" variant="contained" sx={{ mt: 2 }}>Browse Events</Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {bookings.map(b => {
              const imgUrl = b.image_url ? `${BASE}${b.image_url}` : `https://picsum.photos/seed/${b.event_id}/200/120`;
              return (
                <Paper key={b.id} sx={{ overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box component="img" src={imgUrl} alt={b.event_title}
                    onError={e => { e.target.src = `https://picsum.photos/seed/${b.event_id + 5}/200/120`; }}
                    sx={{ width: { xs: '100%', sm: 160 }, height: { xs: 140, sm: 'auto' }, objectFit: 'cover' }} />
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="h6" fontWeight={700}>{b.event_title}</Typography>
                      <Chip label={b.status.toUpperCase()} size="small" color={statusColors[b.status] || 'default'} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonth fontSize="small" />
                        <Typography variant="body2">{new Date(b.event_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">{b.city}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ConfirmationNumber fontSize="small" />
                        <Typography variant="body2">{b.total_seats} seat{b.total_seats > 1 ? 's' : ''}</Typography>
                      </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">{b.booking_reference}</Typography>
                        <Typography fontWeight={700} color="primary.light">₹{parseFloat(b.total_amount).toLocaleString('en-IN')}</Typography>
                      </Box>
                      <Button component={Link} to={`/bookings/${b.id}`} endIcon={<ArrowForward />} size="small" variant="outlined">
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}

        {total > limit && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Container>
    </Box>
  );
}
