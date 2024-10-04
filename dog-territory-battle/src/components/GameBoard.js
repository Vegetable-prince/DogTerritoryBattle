import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../css/game/GameBoard.css';
import { generateValidMoves, generateValidMovesForHandPiece, checkWinner, shouldAddSpace } from '../utils/rules';

/**
 * 手札をハイライトするカスタムフック
 *
 * @param {Object} selectedDog - 選択された犬のオブジェクト
 * @param {Object} game - ゲームのオブジェクト
 * @returns {string} - ハイライトされる手札のプレイヤー ('player1' または 'player2')
 */
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

/**
 * ゲームボードを表示するコンポーネント
 *
 * @param {Object} initialData - 初期データ
 * @returns {JSX.Element} - ゲームボードのJSX要素
 */
const GameBoard = ({ initialData }) => {
    const [player1HandDogs, setPlayer1HandDogs] = useState(initialData.player1_hand_dogs || []);
    const [player2HandDogs, setPlayer2HandDogs] = useState(initialData.player2_hand_dogs || []);
    const [boardDogs, setBoardDogs] = useState(initialData.board_dogs || []);
    const [selectedDog, setSelectedDog] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [boardBounds, setBoardBounds] = useState({ minX: 1, maxX: 1, minY: 1, maxY: 1 });
    const [showVerticalBorders, setShowVerticalBorders] = useState(false);
    const [showHorizontalBorders, setShowHorizontalBorders] = useState(false);
    const [winner, setWinner] = useState(null);

    /**
     * ボードの境界を更新する関数
     */
    const updateBoardBounds = useCallback(() => {
        if (boardDogs.length === 0) return;
        const xs = boardDogs.map(dog => dog.left / 100);
        const ys = boardDogs.map(dog => dog.top / 100);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        setBoardBounds({ minX, maxX, minY, maxY });

        setShowVerticalBorders(maxX - minX >= 3);
        setShowHorizontalBorders(maxY - minY >= 3);
    }, [boardDogs]);

    useEffect(() => {
        updateBoardBounds();
    }, [boardDogs, updateBoardBounds]);

    /**
     * 犬をクリックしたときのハンドラ
     *
     * @param {Object} dog - クリックされた犬のオブジェクト
     */
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

    /**
     * 有効な移動先をクリックしたときのハンドラ
     *
     * @param {Object} move - クリックされた移動先のオブジェクト
     */
    const handleMoveClick = (move) => {
        if (!selectedDog) return;

        const currentPlayerDogs = selectedDog.player === initialData.game.player1 ? player1HandDogs : player2HandDogs;

        if (selectedDog.is_in_hand) {
            axios.post(`/api/dogs/${selectedDog.id}/place_on_board/`, { x: move.x, y: move.y })
                .then(response => {
                    if (response.data.success) {
                        const updatedDogs = currentPlayerDogs.filter(dog => dog.id !== selectedDog.id);
                        const newDog = { ...selectedDog, left: move.x * 100, top: move.y * 100, is_in_hand: false };

                        selectedDog.player === initialData.game.player1 ? setPlayer1HandDogs(updatedDogs) : setPlayer2HandDogs(updatedDogs);
                        setBoardDogs([...boardDogs, newDog]);
                        setSelectedDog(null);
                        setValidMoves([]);
                        updateBoardBounds();

                        const winner = checkWinner({ ...initialData.game, dogs: boardDogs });
                        if (winner) {
                            setWinner(winner);
                        }
                    } else {
                        console.log("Move failed: " + response.data.error);
                    }
                })
                .catch(error => {
                    console.log("Move failed: " + error);
                });
        } else {
            axios.post(`/api/dogs/${selectedDog.id}/move/`, { x: move.x, y: move.y })
                .then(response => {
                    if (response.data.success) {
                        const updatedDogs = currentPlayerDogs.map(dog => dog.id === selectedDog.id ? { ...dog, left: move.x * 100, top: move.y * 100 } : dog);
                        selectedDog.player === initialData.game.player1 ? setPlayer1HandDogs(updatedDogs) : setPlayer2HandDogs(updatedDogs);
                        setBoardDogs(boardDogs.map(dog => dog.id === selectedDog.id ? { ...dog, left: move.x * 100, top: move.y * 100 } : dog));
                        setSelectedDog(null);
                        setValidMoves([]);
                        updateBoardBounds();

                        const winner = checkWinner({ ...initialData.game, dogs: boardDogs });
                        if (winner) {
                            setWinner(winner);
                        }
                    } else {
                        console.log("Move failed: " + response.data.error);
                    }
                })
                .catch(error => {
                    console.log("Move failed: " + error);
                });
        }
    };

    /**
     * 犬を手札に戻すときのハンドラ
     */
    const handleReturnToHandClick = () => {
        if (!selectedDog) return;

        axios.post(`/api/dogs/${selectedDog.id}/remove_from_board/`)
            .then(response => {
                if (response.data.success) {
                    const currentPlayerDogs = selectedDog.player === initialData.game.player1 ? player1HandDogs : player2HandDogs;
                    // 手札に戻る犬を新しく作成
                    const updatedDog = { ...selectedDog, is_in_hand: true, left: null, top: null };
                    // 現在の手札に新しい犬を追加
                    const updatedDogs = [...currentPlayerDogs, updatedDog];

                    if (selectedDog.player === initialData.game.player1) {
                        setPlayer1HandDogs(updatedDogs);
                    } else {
                        setPlayer2HandDogs(updatedDogs);
                    }

                    // ボードから犬を削除
                    setBoardDogs(boardDogs.filter(dog => dog.id !== selectedDog.id));
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

    const spaceNeeded = shouldAddSpace(boardBounds);
    const highlightedHand = useHighlightHand(selectedDog, initialData.game);

    return (
        <div id="game-board-container">
            <div
                id="top-hand"
                className={`hand-area top-hand ${highlightedHand === 'player1' ? 'highlighted' : ''}`}
                onClick={highlightedHand === 'player1' ? handleReturnToHandClick : null}
            >
                {player1HandDogs.map(dog => (
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
                {player2HandDogs.map(dog => (
                    <div
                        key={dog.id}
                        className={`hand-dog ${selectedDog && selectedDog.id === dog.id ? 'selected' : ''}`}
                        onClick={() => handleDogClick(dog)}
                    >
                        {dog.name}
                    </div>
                ))}
            </div>

            {winner && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>おめでとうございます、{winner}さんが勝ちました！</h2>
                        <button onClick={() => setWinner(null)}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
