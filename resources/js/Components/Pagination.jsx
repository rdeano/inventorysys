import React from 'react';
import { router } from '@inertiajs/react';
import { Box, Button, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function Pagination({ data }) {
    const { current_page, last_page, next_page_url, prev_page_url, from, to, total } = data;

    function goToPage(url) {
        if (url) router.visit(url, { preserveScroll: true });
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
                Showing {from ?? 0} to {to ?? 0} of {total} results
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ChevronLeftIcon />}
                    disabled={!prev_page_url}
                    onClick={() => goToPage(prev_page_url)}
                >
                    Previous
                </Button>

                <Typography variant="body2" sx={{ px: 2 }}>
                    Page {current_page} of {last_page}
                </Typography>

                <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ChevronRightIcon />}
                    disabled={!next_page_url}
                    onClick={() => goToPage(next_page_url)}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
}