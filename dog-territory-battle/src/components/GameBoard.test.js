// src/components/GameBoard.test.js

import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import GameBoard from './GameBoard';
import axios from 'axios';
import '@testing-library/jest-dom';
import { generateValidMoves, generateValidMovesForHandPiece } from '../utils/rules';

// window.alert をモック
window.alert = jest.fn();

// モック関数の設定
jest.mock('axios');
jest.mock('../utils/rules');

describe('GameBoard Component', () => {
  let initialData;

  beforeEach(() => {
    initialData = {
      game: {
        id: 1,
        current_turn: 1,
        player1: 1,
        player2: 2,
      },
      player1_hand_dogs: [
        {
          id: 1,
          name: 'ボス犬',
          is_in_hand: true,
          dog_type: {
            id: 1,
            name: 'ボス犬',
            movement_type: 'diagonal_orthogonal',
            max_steps: 1,
          },
          player: 1,
          movement_type: 'diagonal_orthogonal',
          max_steps: 1,
        },
      ],
      player2_hand_dogs: [],
      board_dogs: [],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 要件1, 要件3:
   * 各プレイヤーは自分のコマしか操作できないかどうか
   * 現在のターンのプレイヤーのコマしか操作できないかどうか
   */
  test('Players can only operate their own pieces during their turn', async () => {
    initialData.board_dogs = [
      {
        id: 2,
        name: 'アニキ犬',
        is_in_hand: false,
        left: 0,
        top: 0,
        dog_type: {
          id: 2,
          name: 'アニキ犬',
          movement_type: 'orthogonal',
          max_steps: 2,
        },
        player: 2,
        movement_type: 'orthogonal',
        max_steps: 2,
      },
    ];

    render(<GameBoard initialData={initialData} />);

    // 相手のコマをクリック
    fireEvent.click(screen.getByText('アニキ犬'));

    // 警告メッセージが表示されることを確認
    expect(window.alert).toHaveBeenCalledWith('まだあなたのターンではありません！');
  });

  /**
   * 要件2:
   * 各プレイヤーがコマの操作を一度行うたびに、もう片方のプレイヤーのターンに移るかどうか
   */
  test('Turn switches after each move', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        current_turn: 2,
        dog: {
          id: 1,
          left: 0,
          top: 0,
        },
      },
    });

    generateValidMovesForHandPiece.mockReturnValue([{ x: 0, y: 0 }]);

    render(<GameBoard initialData={initialData} />);

    // 手札のコマをクリック
    fireEvent.click(screen.getByText('ボス犬'));

    // 有効な移動先をクリック
    fireEvent.click(screen.getByRole('button', { name: /valid-move/i }));

    // ターンが切り替わったことを確認
    expect(screen.getByText(/現在のターン: Player 2/)).toBeInTheDocument();
  });

  /**
   * 要件4:
   * 各コマはその movement_type に従った行動しか取れないかどうか
   */
  test('Pieces can only move according to their movement_type', async () => {
    const dog = {
      id: 1,
      name: 'ヤイバ犬',
      is_in_hand: false,
      left: 0,
      top: 0,
      dog_type: {
        id: 3,
        name: 'ヤイバ犬',
        movement_type: 'orthogonal',
        max_steps: 1,
      },
      player: 1,
      movement_type: 'orthogonal',
      max_steps: 1,
    };

    initialData.board_dogs = [dog];

    generateValidMoves.mockReturnValue([{ x: 0, y: 1 }]);

    render(<GameBoard initialData={initialData} />);

    // コマをクリック
    fireEvent.click(screen.getByText('ヤイバ犬'));

    // 有効な移動先が表示されていることを確認
    expect(generateValidMoves).toHaveBeenCalledWith(dog, initialData.board_dogs, expect.any(Object));
  });

  /**
   * 要件5:
   * すでにコマがあるマスには移動できないかどうか
   */
  test('Cannot move to a square that already has a piece', async () => {
    const dog1 = {
      id: 1,
      name: 'ヤイバ犬',
      is_in_hand: false,
      left: 0,
      top: 0,
      dog_type: {
        id: 3,
        name: 'ヤイバ犬',
        movement_type: 'orthogonal',
        max_steps: 1,
      },
      player: 1,
      movement_type: 'orthogonal',
      max_steps: 1,
    };

    const dog2 = {
      id: 2,
      name: 'アニキ犬',
      is_in_hand: false,
      left: 0,
      top: 100,
      dog_type: {
        id: 2,
        name: 'アニキ犬',
        movement_type: 'orthogonal',
        max_steps: 2,
      },
      player: 2,
      movement_type: 'orthogonal',
      max_steps: 2,
    };

    initialData.board_dogs = [dog1, dog2];

    generateValidMoves.mockReturnValue([]);

    render(<GameBoard initialData={initialData} />);

    // コマをクリック
    fireEvent.click(screen.getByText('ヤイバ犬'));

    // 有効な移動先がないことを確認
    expect(screen.queryByRole('button', { name: /valid-move/i })).not.toBeInTheDocument();
  });

  /**
   * 要件6:
   * 移動後に他のコマと隣接していない場合は移動できないかどうか
   */
  test('Cannot move if resulting position is not adjacent to any other piece', async () => {
    const dog = {
      id: 1,
      name: 'ボス犬',
      is_in_hand: false,
      left: 0,
      top: 0,
      dog_type: {
        id: 1,
        name: 'ボス犬',
        movement_type: 'diagonal_orthogonal',
        max_steps: 1,
      },
      player: 1,
      movement_type: 'diagonal_orthogonal',
      max_steps: 1,
    };

    initialData.board_dogs = [dog];

    generateValidMoves.mockReturnValue([]);

    render(<GameBoard initialData={initialData} />);

    // コマをクリック
    fireEvent.click(screen.getByText('ボス犬'));

    // 有効な移動先がないことを確認
    expect(generateValidMoves).toHaveBeenCalledWith(dog, initialData.board_dogs, expect.any(Object));
    expect(screen.queryByRole('button', { name: /valid-move/i })).not.toBeInTheDocument();
  });

  /**
   * 要件9:
   * ボス犬は手札に戻せないかどうか
   */
  test('Cannot return Boss Dog to hand', async () => {
    const dog = {
      id: 1,
      name: 'ボス犬',
      is_in_hand: false,
      left: 0,
      top: 0,
      dog_type: {
        id: 1,
        name: 'ボス犬',
        movement_type: 'diagonal_orthogonal',
        max_steps: 1,
      },
      player: 1,
      movement_type: 'diagonal_orthogonal',
      max_steps: 1,
    };

    initialData.board_dogs = [dog];

    render(<GameBoard initialData={initialData} />);

    // コマをクリック
    fireEvent.click(screen.getByText('ボス犬'));

    // 手札エリアをクリック
    fireEvent.click(screen.getByTestId('top-hand'));

    // 警告メッセージが表示されることを確認
    expect(window.alert).toHaveBeenCalledWith('ボス犬は手札に戻せません！');
  });

  /**
   * 要件11:
   * 各コマ操作後のコンポーネント再設計メソッドがちゃんと呼び出されているかどうか
   */
  test('Update methods are called after each piece operation', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        current_turn: 2,
        dog: {
          id: 1,
          left: 0,
          top: 0,
        },
      },
    });

    const updateBoardBoundsMock = jest.fn();

    // コンポーネントの関数をモック
    GameBoard.prototype.updateBoardBounds = updateBoardBoundsMock;

    render(<GameBoard initialData={initialData} />);

    // 手札のコマをクリック
    fireEvent.click(screen.getByText('ボス犬'));

    // 有効な移動先をクリック
    fireEvent.click(screen.getByRole('button', { name: /valid-move/i }));

    // updateBoardBounds が呼ばれたことを確認
    expect(updateBoardBoundsMock).toHaveBeenCalled();
  });

  /**
   * 要件12, 要件13:
   * 各コマ操作前に一度移動箇所のハイライトをしているかどうか
   * ハイライトは特定の条件を判定した上で行われているか
   */
  test('Valid moves are highlighted before piece operation, considering specific conditions', async () => {
    const dog = {
      id: 1,
      name: 'ヤイバ犬',
      is_in_hand: false,
      left: 0,
      top: 0,
      dog_type: {
        id: 3,
        name: 'ヤイバ犬',
        movement_type: 'orthogonal',
        max_steps: 1,
      },
      player: 1,
      movement_type: 'orthogonal',
      max_steps: 1,
    };

    initialData.board_dogs = [dog];

    generateValidMoves.mockReturnValue([{ x: 0, y: 1 }]);

    render(<GameBoard initialData={initialData} />);

    // コマをクリック
    fireEvent.click(screen.getByText('ヤイバ犬'));

    // 有効な移動先が表示されていることを確認
    expect(screen.getByRole('button', { name: /valid-move/i })).toBeInTheDocument();
  });

  // 他の要件についても同様にテストを実装できます
});