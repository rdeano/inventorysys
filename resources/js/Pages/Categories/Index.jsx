import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Alert, Tooltip, Chip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';

const emptyForm = { name: '', description: '' };

export default function Index({ categories }) {
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function handleOpen(category = null) {
        if (category) {
            setSelected(category);
            setForm({ name: category.name, description: category.description || '' });
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
            router.put(`/categories/${selected.id}`, form, {
                onSuccess: () => { handleClose(); setProcessing(false); },
                onError: (err) => { setErrors(err); setProcessing(false); },
            });
        } else {
            router.post('/categories', form, {
                onSuccess: () => { handleClose(); setProcessing(false); },
                onError: (err) => { setErrors(err); setProcessing(false); },
            });
        }
    }

    function handleDelete() {
        router.delete(`/categories/${selected.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <AppLayout title="Categories">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Categories</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Category
                </Button>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><b>#</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Description</b></TableCell>
                            <TableCell><b>Products</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No categories found.</TableCell>
                            </TableRow>
                        ) : (
                            categories.data.map((category, index) => (
                                <TableRow key={category.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CategoryIcon fontSize="small" color="primary" />
                                            {category.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{category.description || '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={`${category.products_count} products`} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="primary" onClick={() => handleOpen(category)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error"
                                                onClick={() => { setSelected(category); setDeleteOpen(true); }}
                                                disabled={category.products_count > 0}
                                            >
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
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selected ? <EditIcon /> : <AddIcon />}
                    <Typography variant="h6" fontWeight="bold">
                        {selected ? 'Edit Category' : 'Add New Category'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            error={!!errors.name}
                            helperText={errors.name}
                            placeholder="e.g. Electronics"
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional description..."
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ minWidth: 100 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={processing} sx={{ minWidth: 100 }}>
                        {processing ? 'Saving...' : selected ? 'Update' : 'Add Category'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Category</DialogTitle>
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