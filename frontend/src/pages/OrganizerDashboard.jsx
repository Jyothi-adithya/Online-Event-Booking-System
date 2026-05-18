import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Paper, Card, CardContent,
  CircularProgress, Divider, Avatar, Stack, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import {
  Event, Add, TrendingUp, ConfirmationNumber, AttachMoney,
  Visibility, Edit, ArrowForward
} from '@mui/icons-material';
import { getOrganizerDashboard, getOrganizerEvents } from '../services/eventService';

const StatCard = ({ icon, label, value, color = 'primary.light' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
          <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.15)', width: 48, height: 48 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [dash,   setDash]   = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrganizerDashboard(), getOrganizerEvents({ limit: 5 })])
      .then(([d, e]) => { setDash(d.data.data); setEvents(e.data.data.rows); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', py: 12 }}><CircularProgress size={60} /></Box>;

  const statusColor = { approved:'success', draft:'default', pending:'warning', rejected:'error', cancelled:'error' };

  return (
    <Box sx={{ minHeight:'100vh', py:4, background:'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:4, flexWrap:'wrap', gap:2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Organizer Dashboard</Typography>
            <Typography color="text.secondary">Manage your events and track performance</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} component={Link} to="/organizer/events/create" size="large">
            Create Event
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <Event color="primary" />, label: 'Total Events',    value: dash?.total_events   ?? 0 },
            { icon: <ConfirmationNumber color="secondary" />, label: 'Total Bookings', value: dash?.total_bookings ?? 0, color:'secondary.light' },
            { icon: <AttachMoney color="success" />, label: 'Total Revenue', value: `₹${parseFloat(dash?.total_revenue || 0).toLocaleString('en-IN')}`, color:'success.main' },
          ].map(s => (
            <Grid item xs={12} sm={4} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* Upcoming Events */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
            <Typography variant="h6" fontWeight={700}>My Events</Typography>
            <Button component={Link} to="/organizer/events" endIcon={<ArrowForward />} size="small">View All</Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {events.length === 0 ? (
            <Box sx={{ textAlign:'center', py:6, color:'text.secondary' }}>
              <Event sx={{ fontSize:60, opacity:0.3, mb:1 }} />
              <Typography>No events yet. Create your first event!</Typography>
              <Button component={Link} to="/organizer/events/create" variant="contained" sx={{ mt:2 }} startIcon={<Add />}>
                Create Event
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Title','Category','Date','Available','Price','Status','Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, color:'text.secondary' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map(ev => (
                    <TableRow key={ev.id} hover>
                      <TableCell>
                        <Typography fontWeight={600} noWrap sx={{ maxWidth:180 }}>{ev.title}</Typography>
                      </TableCell>
                      <TableCell><Chip label={ev.category_name} size="small" /></TableCell>
                      <TableCell>{new Date(ev.event_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</TableCell>
                      <TableCell>
                        <Typography color={ev.available_seats > 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                          {ev.available_seats}/{ev.total_seats}
                        </Typography>
                      </TableCell>
                      <TableCell>₹{parseFloat(ev.ticket_price).toLocaleString('en-IN')}</TableCell>
                      <TableCell><Chip label={ev.status} size="small" color={statusColor[ev.status] || 'default'} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" component={Link} to={`/events/${ev.id}`}><Visibility fontSize="small" /></IconButton>
                          <IconButton size="small" component={Link} to={`/organizer/events/${ev.id}/edit`}><Edit fontSize="small" /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Upcoming Events from dashboard */}
        {dash?.upcoming_events?.length > 0 && (
          <Paper sx={{ p:3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Upcoming Events</Typography>
            <Divider sx={{ mb:2 }} />
            <Stack spacing={2}>
              {dash.upcoming_events.map(ev => (
                <Box key={ev.id} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:1 }}>
                  <Box>
                    <Typography fontWeight={600}>{ev.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ev.event_date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })} · {ev.city}
                    </Typography>
                  </Box>
                  <Chip label={`${ev.booking_count} booked`} color="secondary" size="small" />
                </Box>
              ))}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
