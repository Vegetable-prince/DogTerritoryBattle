import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const gameId = 1; // ここで適切なゲームIDを設定します

    return (
        <div>
            <h1>Dog Territory Battle</h1>
            <Link to={`/games/${gameId}`}>ゲームへ</Link>
        </div>
    );
};

export default HomePage;