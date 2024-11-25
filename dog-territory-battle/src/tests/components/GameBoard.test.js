import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import GameBoard from '../../components/GameJs/GameBoard';
import '@testing-library/jest-dom';
import * as rules from '../../utils/rules';
import * as operationRequests from '../../api/operation_requests';

// 子コンポーネントをモック化
jest.mock('../../components/GameJs/HandArea', () => (props) => {
  const { handDogs, onHandDogClick, onHandAreaClick, isHighlighted, playerId } = props;
  return (
    <div data-testid={`hand-area-mock-${playerId}`} onClick={onHandAreaClick}>
      {handDogs.map((dog) => (
        <div
          key={dog.id}
          data-testid={`hand-dog-${dog.id}`}
          className={`hand-dog ${dog.isSelected ? 'selected' : ''} ${dog.isDisabled ? 'disabled' : ''}`}
          onClick={() => onHandDogClick(dog)}
        >
          {dog.name}
        </div>
      ))}
      {isHighlighted && <div data-testid="hand-area-highlighted">Highlighted</div>}
    </div>
  );
});

jest.mock('../../components/GameJs/Board', () => (props) => {
  const {
    boardDogs,
    candidatePositions,
    onBoardDogClick,
    onBoardSquareClick,
    currentPlayerId,
  } = props;
  return (
    <div data-testid="board-mock">
      {boardDogs.map((dog) => (
        <div
          key={dog.id}
          data-testid={`board-dog-${dog.id}`}
          className={`board-dog ${dog.isSelected ? 'selected' : ''} ${dog.isDisabled ? 'disabled' : ''}`}
          onClick={() => onBoardDogClick(dog)}
        >
          {dog.name}
        </div>
      ))}
      {candidatePositions.map((pos, index) => (
        <div
          key={`candidate-${index}`}
          data-testid={`candidate-position-${pos.x}-${pos.y}`}
          onClick={() => onBoardSquareClick(pos.x, pos.y)}
        >
          Candidate Position ({pos.x}, {pos.y})
        </div>
      ))}
    </div>
  );
});

jest.mock('../../components/GameJs/WinnerModal', () => (props) => {
  const { isOpen, winner, onClose } = props;
  if (!isOpen) return null;
  return (
    <div data-testid="winner-modal">
      <div data-testid="winner-name">おめでとうございます、{winner.username}さん！</div>
      <button data-testid="close-winner-modal" onClick={onClose}>閉じる</button>
    </div>
  );
});

