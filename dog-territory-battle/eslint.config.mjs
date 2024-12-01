import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  { languageOptions: { globals: globals.browser } }, // 既存の環境設定
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node, // Node.jsのグローバル変数 (例: `module`, `require`, `process` など)
        ...globals.jest, // Jestのグローバル変数 (例: `describe`, `test`, `expect` など)
        ...globals.cypress // Cypressのグローバル変数 (例: `cy`, `Cypress` など)
      }
    },
    rules: {
      // 必要に応じてルールを追加・変更
      'semi': ['error', 'always'], // セミコロンを必須にする
      'quotes': ['error', 'single'], // シングルクォートを使用
      'indent': ['error', 2], // インデントはスペース2個
      'react/react-in-jsx-scope': 'off', // React 17以降でJSXにReactのインポートが不要な場合
      'no-unused-vars': 'warn', // 未使用の変数を警告
      'eqeqeq': 'error', // 厳密等価演算子を強制
      'curly': 'error', // if, else などで波括弧を必須に
      'no-console': 'warn', // console.logの使用を警告
      'react/prop-types': 'off' // PropTypesを使わない場合
    },
    settings: {
      react: {
        version: 'detect' // インストールされているReactのバージョンを自動検出
      }
    }
  },
  {
    ignores: ['build/**', 'node_modules/**', 'cypress/**'] // 無視対象ディレクトリ
  }
];