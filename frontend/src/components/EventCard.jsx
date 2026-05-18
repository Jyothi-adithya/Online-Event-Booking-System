import { Card, CardMedia, CardContent, CardActions, Box, Typography, Chip, Button, Skeleton } from '@mui/material';
import { CalendarMonth, LocationOn, ConfirmationNumber } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const categoryColors = {
  Music: 'secondary', Technology: 'primary', Sports: 'success',
  Arts: 'warning', Business: 'info', Food: 'error', Health: 'success',
  Education: 'primary', Comedy: 'warning', Other: 'default',
};

export function EventCard({ event }) {
  const imgUrl = event.image_url
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${event.image_url}`
    : `https://picsum.photos/seed/${event.id}/600/340`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={imgUrl}
        alt={event.title}
        sx={{ objectFit: 'cover' }}
        onError={(e) => { e.target.src = `https://picsum.photos/seed/${event.id + 10}/600/340`; }}
      />
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Chip
          label={event.category_name}
          size="small"
          color={categoryColors[event.category_name] || 'default'}
          sx={{ mb: 1.5, fontWeight: 600 }}
        />
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap title={event.title}>
          {event.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'text.secondary' }}>
          <CalendarMonth fontSize="small" />
          <Typography variant="body2">
            {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}{event.start_time?.slice(0, 5)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <LocationOn fontSize="small" />
          <Typography variant="body2" noWrap>{event.venue}, {event.city}</Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" color="primary.light" fontWeight={700}>
            {event.ticket_price === 0 ? 'FREE' : `₹${parseFloat(event.ticket_price).toLocaleString('en-IN')}`}
          </Typography>
          <Typography variant="caption" color={event.available_seats > 0 ? 'success.main' : 'error.main'} fontWeight={600}>
            {event.available_seats > 0 ? `${event.available_seats} seats left` : 'Sold Out'}
          </Typography>
        </Box>
        <Button
          component={Link}
          to={`/events/${event.id}`}
          variant="contained"
          size="small"
          startIcon={<ConfirmationNumber />}
          disabled={event.available_seats === 0}
        >
          {event.available_seats > 0 ? 'Book Now' : 'Sold Out'}
        </Button>
      </CardActions>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="70%" />
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Skeleton variant="rounded" width={80} height={36} />
        <Skeleton variant="rounded" width={100} height={36} sx={{ ml: 'auto' }} />
      </CardActions>
    </Card>
  );
}
