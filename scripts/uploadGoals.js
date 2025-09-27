// scripts/uploadGoals.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// --- Configuration ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL or Anon Key is missing from your .env file.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the players and their corresponding data files
const players = [
  {
    name: "Lionel Messi",
    file: "messi_all_goals.json"
  },
  {
    name: "Cristiano Ronaldo",
    file: "ronaldo_all_goals.json"
  }
];

// --- Main Upload Function ---
async function uploadGoals() {
  for (const player of players) {
    console.log(`Processing goals for ${player.name}...`);
    
    // Construct the full path to the JSON file inside the 'scripts' directory
    const filePath = path.join(__dirname, player.file);

    // Read and parse the JSON file
    let goalsData;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      goalsData = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error: Could not read or parse ${player.file}. Make sure it's in the 'scripts' folder.`, error.message);
      continue; // Skip to the next player if file is not found or invalid
    }

    // Map the JSON data to the new database schema
    const dataToInsert = goalsData.map(goal => ({
      // Add the player's name
      player_name: player.name,
      
      // Fields with matching names
      competition: goal.competition,
      matchday: goal.matchday,
      date: goal.date,
      homeaway: goal.homeaway,
      team: goal.team,
      opponent: goal.opponent,
      stadium: goal.stadium,
      minute: goal.minute,
      type: goal.type,
      assist: goal.assist,
      international: goal.international,
      cap: goal.cap,
      number: goal.number,

      // Map from camelCase (JSON) to snake_case (DB)
      team_ranked: goal.teamRanked,
      opponent_rank: goal.opponentRank,
      final_score: goal.finalScore,
      score_after_goal: goal.scoreAfterGoal
    }));

    // Upload data to Supabase in chunks to avoid payload size limits
    const CHUNK_SIZE = 500;
    for (let i = 0; i < dataToInsert.length; i += CHUNK_SIZE) {
      const chunk = dataToInsert.slice(i, i + CHUNK_SIZE);
      console.log(`  Uploading chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(dataToInsert.length / CHUNK_SIZE)}...`);

      const { error } = await supabase
        .from('goals')
        .insert(chunk);

      if (error) {
        console.error(`  Error inserting chunk for ${player.name}:`, error.message);
      } else {
        console.log(`  Chunk successfully uploaded for ${player.name}.`);
      }
    }
    console.log(`All goals for ${player.name} have been processed.`);
  }
  console.log("\nData upload process finished.");
}

// --- Run the Script ---
uploadGoals();