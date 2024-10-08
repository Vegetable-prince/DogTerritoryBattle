import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameBoard from './GameBoard';
import '../css/game/GamePage.css';

const GamePage = () => {
    const { game_id } = useParams();
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/games/${game_id}/`)
            .then(response => response.json())
            .then(data => setInitialData(data))
            .catch(error => console.error('Error fetching initial data:', error));
    }, [game_id]);

    if (!initialData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="page-container">
            <GameBoard initialData={initialData} />
        </div>
    );
};

export default GamePage;