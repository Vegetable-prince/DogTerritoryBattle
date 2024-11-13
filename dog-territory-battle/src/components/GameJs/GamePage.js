import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameBoard from './GameBoard';
import '../../css/GameCss/GamePage.css';
import apiClient from '../../api/apiClient'; // 追加

const GamePage = () => {
    const { game_id } = useParams();
    const [initialData, setInitialData] = useState(null);
    console.log(initialData);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await apiClient.get(`/games/${game_id}/`);
                setInitialData(response.data);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();
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