import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Chip, Divider,
  CircularProgress, Alert, Paper, Avatar, Stack
} from '@mui/material';
import {
  CalendarMonth, LocationOn, AccessTime, ConfirmationNumber,
  Category, Person, ArrowBack, EventSeat
} from '@mui/icons-material';
import { getEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function EventDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event,   setEvent]  = useState(null);
  const [loading, setLoading]= useState(true);
  const [error,   setError]  = useState('');

  useEffect(() => {
    getEvent(id).then(r => setEvent(r.data.data)).catch(() => setError('Event not found')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress size={60} /></Box>;
  if (error)   return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;

  const imgUrl = event.image_url ? `${BASE}${event.image_url}` : `https://picsum.photos/seed/${event.id}/1200/500`;
  const date   = new Date(event.event_date);
  const isSoldOut = event.available_seats === 0;

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      {/* Hero Image */}
      <Box sx={{ position: 'relative', height: { xs: 250, md: 420 }, overflow: 'hidden' }}>
        <Box component="img" src={imgUrl} alt={event.title}
          onError={e => { e.target.src = `https://picsum.photos/seed/${event.id+5}/1200/500`; }}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,15,0.2), rgba(10,10,15,0.85))' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: { xs: 3, md: 5 } }}>
          <Container maxWidth="lg">
            <Chip label={event.category_name} color="secondary" sx={{ mb: 2, fontWeight: 700 }} />
            <Typography variant="h2" fontWeight={800} sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)', mb: 1 }}>
              {event.title}
            </Typography>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3, color: 'text.secondary' }}>
          Back to Events
        </Button>

        <Grid container spacing={4}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>About this Event</Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {event.description}
              </Typography>
            </Paper>

            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Event Details</Typography>
              <Stack spacing={2}>
                {[
                  { icon: <CalendarMonth color="primary" />, label: 'Date', value: date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { icon: <AccessTime color="primary" />, label: 'Time', value: `${event.start_time?.slice(0,5)}${event.end_time ? ` – ${event.end_time.slice(0,5)}` : ''}` },
                  { icon: <LocationOn color="primary" />, label: 'Venue', value: `${event.venue}, ${event.city}${event.state ? `, ${event.state}` : ''}, ${event.country}` },
                  { icon: <Category color="primary" />, label: 'Category', value: event.category_name },
                  { icon: <Person color="primary" />, label: 'Organizer', value: event.organizer_name },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.15)', width: 40, height: 40 }}>{icon}</Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                      <Typography fontWeight={500}>{value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Booking Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h4" fontWeight={800} color="primary.light" gutterBottom>
                {event.ticket_price === 0 ? 'FREE' : `₹${parseFloat(event.ticket_price).toLocaleString('en-IN')}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>per seat (standard)</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total Seats</Typography>
                  <Typography fontWeight={600}>{event.total_seats}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Available</Typography>
                  <Typography fontWeight={600} color={isSoldOut ? 'error.main' : 'success.main'}>
                    {isSoldOut ? 'Sold Out' : event.available_seats}
                  </Typography>
                </Box>
              </Stack>

              {isSoldOut ? (
                <Alert severity="error">This event is sold out.</Alert>
              ) : isAuthenticated ? (
                <Button fullWidth variant="contained" size="large" startIcon={<EventSeat />}
                  component={Link} to={`/events/${event.id}/seats`} sx={{ py: 1.5 }}>
                  Select Seats
                </Button>
              ) : (
                <Button fullWidth variant="contained" size="large" startIcon={<ConfirmationNumber />}
                  component={Link} to="/login" state={{ from: { pathname: `/events/${event.id}/seats` } }} sx={{ py: 1.5 }}>
                  Login to Book
                </Button>
              )}

              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                🔒 Secure payments · Instant confirmation
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
