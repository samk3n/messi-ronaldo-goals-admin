// src/components/GoalsDashboard.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { client as supabase } from '../lib/supabase';
import GoalRow from './GoalRow';
import Filters from './Filters'; // 1. Import the new Filters component
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';

const PAGE_SIZE = 20;

// --- FINAL fetchGoals function ---
// It now accepts the filter states as arguments
const fetchGoals = async (page, playerFilter, nullFilters) => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Start building the query
    let query = supabase
        .from('goals')
        .select('*', { count: 'exact' });

    // --- Dynamically add filters to the query ---
    // 1. Add player filter if it's not 'All'
    if (playerFilter !== 'All') {
        query = query.eq('player_name', playerFilter);
    }

    // 2. Add null filters for each checked box
    nullFilters.forEach(column => {
        query = query.is(column, null);
    });

    // Finally, add sorting and pagination
    query = query
        .order('date', { ascending: true })
        .range(from, to);

    const { data, error, count } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return { goals: data, count };
};


const GoalsDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    // --- 2. Add state for our filters ---
    const [playerFilter, setPlayerFilter] = useState('All');
    const [nullFilters, setNullFilters] = useState([]); // An array of column names

    const { data, isLoading, isError, error } = useQuery({
        // --- 3. The queryKey MUST include all dependencies ---
        // Now TanStack Query will re-fetch whenever the page OR a filter changes.
        queryKey: ['goals', currentPage, playerFilter, nullFilters],
        queryFn: () => fetchGoals(currentPage, playerFilter, nullFilters),
    });

    // --- 4. Create handlers that also reset the page number ---
    const handlePlayerFilterChange = (player) => {
        setPlayerFilter(player);
        setCurrentPage(1); // Go back to the first page of the new results
    };

    const handleNullFilterChange = (columns) => {
        setNullFilters(columns);
        setCurrentPage(1); // Go back to the first page
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const pageCount = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">
                    Goals Admin Dashboard
                </h1>

                {/* --- 5. Render the Filters component --- */}
                <Filters
                    playerFilter={playerFilter}
                    onPlayerChange={handlePlayerFilterChange}
                    nullFilters={nullFilters}
                    onNullFilterChange={handleNullFilterChange}
                />

                <div className="bg-white shadow-md rounded-lg overflow-hidden divide-y divide-slate-200">
                    {isLoading ? (
                        <p className="p-4 text-center text-slate-500">Loading goals...</p>
                    ) : isError ? (
                        <p className="p-4 text-center text-red-500">Error: {error.message}</p>
                    ) : !data.goals || data.goals.length === 0 ? (
                        <p className="p-4 text-center text-slate-500">No goals match the current filters.</p>
                    ) : (
                        data.goals.map((goal) => (
                            <GoalRow key={goal.id} goal={goal} currentPage={currentPage} />
                        ))
                    )}
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        // Disable pagination if there's only one page or less
                        disabled={pageCount <= 1}
                    />
                </Box>
            </div>
        </div>
    );
};

export default GoalsDashboard;