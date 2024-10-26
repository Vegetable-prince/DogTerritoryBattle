// cypress.config.js
const { defineConfig } = require('cypress');
const codeCoverageTask = require('@cypress/code-coverage/task');

module.exports = defineConfig({
  projectId: 'n2v2ju',
  e2e: {
    baseUrl: 'http://localhost:3000', // フロントエンドのURL
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js', // サポートファイルのパス
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
    // その他の設定
  },
  // その他の設定
});
