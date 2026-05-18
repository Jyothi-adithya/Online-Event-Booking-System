import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Button,
  TextField, MenuItem, CircularProgress, Stack, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Visibility, CheckCircle, Cancel, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAdminEvents, patchEventStatus, deleteEvent } from '../services/eventService';
import toast from 'react-hot-toast';

const statusColors = { approved:'success', draft:'default', pending:'warning', rejected:'error', cancelled:'error' };

export default function AdminEvents() {
  const [events,  setEvents]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState('');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const limit = 15;

  const load = () => {
    setLoading(true);
    const params = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    getAdminEvents(params)
      .then(r => { setEvents(r.data.data.rows); setTotal(r.data.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, status]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const handleStatus = async (id, newStatus) => {
    try {
      await patchEventStatus(id, newStatus);
      toast.success(`Event ${newStatus}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(deleteId);
      toast.success('Event deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Box sx={{ minHeight:'100vh', py:4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb:4 }}>
          <Typography variant="h4" fontWeight={800}>Event Management</Typography>
          <Typography color="text.secondary">{total} events on the platform</Typography>
        </Box>

        <Paper sx={{ p:3, mb:3 }}>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} sx={{ flex:1 }} />
            <TextField select label="Status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} sx={{ minWidth:160 }}>
              <MenuItem value="">All Statuses</MenuItem>
              {['approved','pending','draft','rejected','cancelled'].map(s => (
                <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        <Paper>
          {loading ? (
            <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Title','Organizer','Category','Date','Seats','Price','Status','Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, color:'text.secondary' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ py:6, color:'text.secondary' }}>No events found</TableCell></TableRow>
                  ) : events.map(ev => (
                    <TableRow key={ev.id} hover>
                      <TableCell>
                        <Typography fontWeight={600} noWrap sx={{ maxWidth:160 }}>{ev.title}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth:120 }}>{ev.organizer_name}</Typography></TableCell>
                      <TableCell><Chip label={ev.category_name} size="small" /></TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(ev.event_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={ev.available_seats > 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                          {ev.available_seats}/{ev.total_seats}
                        </Typography>
                      </TableCell>
                      <TableCell>₹{parseFloat(ev.ticket_price).toLocaleString('en-IN')}</TableCell>
                      <TableCell><Chip label={ev.status} size="small" color={statusColors[ev.status]||'default'} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" component={Link} to={`/events/${ev.id}`} title="View"><Visibility fontSize="small" /></IconButton>
                          {ev.status !== 'approved' && (
                            <IconButton size="small" color="success" onClick={() => handleStatus(ev.id,'approved')} title="Approve"><CheckCircle fontSize="small" /></IconButton>
                          )}
                          {ev.status !== 'rejected' && (
                            <IconButton size="small" color="warning" onClick={() => handleStatus(ev.id,'rejected')} title="Reject"><Cancel fontSize="small" /></IconButton>
                          )}
                          <IconButton size="small" color="error" onClick={() => setDeleteId(ev.id)} title="Delete"><Delete fontSize="small" /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {total > limit && (
            <Box sx={{ display:'flex', justifyContent:'center', p:3 }}>
              <Pagination count={Math.ceil(total/limit)} page={page} onChange={(_,v) => setPage(v)} color="primary" />
            </Box>
          )}
        </Paper>

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle fontWeight={700}>Delete Event?</DialogTitle>
          <DialogContent>
            <Alert severity="error">This will permanently delete the event, all its seats, and bookings. Cannot be undone.</Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
