describe('ゲームの基本機能テスト', () => {
  it('アプリのトップページが正しく表示されること', () => {
    cy.visit('http://localhost:3000');
    cy.contains('ゲームタイトル'); // 実際のタイトルに置き換えてください
  });

  it('コマを配置できること', () => {
    // 手札のコマをクリック
    cy.get('.hand-dog').first().click();

    // 有効な移動先をクリック
    cy.get('.valid-move').first().click();

    // ボード上にコマが配置されていることを確認
    cy.get('.dog').should('have.length', 1);
  });
});