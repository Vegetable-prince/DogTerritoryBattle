import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import GameBoard from '../../components/GameJs/GameBoard';
import '@testing-library/jest-dom';
import * as rules from '../../utils/rules';
import * as operationRequests from '../../api/operation_requests';

// HandArea コンポーネントをモック化
jest.mock('../../components/GameJs/HandArea', () => {
  const MockHandArea = (props) => {
    const { handDogs, onHandDogClick, onHandAreaClick, isHighlighted, currentPlayerId } = props;
    return (
      <div
        data-testid={`hand-area-mock-${currentPlayerId}`}
        onClick={(e) => onHandAreaClick(currentPlayerId, e)}
      >
        {handDogs.map((dog) => (
          <div
            key={dog.id}
            data-testid={`hand-dog-${dog.id}`}
            className={`hand-dog ${dog.isSelected ? 'selected' : ''} ${dog.isDisabled ? 'disabled' : ''}`}
            onClick={(e) => onHandDogClick(dog, e)}
          >
            {dog.name}
          </div>
        ))}
        {isHighlighted && <div data-testid="hand-area-highlighted">Highlighted</div>}
      </div>
    );
  };

  MockHandArea.displayName = 'HandArea';
  return MockHandArea;
});

// Board コンポーネントをモック化
jest.mock('../../components/GameJs/Board', () => {
  const MockBoard = (props) => {
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
            onClick={(e) => onBoardDogClick(dog, e)}
          >
            {dog.name}
          </div>
        ))}
        {candidatePositions.map((pos, index) => (
          <div
            key={`candidate-${index}`}
            data-testid={`candidate-position-${pos.x}-${pos.y}`}
            onClick={(e) => onBoardSquareClick(pos.x, pos.y, e)}
          >
            Candidate Position ({pos.x}, {pos.y})
          </div>
        ))}
      </div>
    );
  };

  MockBoard.displayName = 'Board';
  return MockBoard;
});

// ShowCurrentTurn コンポーネントをモック化
jest.mock('../../components/GameJs/ShowCurrentTurn', () => {
  const MockShowCurrentTurn = (props) => {
    const { currentPlayerId } = props;
    return <div data-testid="current-player">Player {currentPlayerId}&apos;s Turn</div>;
  };

  MockShowCurrentTurn.displayName = 'ShowCurrentTurn';
  return MockShowCurrentTurn;
});

