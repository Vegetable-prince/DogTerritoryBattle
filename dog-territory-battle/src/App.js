import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamePage from './components/GameJs/GamePage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:game_id" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default App;