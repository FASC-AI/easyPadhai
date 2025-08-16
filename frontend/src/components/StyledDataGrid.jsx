import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#1E3A8A',
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
}));

export default StyledDataGrid; 
