import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../css/game/GameBoard.css';

const GameBoard = ({ initialData }) => {
    const [dogs, setDogs] = useState(initialData.dogs || []);
    const [selectedDog, setSelectedDog] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [boardBounds, setBoardBounds] = useState({ minX: 0, maxX: 3, minY: 0, maxY: 3 });
    const [showVerticalBorders, setShowVerticalBorders] = useState(false);
    const [showHorizontalBorders, setShowHorizontalBorders] = useState(false);

    const updateBoardBounds = useCallback(() => {
        if (dogs.length === 0) return;
        const xs = dogs.map(dog => dog.left / 100);
        const ys = dogs.map(dog => dog.top / 100);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        setBoardBounds({
            minX,
            maxX,
            minY,
            maxY
        });

        if (maxX - minX >= 3) {
            setShowVerticalBorders(true);
        } else {
            setShowVerticalBorders(false);
        }

        if (maxY - minY >= 3) {
            setShowHorizontalBorders(true);
        } else {
            setShowHorizontalBorders(false);
        }
    }, [dogs]);

    useEffect(() => {
        updateBoardBounds();
    }, [dogs, updateBoardBounds]);

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
        const x = dog.left / 100;
        const y = dog.top / 100;
        const possibleMoves = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: -1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: 1, dy: 1 }
        ];

        const moves = possibleMoves.map(move => {
            return { x: x + move.dx, y: y + move.dy };
        }).filter(move => isValidMove(move.x, move.y) && !isOccupied(move.x, move.y));

        setValidMoves(moves.map(move => ({
            x: move.x,
            y: move.y
        })));
    };

    const isValidMove = (x, y) => {
        const newBoardBounds = {
            minX: Math.min(boardBounds.minX, x),
            maxX: Math.max(boardBounds.maxX, x),
            minY: Math.min(boardBounds.minY, y),
            maxY: Math.max(boardBounds.maxY, y)
        };

        if (newBoardBounds.maxX - newBoardBounds.minX >= 4 || newBoardBounds.maxY - newBoardBounds.minY >= 4) {
            return false;
        }
        return true;
    };

    const isOccupied = (x, y) => {
        return dogs.some(dog => dog.left / 100 === x && dog.top / 100 === y);
    };

    const handleMoveClick = (move) => {
        if (!selectedDog) return;
    
        console.log(`Sending move request: dog_id=${selectedDog.id}, x=${move.x}, y=${move.y}`);
    
        axios.post(`/api/dogs/${selectedDog.id}/move/`, {
            x: move.x,
            y: move.y,
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
                updateBoardBounds();
            } else {
                console.log("Move failed: " + response.data.error);
            }
        })
        .catch(error => {
            console.log("Move failed: " + error);
        });
    };

    const centerBoard = () => {
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            gameBoard.style.transform = 'translate(-50%, -50%)';
        }
    };

    useEffect(() => {
        centerBoard();
    }, [boardBounds]);

    console.log('boardBounds:', boardBounds);
    console.log('dogs:', dogs);

    return (
        <div id="game-board-container" style={{ width: '100vw', height: '100vh' }}>
            <div
                id="game-board"
                style={{
                    width: `${(boardBounds.maxX - boardBounds.minX + 1) * 100}px`,
                    height: `${(boardBounds.maxY - boardBounds.minY + 1) * 100}px`,
                    borderLeft: showVerticalBorders ? '1px solid black' : 'none',
                    borderRight: showVerticalBorders ? '1px solid black' : 'none',
                    borderTop: showHorizontalBorders ? '1px solid black' : 'none',
                    borderBottom: showHorizontalBorders ? '1px solid black' : 'none',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {dogs.map(dog => (
                    <div
                        key={dog.id}
                        className="dog"
                        style={{ left: `${(dog.left - boardBounds.minX * 100)}px`, top: `${(dog.top - boardBounds.minY * 100)}px` }}
                        onClick={() => handleDogClick(dog)}
                    >
                        {dog.name}
                    </div>
                ))}
                {validMoves.map((move, index) => (
                    <div
                        key={index}
                        className="valid-move"
                        style={{ left: `${(move.x - boardBounds.minX) * 100}px`, top: `${(move.y - boardBounds.minY) * 100}px` }}
                        onClick={() => handleMoveClick(move)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GameBoard;