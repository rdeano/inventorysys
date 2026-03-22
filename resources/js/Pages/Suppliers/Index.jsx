import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Alert, Tooltip, Divider, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const emptyForm = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
};

export default function Index({ suppliers }) {
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState('');

    function handleOpen(supplier = null) {
        if (supplier) {
            setSelected(supplier);
            setForm({
                name: supplier.name,
                contact_person: supplier.contact_person || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                notes: supplier.notes || '',
            });
        } else {
            setSelected(null);
            setForm(emptyForm);
        }
        setErrors({});
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setSelected(null);
        setForm(emptyForm);
        setErrors({});
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        if (selected) {
            router.put(`/suppliers/${selected.id}`, form, {
                onSuccess: () => { handleClose(); setProcessing(false); },
                onError: (err) => { setErrors(err); setProcessing(false); },
            });
        } else {
            router.post('/suppliers', form, {
                onSuccess: () => { handleClose(); setProcessing(false); },
                onError: (err) => { setErrors(err); setProcessing(false); },
            });
        }
    }

    function handleDelete() {
        router.delete(`/suppliers/${selected.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    const filtered = suppliers.data.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AppLayout title="Suppliers">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Suppliers</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Supplier
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="Search by name, contact, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ mb: 2, width: 350 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Table */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><b>#</b></TableCell>
                            <TableCell><b>Supplier Name</b></TableCell>
                            <TableCell><b>Contact Person</b></TableCell>
                            <TableCell><b>Phone</b></TableCell>
                            <TableCell><b>Email</b></TableCell>
                            <TableCell><b>Address</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No suppliers found.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((supplier, index) => (
                                <TableRow key={supplier.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocalShippingIcon fontSize="small" color="primary" />
                                            <Typography fontWeight="medium">{supplier.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{supplier.contact_person || '—'}</TableCell>
                                    <TableCell>{supplier.phone || '—'}</TableCell>
                                    <TableCell>{supplier.email || '—'}</TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}>
                                        <Typography noWrap>{supplier.address || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="primary" onClick={() => handleOpen(supplier)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error"
                                                onClick={() => { setSelected(supplier); setDeleteOpen(true); }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 2.5,
                    px: 3
                }}>
                    {selected ? <EditIcon /> : <AddIcon />}
                    <Typography variant="h6" fontWeight="bold">
                        {selected ? 'Edit Supplier' : 'Add New Supplier'}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
                    <Box sx={{ p: 4 }}>

                        {/* Supplier Info */}
                        <Box sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold"
                                sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                🏢 SUPPLIER INFORMATION
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Supplier Name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        error={!!errors.name}
                                        helperText={errors.name || ' '}
                                        placeholder="e.g. ABC Trading Co."
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LocalShippingIcon fontSize="small" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Person"
                                        value={form.contact_person}
                                        onChange={e => setForm({ ...form, contact_person: e.target.value })}
                                        error={!!errors.contact_person}
                                        helperText={errors.contact_person || ' '}
                                        placeholder="e.g. Juan Dela Cruz"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        error={!!errors.phone}
                                        helperText={errors.phone || ' '}
                                        placeholder="e.g. 09XX-XXX-XXXX"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        error={!!errors.email}
                                        helperText={errors.email || ' '}
                                        placeholder="e.g. supplier@email.com"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Additional Info */}
                        <Box sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold"
                                sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                📝 ADDITIONAL INFORMATION
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        multiline
                                        rows={2}
                                        value={form.address}
                                        onChange={e => setForm({ ...form, address: e.target.value })}
                                        placeholder="e.g. 123 Street, City, Province"
                                        helperText=" "
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Notes"
                                        multiline
                                        rows={2}
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Any additional notes about this supplier..."
                                        helperText=" "
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </DialogContent>

                <Divider />
                <DialogActions sx={{ px: 4, py: 2.5, gap: 1, bgcolor: '#fafafa' }}>
                    <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ minWidth: 120, borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={processing} sx={{ minWidth: 120, borderRadius: 2 }}>
                        {processing ? 'Saving...' : selected ? 'Update Supplier' : 'Add Supplier'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Supplier</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Are you sure you want to delete <b>{selected?.name}</b>? This action cannot be undone.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </AppLayout>
    );
}