// src/App.jsx
import GoalsDashboard from './components/GoalsDashboard';
import './App.css';
import Layout from './components/Layout';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <>
      <CssBaseline />
      <Layout>
        <GoalsDashboard />
      </Layout>
    </>
  );
}

export default App;