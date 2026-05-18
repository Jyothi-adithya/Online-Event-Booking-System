import { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Paper, Card, CardContent,
  CircularProgress, Divider, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Stack
} from '@mui/material';
import {
  People, Event, ConfirmationNumber, AttachMoney,
  TrendingUp, BarChart
} from '@mui/icons-material';
import { getAdminDashboard, getAdminReports } from '../services/eventService';

const StatCard = ({ icon, label, value, sub, color = 'primary.light' }) => (
  <Card sx={{ height:'100%' }}>
    <CardContent>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
          <Typography variant="h4" fontWeight={800} color={color}>{value}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor:'rgba(124,58,237,0.15)', width:52, height:52 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [dash,    setDash]    = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAdminReports()])
      .then(([d, r]) => { setDash(d.data.data); setReports(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', py:12 }}><CircularProgress size={60} /></Box>;

  return (
    <Box sx={{ minHeight:'100vh', py:4, background:'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="xl">
        <Box sx={{ mb:4 }}>
          <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
          <Typography color="text.secondary">Full platform overview and analytics</Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb:4 }}>
          {[
            { icon:<People color="primary" />,             label:'Total Users',    value: dash?.total_users    ?? 0 },
            { icon:<Event color="secondary" />,            label:'Total Events',   value: dash?.total_events   ?? 0, color:'secondary.light' },
            { icon:<ConfirmationNumber color="success" />, label:'Confirmed Bookings', value: dash?.total_bookings ?? 0, color:'success.main' },
            { icon:<AttachMoney color="warning" />,        label:'Total Revenue',  value: `₹${parseFloat(dash?.total_revenue||0).toLocaleString('en-IN')}`, color:'warning.main' },
          ].map(s => (
            <Grid item xs={12} sm={6} md={3} key={s.label}><StatCard {...s} /></Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb:4 }}>
          {/* Recent Bookings */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ p:3, height:'100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Recent Bookings</Typography>
              <Divider sx={{ mb:2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Reference','User','Event','Amount','Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight:700, color:'text.secondary', fontSize:'0.75rem' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dash?.recent_bookings || []).map(b => (
                      <TableRow key={b.id} hover>
                        <TableCell><Typography fontFamily="monospace" fontSize="0.78rem">{b.booking_reference}</Typography></TableCell>
                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth:100 }}>{b.full_name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth:140 }}>{b.event_title}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>₹{parseFloat(b.total_amount).toLocaleString('en-IN')}</Typography></TableCell>
                        <TableCell>
                          <Chip label={b.status} size="small"
                            color={b.status==='confirmed'?'success':b.status==='cancelled'?'error':'warning'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Top Events */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ p:3, height:'100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Top Events by Bookings</Typography>
              <Divider sx={{ mb:2 }} />
              <Stack spacing={2}>
                {(dash?.top_events || []).map((ev, idx) => (
                  <Box key={ev.id} sx={{ display:'flex', alignItems:'center', gap:2 }}>
                    <Avatar sx={{
                      width:32, height:32, fontSize:'0.85rem', fontWeight:800,
                      bgcolor: idx===0?'#7C3AED':idx===1?'#06B6D4':idx===2?'#10B981':'rgba(255,255,255,0.1)'
                    }}>{idx+1}</Avatar>
                    <Box sx={{ flex:1, minWidth:0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{ev.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{ev.city}</Typography>
                    </Box>
                    <Box sx={{ textAlign:'right' }}>
                      <Typography variant="body2" fontWeight={700} color="primary.light">{ev.booking_count}</Typography>
                      <Typography variant="caption" color="text.secondary">bookings</Typography>
                    </Box>
                  </Box>
                ))}
                {(!dash?.top_events || dash.top_events.length === 0) && (
                  <Typography color="text.secondary" textAlign="center" py={4}>No events data yet</Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Monthly Revenue */}
        <Paper sx={{ p:3, mb:4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Monthly Revenue (Last 12 Months)</Typography>
          <Divider sx={{ mb:2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Month','Transactions','Revenue'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, color:'text.secondary' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(reports?.monthlyRevenue || []).length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py:4, color:'text.secondary' }}>No revenue data yet</TableCell></TableRow>
                ) : (reports?.monthlyRevenue || []).map(r => (
                  <TableRow key={r.month} hover>
                    <TableCell fontWeight={600}>{r.month}</TableCell>
                    <TableCell>{r.transactions}</TableCell>
                    <TableCell><Typography fontWeight={700} color="success.main">₹{parseFloat(r.revenue).toLocaleString('en-IN')}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Category Stats */}
        <Paper sx={{ p:3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Bookings by Category</Typography>
          <Divider sx={{ mb:2 }} />
          <Grid container spacing={2}>
            {(reports?.categoryStats || []).map(c => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={c.category}>
                <Card sx={{ p:2 }} variant="outlined">
                  <Typography fontWeight={700}>{c.category}</Typography>
                  <Typography variant="h5" color="primary.light" fontWeight={800}>{c.bookings}</Typography>
                  <Typography variant="caption" color="text.secondary">₹{parseFloat(c.revenue).toLocaleString('en-IN')} revenue</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
