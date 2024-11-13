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
            currentTurn: true,
        };

        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} />);
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
    test('does not crash with invalid props', () => {
        const invalidDog = null; // 無効な犬オブジェクト

        const { container } = render(<Dog dog={invalidDog} onClick={mockOnClick} />);

        // コンポーネントが何もレンダリングしないことを確認
        expect(container).toBeEmptyDOMElement();
    });

    /**
     * エッジケース:
     * ボス犬が現在のターンでない場合のスタイル適用を確認
     */
    test('applies correct class when it is not the current turn', () => {
        const dog = {
            id: 1,
            name: 'ボス犬',
            currentTurn: false,
        };

        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} />);
        const dogElement = getByText('ボス犬');
        expect(dogElement).toHaveClass('not-current-turn');
    });

    /**
     * エッジケース:
     * Dogコンポーネントが長い名前を持つ場合の表示を確認
     */
    test('handles long dog names gracefully', () => {
        const dog = {
            id: 2,
            name: '非常に長い名前のボス犬',
            currentTurn: true,
        };

        const { getByText } = render(<Dog dog={dog} onClick={mockOnClick} />);
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
            id: 3,
            name: '隠された犬',
            currentTurn: true,
            isHidden: true,
        };

        const { container } = render(<Dog dog={dog} onClick={mockOnClick} />);

        // 特殊な状態である場合、コンポーネントが表示されないことを確認
        expect(container).toBeEmptyDOMElement();
    });
});