import { render, screen } from '@testing-library/react';
import App from './App';
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
  expect(linkElement).toHaveAttribute('href', '/games/1');
});
