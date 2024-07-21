import React, { useState } from 'react';
import axios from 'axios';
import '../css/game/GameBoard.css';

const GameBoard = ({ initialData }) => {
    console.log(initialData);
    const [dogs, setDogs] = useState(initialData.dogs || []);
    const [selectedDog, setSelectedDog] = useState(null);
    const [validMoves, setValidMoves] = useState([]);

    const handleDogClick = (dog) => {
        if (selectedDog && selectedDog.id === dog.id) {
            setSelectedDog(null);
            setValidMoves([]);
        } else {
            setSelectedDog(dog);
            highlightValidMoves(dog);
        }
    };

    const highlightValidMoves = (dog) => {
        const x = dog.left / 100;  // データベースの値をそのまま使用
        const y = dog.top / 100;   // データベースの値をそのまま使用
        const possibleMoves = [
            { dx: 0, dy: -1 },  // 上
            { dx: 0, dy: 1 },   // 下
            { dx: -1, dy: 0 },  // 左
            { dx: 1, dy: 0 },   // 右
            { dx: -1, dy: -1 }, // 左上
            { dx: 1, dy: -1 },  // 右上
            { dx: -1, dy: 1 },  // 左下
            { dx: 1, dy: 1 }    // 右下
        ];

        const moves = possibleMoves.map(move => {
            return { x: x + move.dx, y: y + move.dy };
        }).filter(move => isValidMove(move.x, move.y));

        setValidMoves(moves.map(move => ({
            x: move.x, // 位置をそのまま使用
            y: move.y  // 位置をそのまま使用
        })));
    };

    const isValidMove = (x, y) => {
        if (x < 1 || x > 4 || y < 1 || y > 4) {
            return false;
        }

        const futurePositions = dogs.map(dog => {
            if (selectedDog && dog.id === selectedDog.id) {
                return { x, y };
            }
            return { x: dog.left / 100, y: dog.top / 100 };
        });

        const maxX = Math.max(...futurePositions.map(pos => pos.x));
        const minX = Math.min(...futurePositions.map(pos => pos.x));
        const maxY = Math.max(...futurePositions.map(pos => pos.y));
        const minY = Math.min(...futurePositions.map(pos => pos.y));

        if (maxX - minX >= 4 || maxY - minY >= 4) {
            return false;
        }

        return true;
    };

    const handleMoveClick = (move) => {
        if (!selectedDog) return;

        axios.post('/move_dog/', {
            dog_id: selectedDog.id,
            x: move.x,
            y: move.y,
            csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value
        })
        .then(response => {
            if (response.data.success) {
                setDogs(dogs.map(dog => {
                    if (dog.id === selectedDog.id) {
                        return { ...dog, left: move.x * 100, top: move.y * 100 };
                    }
                    return dog;
                }));
                setSelectedDog(null);
                setValidMoves([]);
            } else {
                console.log("Move failed: " + response.data.error);
            }
        })
        .catch(error => {
            console.log("Move failed: " + error);
        });
    };

    return (
        <div id="game-board">
            {dogs.map(dog => (
                <div
                    key={dog.id}
                    className="dog"
                    style={{ left: `${(dog.left - 100)}px`, top: `${(dog.top - 100)}px` }}  // 位置を0ベースに変換
                    onClick={() => handleDogClick(dog)}
                >
                    {dog.name}
                </div>
            ))}
            {validMoves.map((move, index) => (
                <div
                    key={index}
                    className="valid-move"
                    style={{ left: `${(move.x - 1) * 100}px`, top: `${(move.y - 1) * 100}px` }}  // 位置を0ベースに変換
                    onClick={() => handleMoveClick(move)}
                />
            ))}
        </div>
    );
};

export default GameBoard;