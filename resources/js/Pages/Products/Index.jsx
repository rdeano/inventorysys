import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { router, useForm } from '@inertiajs/react';
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip,
    IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert,
    InputAdornment, Tooltip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'box', 'pack', 'dozen'];

const emptyForm = {
    name: '',
    sku: '',
    category_id: '',
    supplier_id : '',
    unit: 'pcs',
    price: '',
    stock: '',
    low_stock_threshold: 10,
    description: '',
};

export default function Index({ products, categories, suppliers }) {
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    function handleOpen(product = null) {
        if (product) {
            setSelectedProduct(product);
            setData({
                name: product.name,
                sku: product.sku,
                category: product.category || '',
                supplier_id: product.supplier_id || '',
                unit: product.unit,
                price: product.price,
                stock: product.stock,
                low_stock_threshold: product.low_stock_threshold,
                description: product.description || '',
            });
        } else {
            setSelectedProduct(null);
            reset();
        }
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setSelectedProduct(null);
        reset();
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (selectedProduct) {
            router.put(`/products/${selectedProduct.id}`, data, {
                onSuccess: () => handleClose(),
            });
        } else {
            router.post('/products', data, {
                onSuccess: () => handleClose(),
            });
        }
    }

    function handleDelete() {
        router.delete(`/products/${selectedProduct.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    const filtered = products.data.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout title="Products">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Products</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Product
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="Search by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ mb: 2, width: 300 }}
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
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>SKU</b></TableCell>
                            <TableCell><b>Supplier</b></TableCell>
                            <TableCell><b>Category</b></TableCell>
                            <TableCell><b>Unit</b></TableCell>
                            <TableCell><b>Price</b></TableCell>
                            <TableCell><b>Stock</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No products found.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((product, index) => (
                                <TableRow key={product.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>{product.supplier?.name || '—'}</TableCell>
                                    <TableCell>{product.category?.name || '—'}</TableCell>
                                    <TableCell>{product.unit}</TableCell>
                                    <TableCell>₱{parseFloat(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={product.stock <= product.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                                            color={product.stock <= product.low_stock_threshold ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="primary" onClick={() => handleOpen(product)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => { setSelectedProduct(product); setDeleteOpen(true); }}>
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
                    {selectedProduct ? <EditIcon /> : <AddIcon />}
                    <Typography variant="h6" fontWeight="bold">
                        {selectedProduct ? 'Edit Product' : 'Add New Product'}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
                    <Box sx={{ p: 4 }}>

                        {/* Basic Information */}
                        <Box sx={{
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            p: 3,
                            mb: 3
                        }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold"
                                sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                📦 BASIC INFORMATION
                            </Typography>

                            <Grid spacing={2}>
                                <Grid item>
                                    <TextField
                                        fullWidth
                                        label="Product Name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name || ' '}
                                        placeholder="e.g. Wireless Mouse"
                                    />
                                </Grid>
                                <Grid>
                                    <TextField
                                        fullWidth
                                        label="SKU / Barcode"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        error={!!errors.sku}
                                        helperText={errors.sku || ' '}
                                        placeholder="e.g. WM-001"
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Supplier"
                                        value={data.supplier_id}
                                        onChange={e => setData('supplier_id', e.target.value)}
                                        helperText=" "
                                    >
                                        <MenuItem value="">— None —</MenuItem>
                                        {suppliers.map(s => (
                                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item >
                                    <TextField
                                        fullWidth
                                        select
                                        label="Category"
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        helperText=" "
                                    >
                                        <MenuItem value="">— None —</MenuItem>
                                        {categories.map(c => (
                                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Unit of Measure"
                                        value={data.unit}
                                        onChange={e => setData('unit', e.target.value)}
                                        helperText=" "
                                    >
                                        {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={3}
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Optional product description..."
                                        helperText=" "
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Pricing & Stock */}
                        <Box sx={{
                            bgcolor: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            p: 3,
                        }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold"
                                sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                💰 PRICING & STOCK
                            </Typography>

                            <Grid>
                                <Grid item>
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        error={!!errors.price}
                                        helperText={errors.price || ' '}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₱</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item >
                                    <TextField
                                        fullWidth
                                        label="Stock Quantity"
                                        type="number"
                                        value={data.stock}
                                        onChange={e => setData('stock', e.target.value)}
                                        error={!!errors.stock}
                                        helperText={errors.stock || ' '}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">{data.unit}</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item >
                                    <TextField
                                        fullWidth
                                        label="Low Stock Threshold"
                                        type="number"
                                        value={data.low_stock_threshold}
                                        onChange={e => setData('low_stock_threshold', e.target.value)}
                                        helperText="Alert when stock falls below this"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">{data.unit}</InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                    </Box>
                </DialogContent>

                <Divider />
                <DialogActions sx={{ px: 4, py: 2.5, gap: 1, bgcolor: '#fafafa' }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        color="inherit"
                        sx={{ minWidth: 120, borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={processing}
                        sx={{ minWidth: 120, borderRadius: 2 }}
                    >
                        {processing ? 'Saving...' : selectedProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Are you sure you want to delete <b>{selectedProduct?.name}</b>? This action cannot be undone.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AppLayout>
    );
}