import React, { useState } from 'react';
import HandArea from './HandArea';
import Board from './Board';
import ShowCurrentTurn from './ShowCurrentTurn';
import WinnerModal from './WinnerModal';
import { applyHandRules, applyBoardRules } from '../../utils/rules';
import {
  place_on_board_request,
  move_request,
  remove_from_board_request,
} from '../../api/operation_requests';
import PropTypes from 'prop-types';
import '../../css/GameCss/GameBoard.css';

const GameBoard = ({ initialData }) => {
  const [handDogs, setHandDogs] = useState([
    ...(initialData.player1_hand_dogs || []).map((dog) => ({ ...dog, player: 1 })),
    ...(initialData.player2_hand_dogs || []).map((dog) => ({ ...dog, player: 2 })),
  ]);
  const [boardDogs, setBoardDogs] = useState(initialData.board_dogs || []);
  const [currentPlayerId, setCurrentPlayerId] = useState(initialData.game.current_turn || 1);

  const [selectedDog, setSelectedDog] = useState(null);
  const [candidatePositions, setCandidatePositions] = useState([]);
  const [isHandAreaHighlighted, setIsHandAreaHighlighted] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const [isHandDogSelected, setIsHandDogSelected] = useState(false);

  const [winner, setWinner] = useState(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);

  const updateDogState = (updatedDog) => {
    if (!updatedDog) return;

    setBoardDogs((prevDogs) => {
      const exists = prevDogs.some((dog) => dog.id === updatedDog.id);
      return exists
        ? prevDogs.map((dog) =>
            dog.id === updatedDog.id ? { ...dog, ...updatedDog } : dog
          )
        : [...prevDogs, updatedDog];
    });
  
    if (updatedDog.is_in_hand) {
      // 手札に戻す場合
      setHandDogs((prevDogs) => {
        const exists = prevDogs.some((dog) => dog.id === updatedDog.id);
        return exists
          ? prevDogs.map((dog) =>
              dog.id === updatedDog.id ? { ...dog, ...updatedDog } : dog
            )
          : [...prevDogs, updatedDog];
      });
  
      setBoardDogs((prevDogs) =>
        prevDogs.filter((dog) => dog.id !== updatedDog.id)
      );
    } else {
      // 手札からボードに移動する場合
      setHandDogs((prevDogs) =>
        prevDogs.filter((dog) => dog.id !== updatedDog.id)
      );
    }
  };

  // 手札のコマをクリックしたとき
  const handleHandDogClick = (dog, e) => {
    e.stopPropagation(); // イベントの伝播を止める

    if (dog.player !== currentPlayerId || dog.isDisabled) return;

    resetSelection();

    const updatedHandDogs = handDogs.map((d) =>
      d.id === dog.id ? { ...d, isSelected: true } : {...d, isSelected: false}
    );
    setHandDogs(updatedHandDogs);
    setSelectedDog(dog);
    setIsHandDogSelected(true);

    const result = applyHandRules({ handDogs, boardDogs, playerId: currentPlayerId, selectedDog: dog });
    setCandidatePositions(result.candidatePositions);
  };

  // HandArea がハイライトされている状態でクリックされたとき
  const handleHandAreaClick = (playerId, e) => {
    e.stopPropagation(); // イベントの伝播を止める

    if (selectedDog && !isHandDogSelected && canRemove && playerId === currentPlayerId) {
      // ボードからコマを削除して手札に戻す
      remove_from_board_request(
        selectedDog,
        (response) => {
          if (response.success) {
            const updatedHandDogs = [
              ...handDogs,
              { ...selectedDog, is_in_hand: true, x: null, y: null },
            ];
            const updatedBoardDogs = boardDogs.filter((dog) => dog.id !== selectedDog.id);
            setHandDogs(updatedHandDogs);
            setBoardDogs(updatedBoardDogs);
  
            resetSelection();
  
            if (response.winner) {
              setWinner(response.winner);
              setIsWinnerModalOpen(true);
            } else {
              setIsHandAreaHighlighted(false);
              setCurrentPlayerId(currentPlayerId === 1 ? 2 : 1);
            }
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  };

  // ボード上のコマをクリックしたとき
  const handleBoardDogClick = (dog, e) => {
    e.stopPropagation(); // イベントの伝播を止める

    if (dog.player !== currentPlayerId || dog.isDisabled) return;

    resetSelection();

    const updatedBoardDogs = boardDogs.map((d) =>
      d.id === dog.id ? { ...d, isSelected: true } : {...d, isSelected: false}
    );

    setBoardDogs(updatedBoardDogs);
    setSelectedDog(dog);

    const data = {
      boardDogs: updatedBoardDogs,
      playerId: dog.player,
      selectedDog: dog,
    };

    const result = applyBoardRules(data);
    setCandidatePositions(result.candidatePositions);
    setCanRemove(result.canRemove);
    setIsHandAreaHighlighted(result.canRemove);
  };

  // ボード上のハイライトされたマスをクリックしたとき
  const handleBoardSquareClick = (x, y, e) => {
    e.stopPropagation(); // イベントの伝播を止める

    if (selectedDog) {
      if (isHandDogSelected) {
        // 手札からボードに配置
        place_on_board_request(
          selectedDog,
          { x, y },
          (response) => {
            if (response.success) {
              const updatedDog = response.dog;
              updateDogState(updatedDog);
              resetSelection();

              if (response.winner) {
                setWinner(response.winner);
                setIsWinnerModalOpen(true);
              } else {
                setCurrentPlayerId(currentPlayerId === 1 ? 2 : 1);
              }
            }
          },
          (error) => {
            console.error(error);
          }
        );
      } else {
        // ボード上のコマを移動
        move_request(
          selectedDog,
          { x, y },
          (response) => {
            if (response.success) {
              console.log(response);
              const updatedDog = response.dog;
              updateDogState(updatedDog);
              setCurrentPlayerId(response.current_turn);
              resetSelection();
        
              if (response.winner) {
                setWinner(response.winner);
                setIsWinnerModalOpen(true);
              }
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }
    }
  };

  // ボードやコマ、手札以外の箇所をクリックした際に各種選択状態をリセット
  const handleBackgroundClick = () => {
    const updatedHandDogs = handDogs.map((d) => ({ ...d, isSelected: false }));
    const updatedBoardDogs = boardDogs.map((d) => ({ ...d, isSelected: false }));
    setHandDogs(updatedHandDogs);
    setBoardDogs(updatedBoardDogs);

    resetSelection();
  };

  // 選択状態をリセット
  const resetSelection = () => {
    setSelectedDog(null);
    setCandidatePositions([]);
    setIsHandDogSelected(false);
    setCanRemove(false);
    setIsHandAreaHighlighted(false);
  };

  // WinnerModal を閉じるハンドラー
  const handleCloseWinnerModal = () => {
    setIsWinnerModalOpen(false);
  };

  return (
    <div id="game-board-container" data-testid="game-board-container" onClick={handleBackgroundClick}>
      <div className="show-current-turn">
        <ShowCurrentTurn currentPlayerId={currentPlayerId} />
      </div>
      <div className="hand-area">
        <HandArea
          handDogs={handDogs.filter((dog) => dog.player === 1)}
          onHandDogClick={handleHandDogClick}
          onHandAreaClick={handleHandAreaClick}
          currentPlayerId={currentPlayerId}
          isHighlighted={isHandAreaHighlighted && currentPlayerId === 1}
        />
      </div>
      <div className="board-container">
        <Board
          boardDogs={boardDogs}
          candidatePositions={candidatePositions}
          onBoardDogClick={handleBoardDogClick}
          onBoardSquareClick={handleBoardSquareClick}
          currentPlayerId={currentPlayerId}
        />
      </div>
      <div className="hand-area player2">
        <HandArea
          handDogs={handDogs.filter((dog) => dog.player === 2)}
          onHandDogClick={handleHandDogClick}
          onHandAreaClick={handleHandAreaClick}
          currentPlayerId={currentPlayerId}
          isHighlighted={isHandAreaHighlighted && currentPlayerId === 2}
        />
      </div>

      {/* WinnerModal を条件付きでレンダリング */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        winner={winner}
        onClose={handleCloseWinnerModal}
      />
    </div>
  );
};

// PropTypes の定義（オプション）
GameBoard.propTypes = {
  initialData: PropTypes.shape({
    game: PropTypes.shape({
      current_turn: PropTypes.number,
      id: PropTypes.number,
      player1: PropTypes.number,
      player2: PropTypes.number,
    }),
    player1_hand_dogs: PropTypes.arrayOf(PropTypes.object),
    player2_hand_dogs: PropTypes.arrayOf(PropTypes.object),
    board_dogs: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default GameBoard;