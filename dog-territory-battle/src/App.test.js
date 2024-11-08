// tests/components/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App'; // パスを適切に変更
import '@testing-library/jest-dom';

test('renders Dog Territory Battle heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Dog Territory Battle/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders ゲームへ link', () => {
  render(<App />);
  const linkElement = screen.getByText(/ゲームへ/i);
  expect(linkElement).toBeInTheDocument();
  expect(linkElement).toHaveAttribute('href', '/games/1'); // URLを適宜調整
});