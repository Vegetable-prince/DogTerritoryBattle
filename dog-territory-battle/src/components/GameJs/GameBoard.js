import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import HandArea from './HandArea';
import Board from './Board';
import WinnerModal from './WinnerModal';
import ShowCurrentTurn from './ShowCurrentTurn';
import ExtraOperation from './ExtraOperation';
import '../../css/GameCss/GameBoard.css';

const GameBoard = ({ initialData }) => {
  const { game, player1_hand_dogs, player2_hand_dogs, board_dogs } = initialData;

  const [player1HandDogs, setPlayer1HandDogs] = useState(player1_hand_dogs);
  const [player2HandDogs, setPlayer2HandDogs] = useState(player2_hand_dogs);
  const [boardDogs, setBoardDogs] = useState(board_dogs);
  const [currentTurn, setCurrentTurn] = useState(game.current_turn);
  const [winner, setWinner] = useState(null);

  // ゲーム終了のチェック（例としてボス犬がボードに存在しない場合）
  useEffect(() => {
    const bossDogs = boardDogs.filter((dog) => dog.dog_type.name === 'ボス犬');
    if (bossDogs.length === 0) {
      setWinner(currentTurn === 1 ? 2 : 1);
    }
  }, [boardDogs, currentTurn]);

  const switchTurn = () => {
    setCurrentTurn((prevTurn) => (prevTurn === 1 ? 2 : 1));
  };

  const handleWinnerModalClose = () => {
    setWinner(null);
    // ゲームのリセットやその他の処理を追加可能
  };

  return (
    <div id="game-board-container">
      <ShowCurrentTurn currentTurn={currentTurn} />
      <div className="players-container">
        <HandArea
          dogs={player1HandDogs}
          setHandDogs={setPlayer1HandDogs}
          setBoardDogs={setBoardDogs}
          switchTurn={switchTurn}
          currentTurn={currentTurn}
          player={1}
          boardDogs={boardDogs}
        />
      </div>
      <Board
        dogs={boardDogs}
        setBoardDogs={setBoardDogs}
        switchTurn={switchTurn}
        currentTurn={currentTurn}
      />
      <div className="players-container">
        <HandArea
          dogs={player2HandDogs}
          setHandDogs={setPlayer2HandDogs}
          setBoardDogs={setBoardDogs}
          switchTurn={switchTurn}
          currentTurn={currentTurn}
          player={2}
          boardDogs={boardDogs}
        />
      </div>
      {winner && <WinnerModal winner={winner} onClose={handleWinnerModalClose} />}
      {/* <ExtraOperation
        // ExtraOperation で使用するメソッドをプロップスとして渡す（必要に応じて）
      /> */}
    </div>
  );
};

GameBoard.propTypes = {
  initialData: PropTypes.shape({
    game: PropTypes.shape({
      current_turn: PropTypes.number.isRequired,
      id: PropTypes.number.isRequired,
      player1: PropTypes.number.isRequired,
      player2: PropTypes.number.isRequired,
    }).isRequired,
    player1_hand_dogs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        left: PropTypes.number,
        top: PropTypes.number,
        is_in_hand: PropTypes.bool.isRequired,
        dog_type: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          movement_type: PropTypes.string.isRequired,
          max_steps: PropTypes.number,
        }).isRequired,
        player: PropTypes.number.isRequired,
      })
    ).isRequired,
    player2_hand_dogs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        left: PropTypes.number,
        top: PropTypes.number,
        is_in_hand: PropTypes.bool.isRequired,
        dog_type: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          movement_type: PropTypes.string.isRequired,
          max_steps: PropTypes.number,
        }).isRequired,
        player: PropTypes.number.isRequired,
      })
    ).isRequired,
    board_dogs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        is_in_hand: PropTypes.bool.isRequired,
        dog_type: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          movement_type: PropTypes.string.isRequired,
          max_steps: PropTypes.number,
        }).isRequired,
        player: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default GameBoard;