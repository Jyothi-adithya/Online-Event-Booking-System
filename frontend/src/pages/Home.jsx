import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Button, Card, CardContent,
  Chip, Stack, Avatar, Skeleton, Paper
} from '@mui/material';
import {
  ConfirmationNumber, Event, MusicNote, Computer, SportsSoccer,
  Palette, Business, Restaurant, Favorite, School, ArrowForward,
  FlashOn, Verified, Groups
} from '@mui/icons-material';
import { getEvents, getCategories } from '../services/eventService';
import { EventCard, EventCardSkeleton } from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const catIcons = {
  Music:<MusicNote/>, Technology:<Computer/>, Sports:<SportsSoccer/>,
  Arts:<Palette/>, Business:<Business/>, Food:<Restaurant/>,
  Health:<Favorite/>, Education:<School/>, Other:<Event/>,
};

const Feature = ({ icon, title, desc }) => (
  <Card sx={{ p:3, textAlign:'center', height:'100%' }}>
    <Avatar sx={{ width:64, height:64, bgcolor:'rgba(124,58,237,0.15)', mx:'auto', mb:2 }}>{icon}</Avatar>
    <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary">{desc}</Typography>
  </Card>
);

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents]       = useState([]);
  const [cats,   setCats]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      getEvents({ limit:8, status:'approved' }),
      getCategories(),
    ]).then(([ev, ct]) => {
      setEvents(ev.data.data.rows);
      setCats(ct.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* ── Hero ─────────────────────────────────────────── */}
      <Box sx={{
        minHeight: '92vh', display:'flex', alignItems:'center',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.25) 0%, transparent 60%), radial-gradient(ellipse at 75% 60%, rgba(6,182,212,0.15) 0%, transparent 60%), linear-gradient(180deg,#0A0A0F 0%,#0d0d18 100%)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Decorative blobs */}
        <Box sx={{ position:'absolute', top:'10%', right:'5%', width:400, height:400, borderRadius:'50%',
          background:'rgba(124,58,237,0.08)', filter:'blur(80px)', pointerEvents:'none' }} />
        <Box sx={{ position:'absolute', bottom:'5%', left:'10%', width:300, height:300, borderRadius:'50%',
          background:'rgba(6,182,212,0.08)', filter:'blur(60px)', pointerEvents:'none' }} />

        <Container maxWidth="lg" sx={{ py:{ xs:8, md:0 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="🎉 Discover Amazing Events" color="primary" variant="outlined"
                sx={{ mb:3, fontWeight:600, borderColor:'rgba(124,58,237,0.5)' }} />
              <Typography variant="h1" gutterBottom sx={{
                background:'linear-gradient(135deg, #F1F5F9 30%, #A78BFA 70%, #67E8F9 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1.15,
              }}>
                Your Next<br />Great Experience<br />Awaits
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb:4, lineHeight:1.7, maxWidth:480 }}>
                Discover, book and experience thousands of events — concerts, tech talks, sports, and more. All in one place.
              </Typography>
              <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
                <Button component={Link} to="/events" variant="contained" size="large"
                  endIcon={<ArrowForward />} sx={{ py:1.8, px:4, fontSize:'1rem' }}>
                  Browse Events
                </Button>
                {!isAuthenticated && (
                  <Button component={Link} to="/register" variant="outlined" size="large"
                    sx={{ py:1.8, px:4, fontSize:'1rem' }}>
                    Create Account
                  </Button>
                )}
                {isAuthenticated && user?.role === 'organizer' && (
                  <Button component={Link} to="/organizer/events/create" variant="outlined" size="large"
                    startIcon={<FlashOn />} sx={{ py:1.8, px:4, fontSize:'1rem' }}>
                    Create Event
                  </Button>
                )}
              </Stack>

              {/* Trust Badges */}
              <Stack direction="row" spacing={3} sx={{ mt:5, flexWrap:'wrap', gap:2 }}>
                {[
                  { icon:<Verified sx={{ color:'#10B981' }} />, label:'Verified Events' },
                  { icon:<Groups sx={{ color:'#7C3AED' }} />, label:'10K+ Users' },
                  { icon:<FlashOn sx={{ color:'#F59E0B' }} />, label:'Instant Booking' },
                ].map(({ icon, label }) => (
                  <Box key={label} sx={{ display:'flex', alignItems:'center', gap:0.8 }}>
                    {icon}
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Hero visual — stacked event cards */}
            <Grid item xs={12} md={6} sx={{ display:{ xs:'none', md:'flex' }, justifyContent:'center', alignItems:'center' }}>
              <Box sx={{ position:'relative', width:420, height:380 }}>
                {[
                  { top:0, left:40, title:'Jazz Night', date:'Sat, 20 Apr', seats:42, delay:'0s' },
                  { top:60, left:0, title:'TechConf 2025', date:'Sun, 21 Apr', seats:120, delay:'0.1s' },
                  { top:160, left:60, title:'Art Expo', date:'Mon, 22 Apr', seats:18, delay:'0.2s' },
                ].map((card, i) => (
                  <Paper key={i} sx={{
                    position:'absolute', top:card.top, left:card.left, width:280, p:2.5, borderRadius:3,
                    background:'rgba(19,19,26,0.9)', backdropFilter:'blur(20px)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    boxShadow:`0 ${8+i*4}px ${24+i*8}px rgba(0,0,0,0.4)`,
                    animation:`floatCard${i} 3s ease-in-out infinite`,
                    animationDelay: card.delay,
                    '@keyframes floatCard0':{ '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-8px)' } },
                    '@keyframes floatCard1':{ '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-6px)' } },
                    '@keyframes floatCard2':{ '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-10px)' } },
                  }}>
                    <Typography fontWeight={700} fontSize="0.95rem">{card.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{card.date}</Typography>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mt:1.5 }}>
                      <Chip label={`${card.seats} seats left`} size="small" color="success" />
                      <Chip label="Book Now" size="small" color="primary" />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Categories ──────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py:8 }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" gutterBottom>Browse by Category</Typography>
        <Typography color="text.secondary" textAlign="center" mb={5}>Find events that match your interests</Typography>
        <Grid container spacing={2} justifyContent="center">
          {cats.map(c => (
            <Grid item key={c.id}>
              <Button component={Link} to={`/events?category=${c.name}`} variant="outlined"
                startIcon={catIcons[c.name] || <Event />}
                sx={{
                  borderRadius:3, px:3, py:1.5, fontWeight:600,
                  borderColor:'rgba(255,255,255,0.1)',
                  '&:hover':{ borderColor:'primary.main', background:'rgba(124,58,237,0.1)' },
                }}>
                {c.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Featured Events ──────────────────────────────── */}
      <Box sx={{ background:'rgba(255,255,255,0.02)', py:8 }}>
        <Container maxWidth="xl">
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:5, flexWrap:'wrap', gap:2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800}>Featured Events</Typography>
              <Typography color="text.secondary">Handpicked upcoming experiences</Typography>
            </Box>
            <Button component={Link} to="/events" endIcon={<ArrowForward />} variant="outlined">See All Events</Button>
          </Box>
          <Grid container spacing={3}>
            {loading
              ? Array.from({ length:8 }).map((_,i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}><EventCardSkeleton /></Grid>
                ))
              : events.map(ev => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={ev.id}><EventCard event={ev} /></Grid>
                ))
            }
          </Grid>
        </Container>
      </Box>

      {/* ── Features ─────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py:10 }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" gutterBottom>Why Choose EventHub?</Typography>
        <Typography color="text.secondary" textAlign="center" mb={6}>Everything you need for a seamless booking experience</Typography>
        <Grid container spacing={3}>
          {[
            { icon:<FlashOn sx={{ fontSize:32, color:'#F59E0B' }} />, title:'Instant Booking', desc:'Book your seats in seconds with our streamlined checkout process.' },
            { icon:<Verified sx={{ fontSize:32, color:'#10B981' }} />, title:'Secure Payments', desc:'Simulated payments with full transaction tracking and refund support.' },
            { icon:<Event sx={{ fontSize:32, color:'#7C3AED' }} />, title:'Real-time Seats', desc:'Live seat map with locking to prevent double bookings.' },
            { icon:<Groups sx={{ fontSize:32, color:'#06B6D4' }} />, title:'All Roles Covered', desc:'Customer, Organizer, and Admin — each with their own powerful dashboard.' },
          ].map(f => (
            <Grid item xs={12} sm={6} md={3} key={f.title}><Feature {...f} /></Grid>
          ))}
        </Grid>
      </Container>

      {/* ── CTA ──────────────────────────────────────────── */}
      {!isAuthenticated && (
        <Box sx={{
          py:10, textAlign:'center',
          background:'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)',
          borderTop:'1px solid rgba(255,255,255,0.06)',
        }}>
          <Container maxWidth="sm">
            <ConfirmationNumber sx={{ fontSize:60, color:'primary.main', mb:2, opacity:0.8 }} />
            <Typography variant="h4" fontWeight={800} gutterBottom>Ready to Book?</Typography>
            <Typography color="text.secondary" mb={4}>Join thousands of event-goers and create unforgettable memories.</Typography>
            <Button component={Link} to="/register" variant="contained" size="large" sx={{ py:1.8, px:6, mr:2, fontSize:'1rem' }}>
              Get Started Free
            </Button>
            <Button component={Link} to="/events" variant="outlined" size="large" sx={{ py:1.8, px:4, fontSize:'1rem' }}>
              Browse Events
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
}