// WinnerModal コンポーネントをモック化
jest.mock('../../components/GameJs/WinnerModal', () => {
  const MockWinnerModal = (props) => {
    const { isOpen, winner, onClose } = props;
    if (!isOpen || !winner) {
      return null;
    }
    return (
      <div data-testid="winner-modal">
        <div data-testid="winner-name">おめでとうございます、{winner.username}さん！</div>
        <button data-testid="close-winner-modal" onClick={onClose}>
          閉じる
        </button>
      </div>
    );
  };

  MockWinnerModal.displayName = 'WinnerModal';
  return MockWinnerModal;
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
    game: {
      current_turn: 1,
      id: 1,
      player1: 1,
      player2: 2,
    },
    player1_hand_dogs: [
      {
        id: 11,
        name: 'トツ犬',
        x: null,
        y: null,
        is_in_hand: true,
        isSelected: false,
        isDisabled: false,
        player: 1,
      },
    ],
    player2_hand_dogs: [
      {
        id: 14,
        name: 'ハジケ犬',
        x: null,
        y: null,
        is_in_hand: true,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
      {
        id: 10,
        name: '豆でっぽう犬',
        x: null,
        y: null,
        is_in_hand: true,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
      {
        id: 6,
        name: 'アニキ犬',
        x: null,
        y: null,
        is_in_hand: true,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
    ],
    board_dogs: [
      {
        id: 5,
        name: 'アニキ犬',
        x: 2,
        y: 0,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 1,
      },
      {
        id: 13,
        name: 'ハジケ犬',
        x: 3,
        y: 3,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
      {
        id: 9,
        name: '豆でっぽう犬',
        x: 1,
        y: 2,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 1,
      },
      {
        id: 8,
        name: 'ヤイバ犬',
        x: 4,
        y: 0,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
      {
        id: 4,
        name: 'ボス犬',
        x: 1,
        y: 3,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 1,
      },
      {
        id: 3,
        name: 'ボス犬',
        x: 1,
        y: 0,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
      {
        id: 7,
        name: 'ヤイバ犬',
        x: 4,
        y: 1,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 1,
      },
      {
        id: 12,
        name: 'トツ犬',
        x: 1,
        y: 1,
        is_in_hand: false,
        isSelected: false,
        isDisabled: false,
        player: 2,
      },
    ],
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

    const handDogElement = screen.getByTestId('hand-dog-11');

    // コマの isSelected と isDisabled を確認（仮にクラス名で判定）
    expect(handDogElement).not.toHaveClass('selected');
    expect(handDogElement).not.toHaveClass('disabled');

    // 手札のコマをクリック
    fireEvent.click(handDogElement);

    // applyHandRules が呼ばれたことを確認
    expect(mockApplyHandRules).toHaveBeenCalledWith(
      expect.objectContaining({
        handDogs: [
          ...data.player1_hand_dogs.map(dog => ({ ...dog, player: 1 })),
          ...data.player2_hand_dogs.map(dog => ({ ...dog, player: 2 })),
        ],
        boardDogs: data.board_dogs,
        playerId: data.game.current_turn,
        selectedDog: data.player1_hand_dogs[0],
      })
    );

    // Board.js に candidatePositions が渡され、ハイライトされていることを確認
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    expect(candidatePositionElement).toBeInTheDocument();

    // コマの isSelected が変わったことを確認（仮にクラス名で判定）
    const updatedHandDogElement = screen.getByTestId('hand-dog-11');
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

    const boardDogElement = screen.getByTestId('board-dog-5');

    // コマの isSelected と isDisabled を確認（仮にクラス名で判定）
    expect(boardDogElement).not.toHaveClass('selected');
    expect(boardDogElement).not.toHaveClass('disabled');

    // ボード上のコマをクリック
    fireEvent.click(boardDogElement);

    // applyBoardRules が呼ばれたことを確認
    expect(mockApplyBoardRules).toHaveBeenCalledWith(
      expect.objectContaining({
        boardDogs: data.board_dogs.map(dog => 
          dog.id === 5 ? { ...dog, isSelected: true } : dog
        ),
        playerId: data.game.current_turn,
        selectedDog: data.board_dogs[0],
      })
    );

    // Board.js に candidatePositions が渡され、ハイライトされていることを確認
    const candidatePositionElement = screen.getByTestId('candidate-position-1-1');
    expect(candidatePositionElement).toBeInTheDocument();

    // canRemove が true の場合、HandArea がハイライトされていることを確認
    const handAreaHighlighted = screen.getByTestId('hand-area-highlighted');
    expect(handAreaHighlighted).toBeInTheDocument();

    // コマの isSelected が変わったことを確認
    const updatedBoardDogElement = screen.getByTestId('board-dog-5');
    expect(updatedBoardDogElement).toHaveClass('selected');
  });

  test('HandArea がハイライトされている状態でクリックするとコールバック関数が呼ばれる', () => {
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
    const boardDogElement = screen.getByTestId('board-dog-5');
  
    // コマの isSelected と isDisabled を確認（仮にクラス名で判定）
    expect(boardDogElement).not.toHaveClass('selected');
    expect(boardDogElement).not.toHaveClass('disabled');
  
    fireEvent.click(boardDogElement);
  
    // HandArea がハイライトされていることを確認(プレイヤー1)
    const handAreaElements = screen.getAllByTestId('hand-area-mock-1');
  
    // player1の HandArea を見つける（'hand-dog-11' が含まれている HandArea）
    const handAreaElement1 = handAreaElements.find(element =>
      within(element).queryByTestId('hand-dog-11')
    );
  
    expect(handAreaElement1).toBeInTheDocument();
  
    // HandArea がハイライトされていることを確認
    const handAreaHighlighted = within(handAreaElement1).getByTestId('hand-area-highlighted');
    expect(handAreaHighlighted).toBeInTheDocument();
  
    // コマの isSelected を確認
    expect(boardDogElement).toHaveClass('selected');
  
    // HandArea をクリック (Player 1 の HandArea)
    fireEvent.click(handAreaElement1);
  
    // remove_from_board_request が呼ばれたことを確認
    expect(mockRemoveFromBoardRequest).toHaveBeenCalledWith(
      data.board_dogs[0],
      expect.any(Function),
      expect.any(Function)
    );
  
    // ターンが変更されたことを確認
    const currentPlayerElement = screen.getByTestId('current-player');
    expect(currentPlayerElement).toHaveTextContent('Player 2\'s Turn');
  });

  test('Board のハイライトされたマスをクリックしたときに適切な処理が行われる（手札から配置）', () => {
    const data = cloneInitialData();

    // place_on_board_request のモック実装
    mockPlaceOnBoardRequest.mockImplementation((dog, move, onSuccess, onError) => {
      const updatedDog = { ...dog, is_in_hand: false, x: move.x, y: move.y };
      onSuccess({ success: true, dog: updatedDog, current_turn: 2 });
    });

    // applyHandRules のモック実装
    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 0, y: 0 }],
      updatedState: {},
    });

    render(<GameBoard initialData={data} />);

    // 手札のコマをクリックして選択状態にする (Player 1)
    const handDogElement = screen.getByTestId('hand-dog-11');
    fireEvent.click(handDogElement);

    // ハイライトされたマスを取得
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    expect(candidatePositionElement).toBeInTheDocument();

    // ハイライトされたマスをクリック
    fireEvent.click(candidatePositionElement);

    // place_on_board_request が呼ばれたことを確認
    expect(mockPlaceOnBoardRequest).toHaveBeenCalledWith(
      expect.objectContaining({ id: 11, player: 1, is_in_hand: true, x: null, y: null }),
      { x: 0, y: 0 },
      expect.any(Function),
      expect.any(Function)
    );

    // ターンが変更されたことを確認
    const currentPlayerElement = screen.getByTestId('current-player');
    expect(currentPlayerElement).toHaveTextContent('Player 2\'s Turn');
  });

  test('ターンが切り替わると ShowCurrentTurn が更新される', () => {
    const data = cloneInitialData();

    // applyHandRules と place_on_board_request のモックを設定
    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 0, y: 0 }],
      updatedState: {},
    });
    mockPlaceOnBoardRequest.mockImplementation((dog, move, onSuccess, onError) => {
      // 更新された犬オブジェクトを作成
      const updatedDog = { 
        ...dog, 
        is_in_hand: false, 
        x_position: move.x, 
        y_position: move.y 
      };
      onSuccess({ success: true, dog: updatedDog, current_turn: 2 });
    });

    render(<GameBoard initialData={data} />);

    const currentPlayerElement = screen.getByTestId('current-player');
    expect(currentPlayerElement).toHaveTextContent('Player 1\'s Turn');

    // 手札のコマをクリックして選択状態にする (Player 1)
    const handDogElement = screen.getByTestId('hand-dog-11');
    fireEvent.click(handDogElement);

    // ハイライトされたマスを取得
    const candidatePositionElement = screen.getByTestId('candidate-position-0-0');
    expect(candidatePositionElement).toBeInTheDocument();

    // ハイライトされたマスをクリック
    fireEvent.click(candidatePositionElement);

    // place_on_board_request が呼ばれたことを確認
    expect(mockPlaceOnBoardRequest).toHaveBeenCalledWith(
      expect.objectContaining({ id: 11, player: 1, is_in_hand: true, x: null, y: null }), // 修正: 元のdogオブジェクトを期待
      { x: 0, y: 0 },
      expect.any(Function),
      expect.any(Function)
    );

    // ターンが変更されたことを確認
    const updatedPlayerElement = screen.getByTestId('current-player');
    expect(updatedPlayerElement).toHaveTextContent('Player 2\'s Turn');
  });

  test('WinnerModal がレンダリングされていないことを確認する（勝者が決定していない場合）', () => {
    render(<GameBoard initialData={cloneInitialData()} />);

    // WinnerModal がレンダリングされていないことを確認
    const winnerModal = screen.queryByTestId('winner-modal');
    expect(winnerModal).not.toBeInTheDocument();
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
    const handDogElement = screen.getByTestId('hand-dog-11');
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
    expect(winnerName).toHaveTextContent('おめでとうございます、Player2さん！');

    // WinnerModal の閉じるボタンをクリックして閉じることを確認
    const closeButton = screen.getByTestId('close-winner-modal');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('winner-modal')).not.toBeInTheDocument();
  });

  // ボード上のコマを選択後、背景をクリックして選択状態が解除される
  test('ボード上のコマを選択してから背景をクリックすると選択状態が解除される', () => {
    const data = cloneInitialData();

    mockApplyBoardRules.mockReturnValue({
      candidatePositions: [{ x: 1, y: 1 }],
      updatedState: {},
      canRemove: false,
    });

    render(<GameBoard initialData={data} />);

    const boardDogElement = screen.getByTestId('board-dog-5');

    // コマをクリックして選択状態にする
    fireEvent.click(boardDogElement);

    // コマが選択されていることを確認
    expect(boardDogElement).toHaveClass('selected');

    // 背景（ゲームボードコンテナ）をクリック
    const gameBoardContainer = screen.getByTestId('game-board-container');
    fireEvent.click(gameBoardContainer);

    // コマの選択状態が解除されていることを確認
    expect(boardDogElement).not.toHaveClass('selected');
  });

  // 新しいテストケース2: 手札のコマを選択後、背景をクリックして選択状態が解除される
  test('手札のコマを選択してから背景をクリックすると選択状態が解除される', () => {
    const data = cloneInitialData();

    mockApplyHandRules.mockReturnValue({
      candidatePositions: [{ x: 2, y: 2 }],
      updatedState: {},
    });

    render(<GameBoard initialData={data} />);

    const handDogElement = screen.getByTestId('hand-dog-11');

    // 手札のコマをクリックして選択状態にする
    fireEvent.click(handDogElement);

    // コマが選択されていることを確認
    expect(handDogElement).toHaveClass('selected');

    // 背景（ゲームボードコンテナ）をクリック
    const gameBoardContainer = screen.getByTestId('game-board-container');
    fireEvent.click(gameBoardContainer);

    // コマの選択状態が解除されていることを確認
    expect(handDogElement).not.toHaveClass('selected');
  });
});