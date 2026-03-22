import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert
} from '@mui/material';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e) {
      e.preventDefault();
      post('/login');
    }

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
            }}
        >
            <Paper elevation={3} sx={{ p: 4, width: 400 }}>
                <Typography variant="h5" mb={3} textAlign="center">
                    Inventory System
                </Typography>

                {errors.email && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.email}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        margin="normal"
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={processing}
                        sx={{ mt: 2 }}
                    >
                        {processing ? 'Logging in...' : 'Login'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}