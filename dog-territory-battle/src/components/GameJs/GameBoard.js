// src/components/GameJs/GameBoard.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import HandArea from './HandArea';
import Board from './Board';
import WinnerModal from './WinnerModal';
import ShowCurrentTurn from './ShowCurrentTurn';
// import ExtraOperation from './ExtraOperation';
import '../../css/GameCss/GameBoard.css';
import * as rules from '../../utils/rules';

const GameBoard = ({ initialData, operationRequest, rulesFunction = rules }) => {
  const { game, player1_hand_dogs, player2_hand_dogs, board_dogs } = initialData;

  const [player1HandDogs, setPlayer1HandDogs] = useState(player1_hand_dogs);
  const [player2HandDogs, setPlayer2HandDogs] = useState(player2_hand_dogs);
  const [boardDogs, setBoardDogs] = useState(board_dogs);
  const [currentTurn, setCurrentTurn] = useState(game.current_turn);
  const [winner, setWinner] = useState(null);
  const [selectedDog, setSelectedDog] = useState(null);

  // ゲーム終了のチェック
  useEffect(() => {
    const bossDogs = boardDogs.filter((dog) => dog.dog_type.name === 'ボス犬');
    if (bossDogs.length === 0) {
      const winningPlayer = currentTurn === 1 ? 2 : 1;
      setWinner(`おめでとうございます、Player ${winningPlayer}さんが勝ちました！`);
    }
  }, [boardDogs, currentTurn]);

  const switchTurn = () => {
    setCurrentTurn((prevTurn) => (prevTurn === 1 ? 2 : 1));
  };

  const handleWinnerModalClose = () => {
    setWinner(null);
    // ゲームのリセットやその他の処理を追加可能
  };

  // const handleReset = () => {
  //   operationRequest.reset_game_request();
  // };

  // const handleUndo = () => {
  //   operationRequest.undo_move_request();
  // };

  const handleRemove = () => {
    if (selectedDog) {
      operationRequest.remove_from_board_request(selectedDog, () => {}, () => {});
      setSelectedDog(null);
    }
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
          rulesFunction={rulesFunction}
          operationRequest={operationRequest}
          selectedDog={selectedDog}
          setSelectedDog={setSelectedDog}
          handleRemove={handleRemove}
          data-testid="hand-area-player-1"
        />
      </div>
      <Board
        dogs={boardDogs}
        setBoardDogs={setBoardDogs}
        switchTurn={switchTurn}
        currentTurn={currentTurn}
        rulesFunction={rulesFunction}
        operationRequest={operationRequest}
        selectedDog={selectedDog}
        setSelectedDog={setSelectedDog}
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
          rulesFunction={rulesFunction}
          operationRequest={operationRequest}
          selectedDog={selectedDog}
          setSelectedDog={setSelectedDog}
          handleRemove={handleRemove}
          data-testid="hand-area-player-2"
        />
      </div>
      <WinnerModal
        winner={winner}
        onClose={handleWinnerModalClose}
        data-testid="winner-modal"
      />
      {/* ExtraOperation はコメントアウト */}
      {/* <ExtraOperation
        onReset={handleReset}
        onUndo={handleUndo}
        data-testid="extra-operation"
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
      winner: PropTypes.number,
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
          max_steps: PropTypes.number.isRequired,
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
          max_steps: PropTypes.number.isRequired,
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
          max_steps: PropTypes.number.isRequired,
        }).isRequired,
        player: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  operationRequest: PropTypes.shape({
    move_request: PropTypes.func.isRequired,
    remove_from_board_request: PropTypes.func.isRequired,
    place_on_board_request: PropTypes.func.isRequired,
    reset_game_request: PropTypes.func.isRequired,
    undo_move_request: PropTypes.func.isRequired,
  }).isRequired,
  rulesFunction: PropTypes.shape({
    check_movement_type: PropTypes.func.isRequired,
    check_duplicate: PropTypes.func.isRequired,
    check_over_max_board: PropTypes.func.isRequired,
    check_no_adjacent: PropTypes.func.isRequired,
    check_own_adjacent: PropTypes.func.isRequired,
    check_would_lose: PropTypes.func.isRequired,
    check_boss_cant_remove: PropTypes.func.isRequired,
  }),
};

export default GameBoard;