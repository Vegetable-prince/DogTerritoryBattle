import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import WinnerModal from '../../components/WinnerModal';
import '@testing-library/jest-dom';

describe('WinnerModal Component', () => {
	const mockOnClose = jest.fn();

	/**
	 * 正常系:
	 * WinnerModalが正しく勝者メッセージを表示し、閉じるボタンが機能するかを確認
	 */
	test('renders winner message correctly and handles close', () => {
		const winner = 'Player 1';

		const { getByText } = render(<WinnerModal winner={winner} onClose={mockOnClose} />);

		// 勝者メッセージが正しく表示されていることを確認
		expect(getByText(`おめでとうございます、${winner}さんが勝ちました！`)).toBeInTheDocument();

		// 閉じるボタンをクリック
		fireEvent.click(getByText('閉じる'));

		// onCloseが正しく呼び出されたことを確認
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	/**
	 * 異常系:
	 * WinnerModalに無効な勝者情報が渡された場合の挙動を確認
	 */
	test('does not render winner message when winner prop is missing', () => {
		const { container } = render(<WinnerModal winner={null} onClose={mockOnClose} />);

		// 勝者メッセージが表示されていないことを確認
		expect(container).toBeEmptyDOMElement();
	});

	/**
	 * エッジケース:
	 * WinnerModalが複数の勝者を表示しないかを確認
	 */
	test('renders only one winner message even if multiple winners are provided', () => {
		const winner = 'Player 1, Player 2'; // 複数の勝者を仮定

		const { getAllByText } = render(<WinnerModal winner={winner} onClose={mockOnClose} />);

		// 勝者メッセージが1つだけ表示されていることを確認
		const messages = getAllByText(new RegExp(`おめでとうございます、${winner}さんが勝ちました！`, 'i'));
		expect(messages.length).toBe(1);
	});

	/**
	 * 異常系:
	 * 閉じるボタンが存在しない場合の挙動を確認
	 */
	test('does not render close button when onClose prop is missing', () => {
		const winner = 'Player 1';

		const { queryByText } = render(<WinnerModal winner={winner} />);

		// 閉じるボタンが表示されていないことを確認
		expect(queryByText('閉じる')).not.toBeInTheDocument();
	});

	/**
	 * エッジケース:
	 * 勝者が存在しない場合、WinnerModalが表示されないことを確認
	 */
	test('does not render when winner is undefined', () => {
		const { container } = render(<WinnerModal winner={undefined} onClose={mockOnClose} />);

		// コンポーネントが何もレンダリングしないことを確認
		expect(container).toBeEmptyDOMElement();
	});
});