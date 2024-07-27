import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../css/game/GameBoard.css';
import { generateValidMoves, generateValidMovesForHandPiece, shouldAddSpace } from '../utils/rules';

const useHighlightHand = (selectedDog, game) => {
    const [highlightedHand, setHighlightedHand] = useState(null);

    useEffect(() => {
        if (selectedDog && !selectedDog.is_in_hand) {
            if (selectedDog.player === game.player1) {
                setHighlightedHand('player1');
            } else if (selectedDog.player === game.player2) {
                setHighlightedHand('player2');
            } else {
                setHighlightedHand(null);
            }
        } else {
            setHighlightedHand(null);
        }
    }, [selectedDog, game]);

    return highlightedHand;
};

const GameBoard = ({ initialData }) => {
    const [player1Dogs, setPlayer1Dogs] = useState(initialData.player1_dogs || []);
    const [player2Dogs, setPlayer2Dogs] = useState(initialData.player2_dogs || []);
    const [boardDogs, setBoardDogs] = useState(initialData.board_dogs || []);
    const [selectedDog, setSelectedDog] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [boardBounds, setBoardBounds] = useState({ minX: 1, maxX: 1, minY: 1, maxY: 1 });
    const [showVerticalBorders, setShowVerticalBorders] = useState(false);
    const [showHorizontalBorders, setShowHorizontalBorders] = useState(false);

    const updateBoardBounds = useCallback(() => {
        if (boardDogs.length === 0) return;
        const xs = boardDogs.map(dog => dog.left / 100);
        const ys = boardDogs.map(dog => dog.top / 100);
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
    }, [boardDogs]);

    useEffect(() => {
        updateBoardBounds();
    }, [boardDogs, updateBoardBounds]);

    const handleDogClick = (dog) => {
        if (selectedDog && selectedDog.id === dog.id) {
            setSelectedDog(null);
            setValidMoves([]);
        } else {
            setSelectedDog(dog);
            if (dog.is_in_hand) {
                setValidMoves(generateValidMovesForHandPiece(boardDogs, boardBounds));
            } else {
                setValidMoves(generateValidMoves(dog, boardDogs, boardBounds));
            }
        }
    };

    const handleMoveClick = (move) => {
        if (!selectedDog) return;

        const currentPlayerDogs = selectedDog.player === initialData.game.player1 ? player1Dogs : player2Dogs;

        if (selectedDog.is_in_hand) {
            axios.post(`/api/dogs/${selectedDog.id}/place_on_board/`, {
                x: move.x,
                y: move.y
            }).then(response => {
                if (response.data.success) {
                    const updatedDogs = currentPlayerDogs.filter(dog => dog.id !== selectedDog.id);
                    const newDog = { ...selectedDog, left: move.x * 100, top: move.y * 100, is_in_hand: false };

                    if (selectedDog.player === initialData.game.player1) {
                        setPlayer1Dogs(updatedDogs);
                    } else {
                        setPlayer2Dogs(updatedDogs);
                    }

                    setBoardDogs([...boardDogs, newDog]);
                    setSelectedDog(null);
                    setValidMoves([]);
                    updateBoardBounds();
                } else {
                    console.log("Move failed: " + response.data.error);
                }
            }).catch(error => {
                console.log("Move failed: " + error);
            });
        } else {
            axios.post(`/api/dogs/${selectedDog.id}/move/`, {
                x: move.x,
                y: move.y
            }).then(response => {
                if (response.data.success) {
                    const updatedDogs = currentPlayerDogs.map(dog => {
                        if (dog.id === selectedDog.id) {
                            return { ...dog, left: move.x * 100, top: move.y * 100 };
                        }
                        return dog;
                    });
                    if (selectedDog.player === initialData.game.player1) {
                        setPlayer1Dogs(updatedDogs);
                    } else {
                        setPlayer2Dogs(updatedDogs);
                    }
                    setSelectedDog(null);
                    setValidMoves([]);
                    setBoardDogs(boardDogs.map(dog => {
                        if (dog.id === selectedDog.id) {
                            return { ...dog, left: move.x * 100, top: move.y * 100 };
                        }
                        return dog;
                    }));
                    updateBoardBounds();
                } else {
                    console.log("Move failed: " + response.data.error);
                }
            }).catch(error => {
                console.log("Move failed: " + error);
            });
        }
    };

    const handleReturnToHandClick = () => {
        if (!selectedDog) return;

        axios.post(`/api/dogs/${selectedDog.id}/remove_from_board/`, {
        }).then(response => {
            if (response.data.success) {
                const currentPlayerDogs = selectedDog.player === initialData.game.player1 ? player1Dogs : player2Dogs;
                const updatedDogs = currentPlayerDogs.map(dog => {
                    if (dog.id === selectedDog.id) {
                        return { ...dog, is_in_hand: true, left: null, top: null };
                    }
                    return dog;
                });
                if (selectedDog.player === initialData.game.player1) {
                    setPlayer1Dogs([...updatedDogs, { ...selectedDog, is_in_hand: true, left: null, top: null }]);
                } else {
                    setPlayer2Dogs([...updatedDogs, { ...selectedDog, is_in_hand: true, left: null, top: null }]);
                }
                setBoardDogs(boardDogs.filter(dog => dog.id !== selectedDog.id));
                setSelectedDog(null);
                setValidMoves([]);
                updateBoardBounds();
            } else {
                console.log("Move failed: " + response.data.error);
            }
        }).catch(error => {
            console.log("Move failed: " + error);
        });
    };

    const spaceNeeded = shouldAddSpace(boardBounds);
    const highlightedHand = useHighlightHand(selectedDog, initialData.game);

    return (
        <div id="game-board-container">
            <div
                id="top-hand"
                className={`hand-area top-hand ${highlightedHand === 'player1' ? 'highlighted' : ''}`}
                onClick={highlightedHand === 'player1' ? handleReturnToHandClick : null}
            >
                {player1Dogs.map(dog => (
                    <div
                        key={dog.id}
                        className={`hand-dog ${selectedDog && selectedDog.id === dog.id ? 'selected' : ''}`}
                        onClick={() => handleDogClick(dog)}
                    >
                        {dog.name}
                    </div>
                ))}
            </div>
            <div
                id="game-board"
                style={{
                    width: `${(boardBounds.maxX - boardBounds.minX + 1) * 100}px`,
                    height: `${(boardBounds.maxY - boardBounds.minY + 1) * 100}px`,
                    borderLeft: showVerticalBorders ? '1px solid black' : 'none',
                    borderRight: showVerticalBorders ? '1px solid black' : 'none',
                    borderTop: showHorizontalBorders ? '1px solid black' : 'none',
                    borderBottom: showHorizontalBorders ? '1px solid black' : 'none',
                    marginTop: spaceNeeded ? '110px' : '20px',
                    marginBottom: spaceNeeded ? '110px' : '20px'
                }}
            >
                {boardDogs.map(dog => (
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
            <div
                id="bottom-hand"
                className={`hand-area bottom-hand ${highlightedHand === 'player2' ? 'highlighted' : ''}`}
                onClick={highlightedHand === 'player2' ? handleReturnToHandClick : null}
            >
                {player2Dogs.map(dog => (
                    <div
                        key={dog.id}
                        className={`hand-dog ${selectedDog && selectedDog.id === dog.id ? 'selected' : ''}`}
                        onClick={() => handleDogClick(dog)}
                    >
                        {dog.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameBoard;
