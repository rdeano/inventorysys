import React from 'react';
import AppLayout from '../Layouts/AppLayout';
import {
    Box, Typography, Card, CardContent, Grid,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Divider
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';

const statusColor = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
};

export default function Dashboard({
    stats,
    lowStockProducts,
    recentOrders,
    monthlySales,
    monthlyPurchases,
}) {
    const statCards = [
        { title: 'Total Products', value: stats.totalProducts, icon: <InventoryIcon fontSize="large" />, color: '#1976d2', bg: '#e3f2fd' },
        { title: 'Categories', value: stats.totalCategories, icon: <CategoryIcon fontSize="large" />, color: '#7b1fa2', bg: '#f3e5f5' },
        { title: 'Suppliers', value: stats.totalSuppliers, icon: <LocalShippingIcon fontSize="large" />, color: '#0288d1', bg: '#e1f5fe' },
        { title: 'Low Stock', value: stats.lowStockCount, icon: <WarningIcon fontSize="large" />, color: '#ed6c02', bg: '#fff3e0' },
        { title: 'Out of Stock', value: stats.outOfStock, icon: <WarningIcon fontSize="large" />, color: '#d32f2f', bg: '#ffebee' },
        { title: 'Pending Orders', value: stats.pendingOrders, icon: <PendingIcon fontSize="large" />, color: '#f57c00', bg: '#fff8e1' },
        { title: 'Total Sales', value: `₱${parseFloat(stats.totalSalesAmount).toFixed(2)}`, icon: <TrendingUpIcon fontSize="large" />, color: '#2e7d32', bg: '#e8f5e9' },
        { title: 'Total Purchases', value: `₱${parseFloat(stats.totalPurchaseAmount).toFixed(2)}`, icon: <TrendingDownIcon fontSize="large" />, color: '#9c27b0', bg: '#f3e5f5' },
    ];

    // Merge monthly chart data
    const months = [...new Set([
        ...monthlySales.map(m => m.month),
        ...monthlyPurchases.map(m => m.month),
    ])].sort();

    const chartData = months.map(month => ({
        month,
        Sales: parseFloat(monthlySales.find(m => m.month === month)?.total || 0),
        Purchases: parseFloat(monthlyPurchases.find(m => m.month === month)?.total || 0),
    }));

    return (
        <AppLayout title="Dashboard">
            <Typography variant="h5" fontWeight="bold" mb={3}>Dashboard</Typography>

            {/* Stat Cards */}
            <Grid container spacing={2} mb={4}>
                {statCards.map(stat => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
                        <Card elevation={2} sx={{ borderLeft: `4px solid ${stat.color}` }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" mb={0.5}>
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        color: stat.color,
                                        bgcolor: stat.bg,
                                        borderRadius: 2,
                                        p: 1,
                                        display: 'flex'
                                    }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Chart */}
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                        Monthly Sales vs Purchases (Last 6 Months)
                    </Typography>
                    {chartData.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                            <Typography>No data yet. Complete some orders to see charts.</Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="Sales" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Purchases" fill="#1976d2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Recent Orders */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                🛒 Recent Orders
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><b>Order #</b></TableCell>
                                            <TableCell><b>Type</b></TableCell>
                                            <TableCell><b>Supplier / Customer</b></TableCell>
                                            <TableCell><b>Total</b></TableCell>
                                            <TableCell><b>Status</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">No orders yet.</TableCell>
                                            </TableRow>
                                        ) : (
                                            recentOrders.map(order => (
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
                                                    <TableCell>₱{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.status}
                                                            color={statusColor[order.status]}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Low Stock Alert */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                ⚠️ Low Stock Alert
                            </Typography>
                            {lowStockProducts.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                                    <Typography>All products are sufficiently stocked ✅</Typography>
                                </Box>
                            ) : (
                                lowStockProducts.map((product, index) => (
                                    <Box key={product.id}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{product.sku}</Typography>
                                            </Box>
                                            <Chip
                                                label={product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                                                color={product.stock === 0 ? 'error' : 'warning'}
                                                size="small"
                                            />
                                        </Box>
                                        {index < lowStockProducts.length - 1 && <Divider />}
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </AppLayout>
    );
}