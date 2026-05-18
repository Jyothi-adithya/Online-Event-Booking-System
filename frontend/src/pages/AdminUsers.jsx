import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Button,
  TextField, MenuItem, CircularProgress, Avatar, Stack, Pagination,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Block, CheckCircle, Delete, Search, PersonAdd } from '@mui/icons-material';
import { getAdminUsers, toggleUser, deleteUser as deleteUserAPI } from '../services/eventService';
import toast from 'react-hot-toast';

const roleColors = { admin:'error', organizer:'secondary', user:'primary' };

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const limit = 15;

  const load = () => {
    setLoading(true);
    const params = { page, limit };
    if (search) params.search = search;
    if (role)   params.role   = role;
    getAdminUsers(params)
      .then(r => { setUsers(r.data.data.rows); setTotal(r.data.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, role]);
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleUser(id);
      toast.success(data.message);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteUserAPI(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Box sx={{ minHeight:'100vh', py:4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:4, flexWrap:'wrap', gap:2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>User Management</Typography>
            <Typography color="text.secondary">{total} users registered on the platform</Typography>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p:3, mb:3 }}>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <TextField placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr:1, color:'text.secondary' }} /> }} sx={{ flex:1 }} />
            <TextField select label="Role" value={role} onChange={e => { setRole(e.target.value); setPage(1); }} sx={{ minWidth:160 }}>
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="organizer">Organizer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
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
                    {['User','Email','Role','Status','Joined','Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight:700, color:'text.secondary' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py:6, color:'text.secondary' }}>No users found</TableCell></TableRow>
                  ) : users.map(u => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                          <Avatar sx={{ width:36, height:36, bgcolor:'primary.main', fontSize:'0.85rem', fontWeight:700 }}>
                            {u.full_name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={600}>{u.full_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{u.email}</Typography></TableCell>
                      <TableCell><Chip label={u.role} size="small" color={roleColors[u.role] || 'default'} /></TableCell>
                      <TableCell>
                        <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small"
                          color={u.is_active ? 'success' : 'error'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleToggle(u.id)}
                            color={u.is_active ? 'error' : 'success'} title={u.is_active ? 'Deactivate' : 'Activate'}>
                            {u.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)} title="Delete user">
                            <Delete fontSize="small" />
                          </IconButton>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle fontWeight={700}>Delete User?</DialogTitle>
          <DialogContent>
            <Alert severity="error">This will permanently delete the user and all their data. This cannot be undone.</Alert>
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
