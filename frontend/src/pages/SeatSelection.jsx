import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Paper, Chip,
  CircularProgress, Alert, Divider, Tooltip, Stack, LinearProgress
} from '@mui/material';
import { EventSeat, Lock, CheckCircle, Cancel } from '@mui/icons-material';
import { getEvent, getSeats, lockSeats } from '../services/eventService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const seatColor = { available: '#1e293b', locked: '#78350f', booked: '#1a1a2e', selected: '#5B21B6' };
const seatBorder = { available: '#334155', locked: '#d97706', booked: '#3f3f46', selected: '#7C3AED' };

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event,    setEvent]    = useState(null);
  const [grouped,  setGrouped]  = useState({});
  const [selected, setSelected] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [locking,  setLocking]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, seatRes] = await Promise.all([getEvent(id), getSeats(id)]);
        setEvent(evRes.data.data);
        setGrouped(seatRes.data.data.grouped);
      } catch { setError('Failed to load seat map'); } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const toggle = (seat) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.locked_by !== user?.id) return;
    setSelected(p =>
      p.find(s => s.id === seat.id) ? p.filter(s => s.id !== seat.id)
      : p.length >= 10 ? (toast.error('Max 10 seats per booking'), p)
      : [...p, seat]
    );
  };

  const handleLockAndProceed = async () => {
    if (!selected.length) return toast.error('Please select at least 1 seat');
    setLocking(true);
    try {
      await lockSeats(parseInt(id), selected.map(s => s.id));
      toast.success(`${selected.length} seat(s) locked for 10 minutes!`);
      navigate(`/booking/confirmation`, { state: { event, selected_seats: selected } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock seats');
    } finally { setLocking(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress size={60} /></Box>;
  if (error)   return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;

  const totalPrice = selected.reduce((s, seat) => s + parseFloat(seat.price), 0);

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={800} gutterBottom>{event?.title}</Typography>
        <Typography color="text.secondary" gutterBottom>{new Date(event?.event_date).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} · {event?.venue}</Typography>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {[
            { color: seatColor.available, border: seatBorder.available, label: 'Available' },
            { color: seatColor.selected,  border: seatBorder.selected,  label: 'Selected' },
            { color: seatColor.locked,    border: seatBorder.locked,    label: 'Locked' },
            { color: seatColor.booked,    border: seatBorder.booked,    label: 'Booked' },
          ].map(({ color, border, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: color, border: `2px solid ${border}` }} />
              <Typography variant="caption">{label}</Typography>
            </Box>
          ))}
        </Stack>

        <Grid container spacing={3}>
          {/* Seat Map */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {/* Stage */}
              <Box sx={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', borderRadius: 2, p: 1.5, textAlign: 'center', mb: 4 }}>
                <Typography variant="body2" fontWeight={700} letterSpacing={4}>◀ STAGE ▶</Typography>
              </Box>

              {Object.entries(grouped).map(([rowLabel, seats]) => (
                <Box key={rowLabel} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ width: 20, minWidth: 20 }}>
                    {rowLabel}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {seats.map(seat => {
                      const isSelected = selected.find(s => s.id === seat.id);
                      const isBooked   = seat.status === 'booked';
                      const isLocked   = seat.status === 'locked';
                      const bg     = isSelected ? seatColor.selected : isBooked ? seatColor.booked : isLocked ? seatColor.locked : seatColor.available;
                      const border = isSelected ? seatBorder.selected : isBooked ? seatBorder.booked : isLocked ? seatBorder.locked : seatBorder.available;
                      return (
                        <Tooltip key={seat.id} title={`${seat.seat_code} · ${seat.seat_type} · ₹${parseFloat(seat.price).toLocaleString()}`} arrow>
                          <Box
                            onClick={() => toggle(seat)}
                            sx={{
                              width: { xs: 26, md: 32 }, height: { xs: 26, md: 32 },
                              borderRadius: 1, border: `2px solid ${border}`, bgcolor: bg,
                              cursor: isBooked || isLocked ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s ease',
                              '&:hover': { transform: (isBooked || isLocked) ? 'none' : 'scale(1.15)', zIndex: 1 },
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700, color: isSelected ? '#fff' : 'text.secondary' }}>
                              {seat.seat_number}
                            </Typography>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Booking Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Booking Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              {selected.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <EventSeat sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography>Select seats from the map</Typography>
                </Box>
              ) : (
                <>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {selected.map(seat => (
                      <Box key={seat.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip label={seat.seat_code} size="small" color="primary" variant="outlined" />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={seat.seat_type} size="small" sx={{ fontSize: '0.65rem' }} />
                          <Typography variant="body2" fontWeight={600}>₹{parseFloat(seat.price).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography fontWeight={600}>Total ({selected.length} seat{selected.length > 1 ? 's' : ''})</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.light">₹{totalPrice.toLocaleString('en-IN')}</Typography>
                  </Box>
                </>
              )}
              <Button fullWidth variant="contained" size="large" disabled={!selected.length || locking}
                onClick={handleLockAndProceed} startIcon={<Lock />} sx={{ py: 1.5 }}>
                {locking ? <CircularProgress size={22} color="inherit" /> : `Proceed to Book (${selected.length})`}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
                Seats held for 10 minutes after locking
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
