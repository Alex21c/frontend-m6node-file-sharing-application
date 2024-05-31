import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function CircularProgressInfinite() {
  return (
    <Box sx={{ display: 'flex' }} className="flex  items-center p-[1rem] gap-[1rem] justify-center">
      <CircularProgress /><span className='italic'>Uploading...</span>
    </Box>
  );
}
