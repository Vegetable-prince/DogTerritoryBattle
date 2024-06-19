import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [dogs, setDogs] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/dogs/')  // 正しいAPIエンドポイントを設定
            .then(response => {
                setDogs(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);

    return (
        <div className="App">
            <h1>Dog Territory Battle</h1>
            {dogs.map(dog => (
                <div key={dog.id} className="dog">
                    {dog.name}
                </div>
            ))}
        </div>
    );
}

export default App;