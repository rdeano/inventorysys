import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import {
    Box, Typography, Grid, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Tabs, Tab, Divider
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const statusColor = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
};

export default function Index({
    stats,
    lowStockProducts,
    stockByCategory,
    recentOrders,
    monthlySales,
    monthlyPurchases,
}) {
    const [tab, setTab] = useState(0);

    // Merge monthly data for chart
    const months = [...new Set([
        ...monthlySales.map(m => m.month),
        ...monthlyPurchases.map(m => m.month),
    ])].sort();

    const chartData = months.map(month => ({
        month,
        Sales: monthlySales.find(m => m.month === month)?.total || 0,
        Purchases: monthlyPurchases.find(m => m.month === month)?.total || 0,
    }));

    const statCards = [
        { title: 'Total Products', value: stats.totalProducts, icon: <InventoryIcon fontSize="large" />, color: '#1976d2' },
        { title: 'Low Stock Items', value: stats.lowStockCount, icon: <WarningIcon fontSize="large" />, color: '#ed6c02' },
        { title: 'Out of Stock', value: stats.outOfStockCount, icon: <WarningIcon fontSize="large" />, color: '#d32f2f' },
        { title: 'Total Sales', value: `₱${parseFloat(stats.totalSalesAmount).toFixed(2)}`, icon: <TrendingUpIcon fontSize="large" />, color: '#2e7d32' },
        { title: 'Total Purchases', value: `₱${parseFloat(stats.totalPurchaseAmount).toFixed(2)}`, icon: <TrendingDownIcon fontSize="large" />, color: '#9c27b0' },
        { title: 'Sales Orders', value: stats.totalSalesOrders, icon: <ShoppingCartIcon fontSize="large" />, color: '#0288d1' },
        { title: 'Purchase Orders', value: stats.totalPurchaseOrders, icon: <AttachMoneyIcon fontSize="large" />, color: '#f57c00' },
    ];

    return (
        <AppLayout title="Reports">
            <Typography variant="h5" fontWeight="bold" mb={3}>Reports & Analytics</Typography>

            {/* Stat Cards */}
            <Grid container spacing={2} mb={4}>
                {statCards.map(stat => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography color="text.secondary" variant="body2">
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold">
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts */}
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                        Monthly Sales vs Purchases (Last 6 Months)
                    </Typography>
                    {chartData.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                            <Typography>No data available yet. Complete some orders to see charts.</Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `₱${parseFloat(value).toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="Sales" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Purchases" fill="#1976d2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Tabs for different reports */}
            <Card elevation={2}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Low Stock Alert" />
                    <Tab label="Stock by Category" />
                    <Tab label="Recent Orders" />
                </Tabs>

                <CardContent>
                    {/* Low Stock */}
                    {tab === 0 && (
                        <>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                ⚠️ Low Stock Products ({lowStockProducts.length})
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#fff3e0' }}>
                                            <TableCell><b>Product</b></TableCell>
                                            <TableCell><b>SKU</b></TableCell>
                                            <TableCell><b>Current Stock</b></TableCell>
                                            <TableCell><b>Threshold</b></TableCell>
                                            <TableCell><b>Status</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lowStockProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">All products are sufficiently stocked ✅</TableCell>
                                            </TableRow>
                                        ) : (
                                            lowStockProducts.map(product => (
                                                <TableRow key={product.id} hover>
                                                    <TableCell>{product.name}</TableCell>
                                                    <TableCell>{product.sku}</TableCell>
                                                    <TableCell>{product.stock}</TableCell>
                                                    <TableCell>{product.low_stock_threshold}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                            color={product.stock === 0 ? 'error' : 'warning'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {/* Stock by Category */}
                    {tab === 1 && (
                        <>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                📦 Stock by Category
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><b>Category</b></TableCell>
                                            <TableCell><b>Total Products</b></TableCell>
                                            <TableCell><b>Total Stock</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stockByCategory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">No categories found.</TableCell>
                                            </TableRow>
                                        ) : (
                                            stockByCategory.map(category => (
                                                <TableRow key={category.id} hover>
                                                    <TableCell>{category.name}</TableCell>
                                                    <TableCell>{category.products_count}</TableCell>
                                                    <TableCell>{category.products_sum_stock || 0}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {/* Recent Orders */}
                    {tab === 2 && (
                        <>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                🛒 Recent Orders
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><b>Order #</b></TableCell>
                                            <TableCell><b>Type</b></TableCell>
                                            <TableCell><b>Supplier / Customer</b></TableCell>
                                            <TableCell><b>Date</b></TableCell>
                                            <TableCell><b>Total</b></TableCell>
                                            <TableCell><b>Status</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">No orders yet.</TableCell>
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
                                                    <TableCell>{order.order_date}</TableCell>
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
                        </>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}