describe('GameBoard Component', () => {
  // モック関数を設定
  const mockApplyHandRules = jest.spyOn(rules, 'applyHandRules');
  const mockApplyBoardRules = jest.spyOn(rules, 'applyBoardRules');
  const mockPlaceOnBoardRequest = jest.spyOn(operationRequests, 'place_on_board_request');
  const mockMoveRequest = jest.spyOn(operationRequests, 'move_request');
  const mockRemoveFromBoardRequest = jest.spyOn(operationRequests, 'remove_from_board_request');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // テスト用の initialData
  const initialData = {
    handDogs: [
      {
        id: 1,
        name: 'アニキ犬',
        dog_type: { id: 2, name: 'アニキ犬', movement_type: 'orthogonal', max_steps: 1 },
        player: 1,
        is_in_hand: true,
        isSelected: false,
        isDisabled: false,
      },
      {
        id: 3,
        name: 'シスター犬',
        dog_type: { id: 3, name: 'シスター犬', movement_type: 'orthogonal', max_steps: 2 },
        player: 2,
        is_in_hand: true,
        isSelected: false,
        isDisabled: false,
      },
    ],
    boardDogs: [
      {
        id: 2,
        name: 'ボス犬',
        dog_type: { id: 1, name: 'ボス犬', movement_type: 'diagonal_orthogonal', max_steps: 1 },
        player: 1,
        x_position: 0,
        y_position: 0,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
      },
    ],
    currentPlayerId: 1,
  };

  const cloneInitialData = () => JSON.parse(JSON.stringify(initialData));

  test('HandArea、Board、ShowCurrentTurn が正しくレンダリングされている', () => {
    render(<GameBoard initialData={cloneInitialData()} />);

    // HandArea と Board のモックがレンダリングされていることを確認
    expect(screen.getAllByTestId(/hand-area-mock-/).length).toBe(2); // 2 つの HandArea
    expect(screen.getByTestId('board-mock')).toBeInTheDocument();
    expect(screen.getByTestId('current-player')).toBeInTheDocument();

    // WinnerModal がレンダリングされていないことを確認
    const winnerModal = screen.queryByTestId('winner-modal');
    expect(winnerModal).not.toBeInTheDocument();
  });

  test('HandArea のコマがクリックされたときに適切な処理が行われる', () => {
    const data = cloneInitialData();

    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 0, y: 0 }],
      updatedState: {},
    });

    render(<GameBoard initialData={data} />);

    const handDogElement = screen.getByTestId('hand-dog-1');

    // コマの isSelected と isDisabled を確認（仮にクラス名で判定）
    expect(handDogElement).not.toHaveClass('selected');
    expect(handDogElement).not.toHaveClass('disabled');

    // 手札のコマをクリック
    fireEvent.click(handDogElement);

    // applyHandRules が呼ばれたことを確認
    expect(mockApplyHandRules).toHaveBeenCalledWith(expect.any(Object), data.handDogs[0]);

    // Board.js に candidatePositions が渡され、ハイライトされていることを確認
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    expect(candidatePositionElement).toBeInTheDocument();

    // コマの isSelected が変わったことを確認（仮にクラス名で判定）
    const updatedHandDogElement = screen.getByTestId('hand-dog-1');
    expect(updatedHandDogElement).toHaveClass('selected');
  });

  test('Board 上のコマがクリックされたときに適切な処理が行われる', () => {
    const data = cloneInitialData();

    mockApplyBoardRules.mockReturnValue({
      candidatePositions: [{ x: 1, y: 1 }],
      updatedState: {},
      canRemove: true,
    });

    render(<GameBoard initialData={data} />);

    const boardDogElement = screen.getByTestId('board-dog-2');

    // コマの isSelected と isDisabled を確認（仮にクラス名で判定）
    expect(boardDogElement).not.toHaveClass('selected');
    expect(boardDogElement).not.toHaveClass('disabled');

    // ボード上のコマをクリック
    fireEvent.click(boardDogElement);

    // applyBoardRules が呼ばれたことを確認
    expect(mockApplyBoardRules).toHaveBeenCalledWith(expect.any(Object), data.boardDogs[0]);

    // Board.js に candidatePositions が渡され、ハイライトされていることを確認
    const candidatePositionElement = screen.getByTestId('candidate-position-1-1');
    expect(candidatePositionElement).toBeInTheDocument();

    // canRemove が true の場合、HandArea がハイライトされていることを確認
    const handAreaHighlighted = screen.getByTestId('hand-area-highlighted');
    expect(handAreaHighlighted).toBeInTheDocument();

    // コマの isSelected が変わったことを確認
    const updatedBoardDogElement = screen.getByTestId('board-dog-2');
    expect(updatedBoardDogElement).toHaveClass('selected');
  });

  test('HandArea がハイライトされている状態でクリックされたときに適切な処理が行われる', () => {
    const data = cloneInitialData();

    // applyBoardRules のモック実装
    mockApplyBoardRules.mockReturnValue({
      candidatePositions: [{ x: 1, y: 1 }],
      updatedState: {},
      canRemove: true,
    });

    // remove_from_board_request のモック実装
    mockRemoveFromBoardRequest.mockImplementation((dog, onSuccess, onError) => {
      onSuccess({ success: true });
    });

    render(<GameBoard initialData={data} />);

    // ボード上のコマをクリックして選択状態にする
    const boardDogElement = screen.getByTestId('board-dog-2');

    // コマの isSelected と isDisabled を確認（仮にクラス名で判定）
    expect(boardDogElement).not.toHaveClass('selected');
    expect(boardDogElement).not.toHaveClass('disabled');

    fireEvent.click(boardDogElement);

    // HandArea がハイライトされていることを確認
    const handAreaElement1 = screen.getByTestId('hand-area-mock-1'); // Player 1
    const handAreaHighlighted = screen.getByTestId('hand-area-highlighted');
    expect(handAreaHighlighted).toBeInTheDocument();

    // コマの isSelected を確認
    expect(boardDogElement).toHaveClass('selected');

    // HandArea をクリック (Player 1 の HandArea)
    fireEvent.click(handAreaElement1);

    // remove_from_board_request が呼ばれたことを確認
    expect(mockRemoveFromBoardRequest).toHaveBeenCalledWith(
      data.boardDogs[0],
      expect.any(Function),
      expect.any(Function)
    );

    // ターンが変更されたことを確認
    const currentPlayerElement = screen.getByTestId('current-player');
    expect(currentPlayerElement).toHaveTextContent("Player 2's Turn");
  });

  test('Board のハイライトされたマスをクリックしたときに適切な処理が行われる（手札から配置）', () => {
    const data = cloneInitialData();

    // place_on_board_request のモック実装
    mockPlaceOnBoardRequest.mockImplementation((dog, move, onSuccess, onError) => {
      onSuccess({ success: true });
    });

    // applyHandRules のモック実装
    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 0, y: 0 }],
      updatedState: {},
    });

    render(<GameBoard initialData={data} />);

    // 手札のコマをクリックして選択状態にする (Player 1)
    const handDogElement = screen.getByTestId('hand-dog-1');
    fireEvent.click(handDogElement);

    // ハイライトされたマスを取得
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    expect(candidatePositionElement).toBeInTheDocument();

    // ハイライトされたマスをクリック
    fireEvent.click(candidatePositionElement);

    // place_on_board_request が呼ばれたことを確認
    expect(mockPlaceOnBoardRequest).toHaveBeenCalledWith(
      data.handDogs[0],
      { x: 0, y: 0 },
      expect.any(Function),
      expect.any(Function)
    );

    // ターンが変更されたことを確認
    const currentPlayerElement = screen.getByTestId('current-player');
    expect(currentPlayerElement).toHaveTextContent("Player 2's Turn");
  });

  test('ターンが切り替わると ShowCurrentTurn が更新される', () => {
    const data = cloneInitialData();

    // applyHandRules と place_on_board_request のモックを設定
    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 0, y: 0 }],
      updatedState: {},
    });
    mockPlaceOnBoardRequest.mockImplementation((dog, move, onSuccess, onError) => {
      onSuccess({ success: true });
    });

    render(<GameBoard initialData={data} />);

    const currentPlayerElement = screen.getByTestId('current-player');
    expect(currentPlayerElement).toHaveTextContent("Player 1's Turn");

    // 手札のコマをクリック
    const handDogElement = screen.getByTestId('hand-dog-1');
    fireEvent.click(handDogElement);

    // ハイライトされたマスをクリックしてコマを配置（ターンが変更される）
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    fireEvent.click(candidatePositionElement);

    // ターンが変更されたことを確認
    expect(currentPlayerElement).toHaveTextContent("Player 2's Turn");
  });

  test('バックエンドから勝者が決定したレスポンスが返ってきた場合に WinnerModal がレンダリングされる', () => {
    const data = cloneInitialData();

    // place_on_board_request のモック実装
    mockPlaceOnBoardRequest.mockImplementation((dog, move, onSuccess, onError) => {
      const mockWinner = {
        id: 2,
        username: 'Player2',
      };
      onSuccess({ success: true, dog: { ...dog }, winner: mockWinner });
    });

    // applyHandRules のモック実装
    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 0, y: 0 }],
      updatedState: {},
    });

    render(<GameBoard initialData={data} />);

    // 手札のコマをクリックして選択状態にする (Player 1)
    const handDogElement = screen.getByTestId('hand-dog-1');
    fireEvent.click(handDogElement);

    // ハイライトされたマスを取得
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    expect(candidatePositionElement).toBeInTheDocument();

    // ハイライトされたマスをクリック
    fireEvent.click(candidatePositionElement);

    // WinnerModal がレンダリングされていることを確認
    const winnerModal = screen.getByTestId('winner-modal');
    expect(winnerModal).toBeInTheDocument();

    // 勝者の名前が表示されていることを確認
    const winnerName = screen.getByTestId('winner-name');
    expect(winnerName).toHaveTextContent("おめでとうございます、Player2さん！");

    // WinnerModal の閉じるボタンをクリックして閉じることを確認
    const closeButton = screen.getByTestId('close-winner-modal');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('winner-modal')).not.toBeInTheDocument();
  });
});