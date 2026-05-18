import { useState } from 'react';
import {
  Box, Container, Grid, Typography, Paper, TextField, Button,
  Avatar, Alert, CircularProgress, Divider, InputAdornment, IconButton
} from '@mui/material';
import { Person, Email, Phone, Lock, Visibility, VisibilityOff, Save } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/eventService';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [passForm,    setPassForm]    = useState({ current_password:'', new_password:'', confirm:'' });
  const [showPass,    setShowPass]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [savingPass,  setSavingPass]  = useState(false);
  const [profileErr,  setProfileErr]  = useState('');
  const [passErr,     setPassErr]     = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true); setProfileErr('');
    try {
      await updateProfile(profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) { setProfileErr(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm) {
      setPassErr('New passwords do not match'); return;
    }
    if (passForm.new_password.length < 6) {
      setPassErr('Password must be at least 6 characters'); return;
    }
    setSavingPass(true); setPassErr('');
    try {
      await changePassword({ current_password: passForm.current_password, new_password: passForm.new_password });
      toast.success('Password changed successfully!');
      setPassForm({ current_password:'', new_password:'', confirm:'' });
    } catch (err) { setPassErr(err.response?.data?.message || 'Failed to change password'); }
    finally { setSavingPass(false); }
  };

  const roleColors = { admin:'error', organizer:'secondary', user:'primary' };

  return (
    <Box sx={{ minHeight:'100vh', py:4, background:'radial-gradient(ellipse at top, rgba(124,58,237,0.06) 0%, transparent 50%)' }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={800} gutterBottom>My Profile</Typography>
        <Typography color="text.secondary" gutterBottom>Manage your account settings</Typography>

        <Grid container spacing={3} sx={{ mt:1 }}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:4, textAlign:'center' }}>
              <Avatar sx={{ width:100, height:100, bgcolor:'primary.main', fontSize:'2.5rem', fontWeight:800, mx:'auto', mb:2 }}>
                {user?.full_name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{user?.email}</Typography>
              <Box sx={{ mt:1, px:2, py:0.5, display:'inline-block', borderRadius:2,
                bgcolor: user?.role==='admin'?'rgba(239,68,68,0.1)':user?.role==='organizer'?'rgba(6,182,212,0.1)':'rgba(124,58,237,0.1)',
                border:'1px solid', borderColor: user?.role==='admin'?'error.dark':user?.role==='organizer'?'secondary.dark':'primary.dark' }}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform:'uppercase', letterSpacing:1 }}>
                  {user?.role}
                </Typography>
              </Box>
              <Divider sx={{ my:3 }} />
              <Typography variant="caption" color="text.secondary">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month:'long', year:'numeric' }) : 'N/A'}
              </Typography>
            </Paper>
          </Grid>

          {/* Edit Profile */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p:4, mb:3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Edit Profile</Typography>
              <Divider sx={{ mb:3 }} />
              {profileErr && <Alert severity="error" sx={{ mb:2 }}>{profileErr}</Alert>}
              <Box component="form" onSubmit={handleProfileSave}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField fullWidth required label="Full Name" value={profileForm.full_name}
                      onChange={e => setProfileForm(p => ({ ...p, full_name:e.target.value }))}
                      InputProps={{ startAdornment:<InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth disabled label="Email Address" value={user?.email}
                      InputProps={{ startAdornment:<InputAdornment position="start"><Email color="action" /></InputAdornment> }}
                      helperText="Email cannot be changed" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Phone Number" value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone:e.target.value }))}
                      InputProps={{ startAdornment:<InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} disabled={saving}>
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Change Password */}
            <Paper sx={{ p:4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
              <Divider sx={{ mb:3 }} />
              {passErr && <Alert severity="error" sx={{ mb:2 }}>{passErr}</Alert>}
              <Box component="form" onSubmit={handlePassChange}>
                <Grid container spacing={2.5}>
                  {[
                    { label:'Current Password', key:'current_password' },
                    { label:'New Password',      key:'new_password' },
                    { label:'Confirm New Password', key:'confirm' },
                  ].map(f => (
                    <Grid item xs={12} key={f.key}>
                      <TextField fullWidth required label={f.label} type={showPass ? 'text' : 'password'}
                        value={passForm[f.key]} onChange={e => setPassForm(p => ({ ...p, [f.key]:e.target.value }))}
                        InputProps={{
                          startAdornment:<InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                          endAdornment: f.key==='current_password' ? (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPass(p => !p)}>{showPass ? <VisibilityOff /> : <Visibility />}</IconButton>
                            </InputAdornment>
                          ) : undefined,
                        }} />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button type="submit" variant="outlined" color="warning"
                      startIcon={savingPass ? <CircularProgress size={18} color="inherit" /> : <Lock />} disabled={savingPass}>
                      Change Password
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
