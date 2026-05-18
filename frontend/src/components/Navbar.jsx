import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, IconButton, Typography, Avatar,
  Menu, MenuItem, Divider, Chip, useMediaQuery, Drawer, List,
  ListItem, ListItemButton, ListItemText, ListItemIcon,
} from '@mui/material';
import {
  ConfirmationNumber, Menu as MenuIcon, Login, PersonAdd,
  Event, Dashboard, AdminPanelSettings, Person, History,
  Logout, Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin, isOrganizer } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl,   setAnchorEl]   = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setAnchorEl(null); };

  const roleBadge = isAdmin ? { label: 'Admin', color: 'error' }
    : user?.role === 'organizer' ? { label: 'Organizer', color: 'secondary' }
    : null;

  const navLinks = [
    { label: 'Events', path: '/events', icon: <Event fontSize="small" /> },
    ...(isAuthenticated ? [
      { label: 'My Bookings', path: '/bookings', icon: <History fontSize="small" /> },
    ] : []),
    ...(isOrganizer ? [
      { label: 'Organizer', path: '/organizer', icon: <Dashboard fontSize="small" /> },
    ] : []),
    ...(isAdmin ? [
      { label: 'Admin', path: '/admin', icon: <AdminPanelSettings fontSize="small" /> },
    ] : []),
  ];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: 68 }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 4 }}>
          <ConfirmationNumber sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg,#A78BFA,#67E8F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EventHub
          </Typography>
        </Box>

        {/* Desktop Nav */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            {navLinks.map(l => (
              <Button key={l.path} component={Link} to={l.path} startIcon={l.icon}
                sx={{ color: location.pathname.startsWith(l.path) ? 'primary.light' : 'text.secondary',
                      '&:hover': { color: 'text.primary', background: 'rgba(124,58,237,0.1)' } }}>
                {l.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Auth Actions */}
        {isAuthenticated ? (
          <>
            {roleBadge && !isMobile && (
              <Chip label={roleBadge.label} color={roleBadge.color} size="small" sx={{ mr: 2 }} />
            )}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                {user?.full_name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { mt: 1.5, minWidth: 200 } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{user?.full_name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
                <Person fontSize="small" sx={{ mr: 1.5 }} /> Profile
              </MenuItem>
              <MenuItem component={Link} to="/bookings" onClick={() => setAnchorEl(null)}>
                <History fontSize="small" sx={{ mr: 1.5 }} /> My Bookings
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout fontSize="small" sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isMobile && (
              <Button component={Link} to="/login" startIcon={<Login />} variant="outlined" color="primary" size="small">
                Login
              </Button>
            )}
            <Button component={Link} to="/register" startIcon={<PersonAdd />} variant="contained" size="small">
              Sign Up
            </Button>
          </Box>
        )}

        {/* Mobile Hamburger */}
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, background: 'background.paper' } }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700}>Navigation</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
        </Box>
        <Divider />
        <List>
          {navLinks.map(l => (
            <ListItem key={l.path} disablePadding>
              <ListItemButton component={Link} to={l.path} onClick={() => setDrawerOpen(false)}>
                <ListItemIcon>{l.icon}</ListItemIcon>
                <ListItemText primary={l.label} />
              </ListItemButton>
            </ListItem>
          ))}
          {!isAuthenticated && (
            <>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><Login fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/register" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
            </>
          )}
          {isAuthenticated && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}
