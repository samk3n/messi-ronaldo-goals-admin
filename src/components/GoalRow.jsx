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
    // State to hold the form data, initialized with the goal prop
    const [formData, setFormData] = useState(goal);

    // Handler to update state when a user types in a field
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Pass the current form data up to be saved
        onSave(formData);
    };

    // We are using a subset of fields for this example. Add more as needed.
    return (
        <Box component="form" noValidate autoComplete="off" className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <TextField label="Competition" name="competition" value={formData.competition || ''} onChange={handleChange} variant="standard" />
                <TextField label="Opponent" name="opponent" value={formData.opponent || ''} onChange={handleChange} variant="standard" />
                <TextField label="Date" name="date" type="date" value={formData.date || ''} onChange={handleChange} variant="standard" InputLabelProps={{ shrink: true }} disabled />
                <TextField label="Minute" name="minute" value={formData.minute || ''} onChange={handleChange} variant="standard" />
                <TextField label="Final Score" name="final_score" value={formData.final_score || ''} onChange={handleChange} variant="standard" />
                <TextField label="Type" name="type" value={formData.type || ''} onChange={handleChange} variant="standard" />
                <TextField label="Assist" name="assist" value={formData.assist || ''} onChange={handleChange} variant="standard" />
                <TextField label="Team" name="team" value={formData.team || ''} onChange={handleChange} variant="standard" />
            </div>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving} // Disable button while saving
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>
        </Box>
    );
};


// --- The Main GoalRow Component ---
const GoalRow = ({ goal, currentPage }) => {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: updateGoal,
        // When the mutation is successful, invalidate the 'goals' query.
        // This tells TanStack Query to automatically re-fetch the data for the current page.
        onSuccess: () => {
            toast.success('Goal updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['goals', currentPage] });
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
    });

    return (
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, position: 'static' }}>
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
                <EditGoalForm goal={goal} onSave={mutate} isSaving={isPending} />
            </AccordionDetails>
        </Accordion>
    );
};

export default GoalRow;