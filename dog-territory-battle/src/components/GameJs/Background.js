import React from 'react';
import '../../css/GameCss/Background.css';

/**
 * 画面全体に背景画像を敷き、子要素をラップするコンポーネント
 */
const Background = ({ children }) => {
  return <div className="background-container">{children}</div>;
};

export default Background;