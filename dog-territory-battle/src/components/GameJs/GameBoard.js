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

const GameBoard = ({ initialData }) => {
  const [handDogs, setHandDogs] = useState(initialData.handDogs);
  const [boardDogs, setBoardDogs] = useState(initialData.boardDogs);
  const [currentPlayerId, setCurrentPlayerId] = useState(initialData.currentPlayerId);

  const [selectedDog, setSelectedDog] = useState(null);
  const [candidatePositions, setCandidatePositions] = useState([]);
  const [isHandAreaHighlighted, setIsHandAreaHighlighted] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const [isHandDogSelected, setIsHandDogSelected] = useState(false);

  const [winner, setWinner] = useState(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);

  // 手札のコマをクリックしたとき
  const handleHandDogClick = (dog) => {
    if (dog.player === currentPlayerId && !dog.isSelected && !dog.isDisabled) {
      resetSelection();

      const updatedHandDogs = handDogs.map(d => 
        d.id === dog.id ? { ...d, isSelected: true } : d
      );
      setHandDogs(updatedHandDogs);
      setSelectedDog(dog);
      setIsHandDogSelected(true);

      const result = applyHandRules({ handDogs, boardDogs }, dog);
      setCandidatePositions(result.candidatePositions);
    }
  };

  // ボード上のコマをクリックしたとき
  const handleBoardDogClick = (dog) => {
    if (dog.player === currentPlayerId && !dog.isSelected && !dog.isDisabled) {
      resetSelection();

      const updatedBoardDogs = boardDogs.map(d => 
        d.id === dog.id ? { ...d, isSelected: true } : d
      );
      setBoardDogs(updatedBoardDogs);
      setSelectedDog(dog);
      setIsHandDogSelected(false);

      const result = applyBoardRules({ handDogs, boardDogs }, dog);
      setCandidatePositions(result.candidatePositions);
      setCanRemove(result.canRemove);
      setIsHandAreaHighlighted(result.canRemove);
    }
  };

  // ボード上のハイライトされたマスをクリックしたとき
  const handleBoardSquareClick = (x, y) => {
    if (selectedDog) {
      if (isHandDogSelected) {
        // 手札からボードに配置
        place_on_board_request(
          selectedDog,
          { x, y },
          (response) => {
            if (response.success) {
              selectedDog.x_position = x;
              selectedDog.y_position = y;
              selectedDog.is_in_hand = false;

              setBoardDogs([...boardDogs, selectedDog]);
              setHandDogs(handDogs.filter((dog) => dog.id !== selectedDog.id));

              resetSelection();

              if (response.winner) {
                setWinner(response.winner);
                setIsWinnerModalOpen(true);
              } else {
                // ターンを変更（仮に 2 プレイヤーの場合）
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
              const updatedBoardDogs = boardDogs.map(d => 
                d.id === selectedDog.id ? { ...d, x_position: x, y_position: y } : d
              );
              setBoardDogs(updatedBoardDogs);
              resetSelection();

              if (response.winner) {
                setWinner(response.winner);
                setIsWinnerModalOpen(true);
              } else {
                // ターンを変更
                setCurrentPlayerId(currentPlayerId === 1 ? 2 : 1);
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

  // HandArea がハイライトされている状態でクリックされたとき
  const handleHandAreaClick = (playerId) => {
    if (selectedDog && !isHandDogSelected && canRemove && playerId === currentPlayerId) {
      // ボードからコマを削除して手札に戻す
      remove_from_board_request(
        selectedDog,
        (response) => {
          if (response.success) {
            const updatedHandDogs = [...handDogs, { ...selectedDog, is_in_hand: true, x_position: null, y_position: null }];
            const updatedBoardDogs = boardDogs.filter((dog) => dog.id !== selectedDog.id);
            setHandDogs(updatedHandDogs);
            setBoardDogs(updatedBoardDogs);

            resetSelection();

            if (response.winner) {
              setWinner(response.winner);
              setIsWinnerModalOpen(true);
            } else {
              setIsHandAreaHighlighted(false);
              // ターンを変更
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

  // 選択状態をリセット
  const resetSelection = () => {
    const updatedHandDogs = handDogs.map(d => ({ ...d, isSelected: false }));
    const updatedBoardDogs = boardDogs.map(d => ({ ...d, isSelected: false }));
    setHandDogs(updatedHandDogs);
    setBoardDogs(updatedBoardDogs);
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
    <div>
      <ShowCurrentTurn currentPlayerId={currentPlayerId} />

      <HandArea
        handDogs={handDogs.filter((dog) => dog.player === 1)}
        onHandDogClick={handleHandDogClick}
        onHandAreaClick={() => handleHandAreaClick(1)}
        currentPlayerId={currentPlayerId}
        isHighlighted={isHandAreaHighlighted && currentPlayerId === 1}
        playerId={1}
      />

      <Board
        boardDogs={boardDogs}
        candidatePositions={candidatePositions}
        onBoardDogClick={handleBoardDogClick}
        onBoardSquareClick={handleBoardSquareClick}
        currentPlayerId={currentPlayerId}
      />

      <HandArea
        handDogs={handDogs.filter((dog) => dog.player === 2)}
        onHandDogClick={handleHandDogClick}
        onHandAreaClick={() => handleHandAreaClick(2)}
        currentPlayerId={currentPlayerId}
        isHighlighted={isHandAreaHighlighted && currentPlayerId === 2}
        playerId={2}
      />

      {/* WinnerModal を条件付きでレンダリング */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        winner={winner}
        onClose={handleCloseWinnerModal}
      />
    </div>
  );
};

export default GameBoard;