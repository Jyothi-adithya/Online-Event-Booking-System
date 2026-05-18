import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Typography, TextField, InputAdornment,
  MenuItem, Button, Pagination, Chip, Skeleton, Stack
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { getEvents, getCategories } from '../services/eventService';
import { EventCard, EventCardSkeleton } from '../components/EventCard';
import { useSearchParams } from 'react-router-dom';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events,     setEvents]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    city:     searchParams.get('city')     || '',
    date:     searchParams.get('date')     || '',
  });

  const limit = 12;

  useEffect(() => { getCategories().then(r => setCategories(r.data.data)); }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
      const { data } = await getEvents(params);
      setEvents(data.data.rows);
      setTotal(data.data.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleFilter = (key, val) => {
    setFilters(p => ({ ...p, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => { setFilters({ search: '', category: '', city: '', date: '' }); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.08) 0%, transparent 50%)' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>Discover Events</Typography>
          <Typography color="text.secondary" variant="h6" fontWeight={400}>
            Find the perfect event for you — {total > 0 && `${total} events found`}
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4, p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth placeholder="Search events..." value={filters.search}
                onChange={e => handleFilter('search', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField fullWidth select label="Category" value={filters.category}
                onChange={e => handleFilter('category', e.target.value)}>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField fullWidth label="City" placeholder="Any city" value={filters.city}
                onChange={e => handleFilter('city', e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField fullWidth type="date" label="Date" value={filters.date}
                onChange={e => handleFilter('date', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={2}>
              {hasFilters && (
                <Button fullWidth onClick={clearFilters} startIcon={<Clear />} variant="outlined" color="secondary">
                  Clear Filters
                </Button>
              )}
            </Grid>
          </Grid>

          {/* Active filter chips */}
          {hasFilters && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
              {filters.category && <Chip label={`Category: ${filters.category}`} onDelete={() => handleFilter('category', '')} size="small" color="primary" />}
              {filters.city     && <Chip label={`City: ${filters.city}`}         onDelete={() => handleFilter('city', '')}     size="small" color="primary" />}
              {filters.date     && <Chip label={`Date: ${filters.date}`}         onDelete={() => handleFilter('date', '')}     size="small" color="primary" />}
              {filters.search   && <Chip label={`Search: ${filters.search}`}     onDelete={() => handleFilter('search', '')}   size="small" color="primary" />}
            </Stack>
          )}
        </Box>

        {/* Event Grid */}
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}><EventCardSkeleton /></Grid>
              ))
            : events.length === 0
            ? <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Typography variant="h5" color="text.secondary" gutterBottom>No events found</Typography>
                  <Typography color="text.secondary">Try adjusting your filters</Typography>
                  {hasFilters && <Button sx={{ mt: 2 }} onClick={clearFilters} variant="outlined">Clear all filters</Button>}
                </Box>
              </Grid>
            : events.map(ev => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ev.id}><EventCard event={ev} /></Grid>
              ))
          }
        </Grid>

        {/* Pagination */}
        {total > limit && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={Math.ceil(total / limit)} page={page}
              onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              color="primary" size="large" />
          </Box>
        )}
      </Container>
    </Box>
  );
}
