// src/tests/components/Dog.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Dog from '../../components/GameJs/Dog';
import '@testing-library/jest-dom';

describe('Dog Component', () => {
    const mockOnClick = jest.fn();

    /**
     * 正常系:
     * Dogコンポーネントが正しくレンダリングされ、クリックイベントがハンドルされるかを確認
     */
    test('renders Dog component correctly and handles click', () => {
        const dog = {
            id: 1,
            name: 'ボス犬',
            left: 100,
            top: 200,
            is_in_hand: true,
            dog_type: {
                id: 1,
                name: 'ボス犬タイプ',
                movement_type: '歩行',
                max_steps: 3,
            },
            player: 1,
        };

        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} isCurrentTurn={true} />);
        const dogElement = getByText('ボス犬');
        expect(dogElement).toBeInTheDocument();

        // 犬をクリックし、ハンドルされることを確認
        fireEvent.click(dogElement);
        expect(mockOnClick).toHaveBeenCalledWith(dog);
    });

    /**
     * 異常系:
     * Dogコンポーネントに無効なプロップスが渡された場合の挙動を確認
     */
    test('throws error when dog prop is null', () => {
        const invalidDog = null; // 無効な犬オブジェクト

        // コンソールエラーを抑制
        const originalConsoleError = console.error;
        console.error = jest.fn();

        expect(() => render(<Dog dog={invalidDog} onClick={mockOnClick} isCurrentTurn={true} />)).toThrow();

        // コンソールエラーを元に戻す
        console.error = originalConsoleError;
    });

    /**
     * エッジケース:
     * ボス犬が現在のターンでない場合のスタイル適用を確認
     */
    test('applies correct class when it is not the current turn', () => {
        const dog = {
            id: 2,
            name: 'アニキ犬',
            left: 150,
            top: 250,
            is_in_hand: false,
            dog_type: {
                id: 2,
                name: 'アニキ犬タイプ',
                movement_type: '走行',
                max_steps: 5,
            },
            player: 1,
        };

        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} isCurrentTurn={false} />);
        const dogElement = getByText('アニキ犬');

        expect(dogElement).toHaveClass('not-current-turn');
    });

    /**
     * エッジケース:
     * Dogコンポーネントが長い名前を持つ場合の表示を確認
     */
    test('handles long dog names gracefully', () => {
        const dog = {
            id: 3,
            name: '非常に長い名前のボス犬',
            left: 200,
            top: 300,
            is_in_hand: true,
            dog_type: {
                id: 3,
                name: '長い名前犬タイプ',
                movement_type: '飛行',
                max_steps: 4,
            },
            player: 1,
        };

        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} isCurrentTurn={true} />);
        const dogElement = getByText('非常に長い名前のボス犬');
        expect(dogElement).toBeInTheDocument();

        // スタイルの確認やテキストの切り捨てが行われているかを追加で確認可能
        // 例: expect(dogElement).toHaveStyle('text-overflow: ellipsis');
    });

    /**
     * エッジケース:
     * Dogコンポーネントが特殊な状態（例: 非表示）である場合の表示を確認
     */
    test('does not render when dog is hidden', () => {
        const dog = {
            id: 4,
            name: '隠された犬',
            left: 250,
            top: 350,
            is_in_hand: true,
            dog_type: {
                id: 4,
                name: '隠された犬タイプ',
                movement_type: '潜水',
                max_steps: 2,
            },
            player: 1,
            isHidden: true, // Dogコンポーネント側でこのプロパティを使用して非表示にする
        };

        const { container } = render(<Dog dog={dog} onClick={mockOnClick} isCurrentTurn={true} />);

        // Dogコンポーネントが isHidden を処理している場合、コンポーネントはレンダリングされません
        expect(container).toBeEmptyDOMElement();
    });
});