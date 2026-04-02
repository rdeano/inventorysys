import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { router } from '@inertiajs/react';
import {
    Box, Button, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Grid, Alert, Tooltip, Divider, InputAdornment,
    MenuItem, Chip, Tab, Tabs
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Pagination from '../../Components/Pagination';

const emptyForm = {
    type: 'purchase',
    supplier_id: '',
    customer_name: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }],
};

const statusColor = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
};

export default function Index({ orders, products, suppliers, filters }) {
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState(filters?.type || 'all');

    function handleTabChange(e, value) {
        setTab(value);
        router.get('/orders', { type: value === 'all' ? '' : value }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleOpen() {
        setForm(emptyForm);
        setErrors({});
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setForm(emptyForm);
        setErrors({});
    }

    function handleEditOpen(order) {
        setSelected(order);
        setEditOpen(true);
    }

    function addItem() {
        setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1, unit_price: 0 }] });
    }

    function removeItem(index) {
        setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    }

    function updateItem(index, field, value) {
        const items = [...form.items];
        items[index][field] = value;
        if (field === 'product_id') {
            const product = products.find(p => p.id == value);
            if (product) items[index].unit_price = product.price;
        }
        setForm({ ...form, items });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post('/orders', form, {
            onSuccess: () => { handleClose(); setProcessing(false); },
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        router.put(`/orders/${selected.id}`, { status: selected.status, notes: selected.notes }, {
            onSuccess: () => setEditOpen(false),
        });
    }

    function handleDelete() {
        router.delete(`/orders/${selected.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    const total = form.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

    const filtered = orders.data
        .filter(o => tab === 'all' || o.type === tab)
        .filter(o =>
            o.order_number.toLowerCase().includes(search.toLowerCase()) ||
            (o.supplier?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.customer_name || '').toLowerCase().includes(search.toLowerCase())
        );

    return (
        <AppLayout title="Orders">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Orders</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Create Order
                </Button>
            </Box>

            {/* Tabs */}
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="All Orders" value="all" />
                <Tab label="Purchase Orders" value="purchase" />
                <Tab label="Sales Orders" value="sales" />
            </Tabs>

            {/* Search */}
            <TextField
                placeholder="Search by order number, supplier, or customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{ mb: 2, width: 400 }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                }}
            />

            {/* Table */}
            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><b>Order #</b></TableCell>
                            <TableCell><b>Type</b></TableCell>
                            <TableCell><b>Supplier / Customer</b></TableCell>
                            <TableCell><b>Date</b></TableCell>
                            <TableCell><b>Items</b></TableCell>
                            <TableCell><b>Total</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No orders found.</TableCell>
                            </TableRow>
                        ) : (
                            filtered.map(order => (
                                <TableRow key={order.id} hover>
                                    <TableCell><b>{order.order_number}</b></TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.type === 'purchase' ? 'Purchase' : 'Sales'}
                                            color={order.type === 'purchase' ? 'primary' : 'secondary'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {order.type === 'purchase'
                                            ? order.supplier?.name || '—'
                                            : order.customer_name || '—'}
                                    </TableCell>
                                    <TableCell>{order.order_date}</TableCell>
                                    <TableCell>{order.items?.length || 0} items</TableCell>
                                    <TableCell>₱{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            color={statusColor[order.status]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit Status">
                                            <IconButton size="small" color="primary" onClick={() => handleEditOpen(order)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error"
                                                onClick={() => { setSelected(order); setDeleteOpen(true); }}>
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
            <Pagination data={orders} />

            {/* Create Order Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1, py: 2.5, px: 3 }}>
                    <ShoppingCartIcon />
                    <Typography variant="h6" fontWeight="bold">Create New Order</Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
                    <Box sx={{ p: 4 }}>

                        {/* Order Details */}
                        <Box sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
                                📋 ORDER DETAILS
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{xs:12,sm:6}}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Order Type"
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    >
                                        <MenuItem value="purchase">Purchase Order</MenuItem>
                                        <MenuItem value="sales">Sales Order</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid size={{xs:12,sm:6}}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Order Date"
                                        value={form.order_date}
                                        onChange={e => setForm({ ...form, order_date: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                {form.type === 'purchase' ? (
                                    <Grid size={{xs:12,sm:6}}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Supplier"
                                            value={form.supplier_id}
                                            onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                                        >
                                            <MenuItem value="">— None —</MenuItem>
                                            {suppliers.map(s => (
                                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                ) : (
                                    <Grid size={{xs:12,sm:6}}>
                                        <TextField
                                            fullWidth
                                            label="Customer Name"
                                            value={form.customer_name}
                                            onChange={e => setForm({ ...form, customer_name: e.target.value })}
                                            placeholder="e.g. Juan Dela Cruz"
                                        />
                                    </Grid>
                                )}
                                <Grid size={{xs:12,sm:6}}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Status"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid size={{xs:12,sm:6}}>
                                    <TextField
                                        fullWidth
                                        label="Notes"
                                        multiline
                                        rows={2}
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Optional notes..."
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Order Items */}
                        <Box sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                    🛒 ORDER ITEMS
                                </Typography>
                                <Button size="small" startIcon={<AddCircleIcon />} onClick={addItem}>
                                    Add Item
                                </Button>
                            </Box>

                            {form.items.map((item, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 2 }} alignItems="center">
                                    <Grid size={{xs:12,sm:12}}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Product"
                                            value={item.product_id}
                                            onChange={e => updateItem(index, 'product_id', e.target.value)}
                                            size="small"
                                            error={!!errors[`items.${index}.product_id`]}
                                        >
                                            <MenuItem value="">— Select Product —</MenuItem>
                                            {products.map(p => (
                                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{xs:12,sm:12}}>
                                        <TextField
                                            fullWidth
                                            label="Qty"
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', e.target.value)}
                                            size="small"
                                            inputProps={{ min: 1 }}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12,sm:12}}>
                                        <TextField
                                            fullWidth
                                            label="Unit Price"
                                            type="number"
                                            value={item.unit_price}
                                            onChange={e => updateItem(index, 'unit_price', e.target.value)}
                                            size="small"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₱</InputAdornment>
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{xs:12,sm:12}} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            ₱{(item.quantity * item.unit_price).toFixed(2)}
                                        </Typography>
                                        {form.items.length > 1 && (
                                            <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                                                <RemoveCircleIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Grid>
                                </Grid>
                            ))}

                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Total: ₱{total.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <Divider />
                <DialogActions sx={{ px: 4, py: 2.5, gap: 1, bgcolor: '#fafafa' }}>
                    <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ minWidth: 120, borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={processing} sx={{ minWidth: 120, borderRadius: 2 }}>
                        {processing ? 'Saving...' : 'Create Order'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Status Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={selected?.status || ''}
                            onChange={e => setSelected({ ...selected, status: e.target.value })}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={selected?.notes || ''}
                            onChange={e => setSelected({ ...selected, notes: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit}>Update</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Order</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Are you sure you want to delete order <b>{selected?.order_number}</b>? This action cannot be undone.
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