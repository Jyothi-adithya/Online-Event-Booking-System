import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  MenuItem, CircularProgress, Alert, Divider, InputAdornment
} from '@mui/material';
import { Save, ArrowBack, CloudUpload } from '@mui/icons-material';
import { getCategories, createEvent, getEvent, updateEvent } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INITIAL = {
  title:'', description:'', venue:'', city:'', state:'', country:'India',
  event_date:'', start_time:'', end_time:'', total_seats:100,
  ticket_price:0, category_id:'', status:'approved',
};

export default function CreateEvent({ editMode = false }) {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [form,     setForm]       = useState(INITIAL);
  const [cats,     setCats]       = useState([]);
  const [imageFile,setImageFile]  = useState(null);
  const [preview,  setPreview]    = useState('');
  const [loading,  setLoading]    = useState(false);
  const [fetching, setFetching]   = useState(editMode);
  const [error,    setError]      = useState('');

  useEffect(() => {
    getCategories().then(r => setCats(r.data.data));
    if (editMode && id) {
      getEvent(id).then(r => {
        const ev = r.data.data;
        setForm({
          title: ev.title, description: ev.description, venue: ev.venue,
          city: ev.city, state: ev.state || '', country: ev.country,
          event_date: ev.event_date?.split('T')[0], start_time: ev.start_time?.slice(0,5),
          end_time: ev.end_time?.slice(0,5) || '', total_seats: ev.total_seats,
          ticket_price: ev.ticket_price, category_id: ev.category_id, status: ev.status,
        });
        if (ev.image_url) {
          const BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';
          setPreview(`${BASE}${ev.image_url}`);
        }
      }).finally(() => setFetching(false));
    }
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editMode) {
        await updateEvent(id, fd);
        toast.success('Event updated!');
        navigate(`/events/${id}`);
      } else {
        const { data } = await createEvent(fd);
        toast.success('Event created successfully!');
        navigate(`/events/${data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally { setLoading(false); }
  };

  if (fetching) return <Box sx={{ display:'flex', justifyContent:'center', py:12 }}><CircularProgress size={60} /></Box>;

  return (
    <Box sx={{ minHeight:'100vh', py:4 }}>
      <Container maxWidth="md">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb:3, color:'text.secondary' }}>Back</Button>
        <Typography variant="h4" fontWeight={800} gutterBottom>{editMode ? 'Edit Event' : 'Create New Event'}</Typography>
        <Typography color="text.secondary" gutterBottom>Fill in the event details below</Typography>

        {error && <Alert severity="error" sx={{ mb:3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Paper sx={{ p:4, mb:3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Basic Information</Typography>
            <Divider sx={{ mb:3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth required label="Event Title" name="title" value={form.title} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth required multiline rows={4} label="Description" name="description" value={form.description} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select required label="Category" name="category_id" value={form.category_id} onChange={handleChange}>
                  {cats.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              </Grid>
              {user?.role === 'admin' && (
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Status" name="status" value={form.status} onChange={handleChange}>
                    {['draft','approved','rejected','cancelled'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Paper sx={{ p:4, mb:3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Date & Time</Typography>
            <Divider sx={{ mb:3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required type="date" label="Event Date" name="event_date" value={form.event_date} onChange={handleChange} InputLabelProps={{ shrink:true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required type="time" label="Start Time" name="start_time" value={form.start_time} onChange={handleChange} InputLabelProps={{ shrink:true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth type="time" label="End Time (optional)" name="end_time" value={form.end_time} onChange={handleChange} InputLabelProps={{ shrink:true }} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p:4, mb:3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Venue & Location</Typography>
            <Divider sx={{ mb:3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth required label="Venue Name" name="venue" value={form.venue} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required label="City" name="city" value={form.city} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="State" name="state" value={form.state} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth required label="Country" name="country" value={form.country} onChange={handleChange} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p:4, mb:3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Tickets & Pricing</Typography>
            <Divider sx={{ mb:3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Total Seats" name="total_seats" value={form.total_seats}
                  onChange={handleChange} disabled={editMode}
                  helperText={editMode ? 'Seats cannot be changed after creation' : 'Max 10,000'}
                  inputProps={{ min:1, max:10000 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Ticket Price" name="ticket_price" value={form.ticket_price}
                  onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  inputProps={{ min:0, step:0.01 }} helperText="Set 0 for free events" />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p:4, mb:4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Event Image</Typography>
            <Divider sx={{ mb:3 }} />
            <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              {preview && (
                <Box component="img" src={preview} alt="Preview"
                  sx={{ width:'100%', maxHeight:260, objectFit:'cover', borderRadius:2, border:'2px solid rgba(255,255,255,0.1)' }} />
              )}
              <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                {imageFile ? 'Change Image' : 'Upload Event Image'}
                <input type="file" accept="image/*" hidden onChange={handleImage} />
              </Button>
              <Typography variant="caption" color="text.secondary">JPG, PNG, WebP — Max 5MB</Typography>
            </Box>
          </Paper>

          <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={loading}>
              {editMode ? 'Update Event' : 'Create Event'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
