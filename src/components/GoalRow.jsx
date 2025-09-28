// src/components/GoalRow.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client as supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// MUI Components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';

// --- Helper function to generate minute options ---
// We define this outside the component so it only runs once.
const generateMinuteOptions = () => {
    const options = [];
    for (let i = 1; i <= 120; i++) {
        options.push(String(i)); // Add the regular minute
        // Add stoppage time options in the correct order
        if (i === 45) for (let j = 1; j <= 10; j++) options.push(`45+${j}`);
        if (i === 90) for (let j = 1; j <= 15; j++) options.push(`90+${j}`);
        if (i === 105) for (let j = 1; j <= 5; j++) options.push(`105+${j}`);
        if (i === 120) for (let j = 1; j <= 5; j++) options.push(`120+${j}`);
    }
    return options;
};
const minuteOptions = generateMinuteOptions();

// --- The Mutation Function ---
// This async function takes the updated goal data and sends it to Supabase.
const updateGoal = async (updatedGoal) => {
    const { id, ...goalData } = updatedGoal; // Separate the id from the rest of the data

    const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', id); // Match the goal by its unique ID

    if (error) {
        throw new Error(error.message);
    }
};


// --- The Interactive Form Component ---
const EditGoalForm = ({ goal, onSave, isSaving }) => {
    const [formData, setFormData] = useState(goal);

    // A more robust handler that works for text fields, selects, and switches
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        // Use 'checked' for switches/checkboxes, otherwise use 'value'
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    // We are using a subset of fields for this example. Add more as needed.
    return (
        <Box component="form" noValidate autoComplete="off" className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                {/* Row 1 */}
                <TextField label="Competition" name="competition" value={formData.competition || ''} onChange={handleChange} variant="standard" />
                <TextField label="Team" name="team" value={formData.team || ''} onChange={handleChange} variant="standard" />
                <TextField label="Opponent" name="opponent" value={formData.opponent || ''} onChange={handleChange} variant="standard" />

                {/* Row 2 */}
                <TextField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} variant="standard" InputLabelProps={{ shrink: true }} />
                <TextField label="Matchday" name="matchday" value={formData.matchday || ''} onChange={handleChange} variant="standard" />
                <TextField label="Stadium" name="stadium" value={formData.stadium || ''} onChange={handleChange} variant="standard" />
                <FormControl variant="standard">
                    <InputLabel id="homeaway-label">Home/Away</InputLabel>
                    <Select labelId="homeaway-label" name="homeaway" value={formData.homeaway || ''} onChange={handleChange}>
                        <MenuItem value="h">Home</MenuItem>
                        <MenuItem value="a">Away</MenuItem>
                        <MenuItem value="n">Neutral</MenuItem>
                    </Select>
                </FormControl>

                {/* Row 3 */}
                <TextField label="Final Score" name="final_score" value={formData.final_score || ''} onChange={handleChange} variant="standard" />
                <TextField label="Score After Goal" name="score_after_goal" value={formData.score_after_goal || ''} onChange={handleChange} variant="standard" />
                <FormControl variant="standard">
                    <InputLabel id="minute-select-label">Minute</InputLabel>
                    <Select
                        labelId="minute-select-label"
                        name="minute"
                        value={formData.minute || ''}
                        onChange={handleChange}
                        // Add styling for better performance with many items
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 250,
                                },
                            },
                        }}
                    >
                        {minuteOptions.map(minute => (
                            <MenuItem key={minute} value={minute}>{minute}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Row 4 */}
                <TextField label="Type" name="type" value={formData.type || ''} onChange={handleChange} variant="standard" />
                <TextField label="Assist" name="assist" value={formData.assist || ''} onChange={handleChange} variant="standard" />
                <TextField label="Team Rank" name="team_ranked" value={formData.team_ranked || ''} onChange={handleChange} variant="standard" />
                <TextField label="Opponent Rank" name="opponent_rank" value={formData.opponent_rank || ''} onChange={handleChange} variant="standard" />

                <div></div>
                <div></div>

                {/* Row 5 - International Details */}
                <FormControlLabel
                    control={<Switch checked={formData.international || false} onChange={handleChange} name="international" />}
                    label="International Goal"
                />
                <TextField label="Cap Number" name="cap" type="number" value={formData.cap || ''} onChange={handleChange} variant="standard" disabled={!formData.international} />
            </div>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleSave} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>
        </Box>
    );
};


// --- The Main GoalRow Component ---
const GoalRow = ({ goal, currentPage }) => {
    const queryClient = useQueryClient();

    // 1. Add state to track if the accordion for THIS row is expanded
    const [isExpanded, setIsExpanded] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: updateGoal,
        onSuccess: () => {
            toast.success('Goal updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['goals', currentPage] });
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
    });

    return (
        // 2. Control the expansion state and listen for changes
        <Accordion
            disableGutters
            elevation={0}
            sx={{ '&:before': { display: 'none' }, position: 'static' }}
            expanded={isExpanded}
            onChange={(event, expanded) => setIsExpanded(expanded)}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ '& .MuiAccordionSummary-content': { flexGrow: 1 } }}
                className="hover:bg-slate-50"
            >
                {/* The summary remains the same as before */}
                <div className="w-full grid grid-cols-12 gap-4 items-center text-sm px-4">
                    <div className="col-span-1 font-bold text-slate-700">{goal.number}</div>
                    <div className="col-span-3 text-slate-800">{goal.player_name}</div>
                    <div className="col-span-4 text-slate-600">vs {goal.opponent}</div>
                    <div className="col-span-2 text-slate-600">{goal.date}</div>
                    <div className="col-span-2 font-semibold text-slate-800 text-right">{goal.final_score}</div>
                </div>
            </AccordionSummary>

            <AccordionDetails className="bg-slate-50 border-t border-slate-200">
                {/* 3. CRITICAL CHANGE: Only render the form if the row is expanded */}
                {isExpanded && (
                    <EditGoalForm goal={goal} onSave={mutate} isSaving={isPending} />
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default GoalRow;