// src/components/Filters.jsx
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';

// Define the columns that we can filter for null values
const NULLABLE_COLUMNS = [
    'assist',
    'stadium',
    'type',
    'competition',
    'team_ranked',
    'opponent_rank',
];

const Filters = ({ playerFilter, onPlayerChange, nullFilters, onNullFilterChange }) => {

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        // Create a new array based on whether the box was checked or unchecked
        const newNullFilters = checked
            ? [...nullFilters, name] // Add the column name
            : nullFilters.filter(col => col !== name); // Remove the column name

        onNullFilterChange(newNullFilters);
    };

    return (
        <Box className="p-4 mb-6 bg-white shadow-md rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* --- Player Filter --- */}
                <FormControl fullWidth>
                    <InputLabel id="player-select-label">Player</InputLabel>
                    <Select
                        labelId="player-select-label"
                        id="player-select"
                        value={playerFilter}
                        label="Player"
                        onChange={(e) => onPlayerChange(e.target.value)}
                    >
                        <MenuItem value="All">All Players</MenuItem>
                        <MenuItem value="Lionel Messi">Lionel Messi</MenuItem>
                        <MenuItem value="Cristiano Ronaldo">Cristiano Ronaldo</MenuItem>
                    </Select>
                </FormControl>

                {/* --- Null Value Filter --- */}
                <FormControl component="fieldset" className="col-span-1 md:col-span-2">
                    <FormLabel component="legend" className="text-sm">Show goals where field is empty</FormLabel>
                    <FormGroup row>
                        {NULLABLE_COLUMNS.map(column => (
                            <FormControlLabel
                                key={column}
                                control={
                                    <Checkbox
                                        checked={nullFilters.includes(column)}
                                        onChange={handleCheckboxChange}
                                        name={column}
                                    />
                                }
                                label={column.replace('_', ' ')} // Make label more readable
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </div>
        </Box>
    );
};

export default Filters;