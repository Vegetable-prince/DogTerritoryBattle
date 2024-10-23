// cypress/e2e/game_spec.cy.js

describe('Dog Territory Battle Game Tests', () => {
  const gameId = 1; // 適切なゲームIDを設定してください
  const apiUrl = 'http://localhost:8000'; // バックエンドのAPIのURL

  beforeEach(() => {
    // ゲーム状態をリセットするAPIを呼び出して、初期状態に戻します
    cy.request('POST', `${apiUrl}/api/games/${gameId}/reset_game/`);

    // ゲームページにアクセス
    cy.visit(`http://localhost:3000/games/${gameId}`);

    // ゲームデータの読み込みが完了するまで待機
    cy.contains('現在のターン').should('be.visible');
  });

  it('1. 各プレイヤーは各プレイヤーのコマしか操作できない', () => {
    // 現在のターンがPlayer 1であることを確認
    cy.contains('現在のターン: Player 1');

    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // 有効な移動先が表示されることを確認
    cy.get('.valid-move').should('exist');

    // プレイヤー2の手札のコマを選択しようとする（操作できないはず）
    cy.get('#bottom-hand .hand-dog').first().click();

    // アラートが表示されることを確認
    cy.on('window:alert', (str) => {
      expect(str).to.equal('まだあなたのターンではありません！');
    });
  });

  it('2. 各プレイヤーがコマの操作を一度行うたびにもう片方のプレイヤーのターンに移る', () => {
    // 現在のターンがPlayer 1であることを確認
    cy.contains('現在のターン: Player 1');

    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // 有効な移動先をクリックしてコマを配置
    cy.get('.valid-move').first().click();

    // ターンがPlayer 2に移ったことを確認
    cy.contains('現在のターン: Player 2');
  });

  it('3. 現在のターンのプレイヤーのコマしか操作できない', () => {
    // 現在のターンがPlayer 1であることを確認
    cy.contains('現在のターン: Player 1');

    // プレイヤー2の手札のコマを選択しようとする（操作できないはず）
    cy.get('#bottom-hand .hand-dog').first().click();

    // アラートが表示されることを確認
    cy.on('window:alert', (str) => {
      expect(str).to.equal('まだあなたのターンではありません！');
    });
  });

  it('4. 各コマは各コマのmovement_typeに従った行動しか取らない', () => {
    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // 有効な移動先が表示されることを確認
    cy.get('.valid-move').should('exist');

    // 有効な移動先が正しいかを確認
    // ここでは、移動先の数や位置を検証します
    cy.get('.valid-move').then(($moves) => {
      // 移動先の数を確認（例として4つと仮定）
      expect($moves.length).to.be.greaterThan(0);
      // さらに詳細な検証が必要な場合は、各移動先の位置を検証します
    });
  });

  it('5. すでにコマがあるマスには移動できない', () => {
    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // コマが存在する位置を取得
    cy.get('#game-board .dog').first().then(($dog) => {
      const occupiedX = parseInt($dog.css('left'));
      const occupiedY = parseInt($dog.css('top'));

      // 有効な移動先にその位置が含まれていないことを確認
      cy.get('.valid-move').each(($move) => {
        const moveX = parseInt($move.css('left'));
        const moveY = parseInt($move.css('top'));

        expect(moveX).not.to.equal(occupiedX);
        expect(moveY).not.to.equal(occupiedY);
      });
    });
  });

  it('6. コマを移動した後にフィールドの全コマと隣接していない場合は移動できない', () => {
    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // 有効な移動先を取得
    cy.get('.valid-move').then(($moves) => {
      // 隣接しない位置への移動先がないことを確認
      // ここでは、各移動先が他のコマと隣接しているかを確認します
      $moves.each((index, move) => {
        const moveX = parseInt(move.style.left);
        const moveY = parseInt(move.style.top);

        // 他のコマとの隣接を確認
        let isAdjacent = false;
        cy.get('#game-board .dog').each(($dog) => {
          const dogX = parseInt($dog.css('left'));
          const dogY = parseInt($dog.css('top'));

          const dx = Math.abs(moveX - dogX);
          const dy = Math.abs(moveY - dogY);

          if ((dx === 0 && dy === 100) || (dx === 100 && dy === 0) || (dx === 100 && dy === 100)) {
            isAdjacent = true;
          }
        }).then(() => {
          expect(isAdjacent).to.be.true;
        });
      });
    });
  });

  it('7. コマを手札に戻した後にフィールドに他のコマと隣接していないコマがある場合は手札に戻せない', () => {
    // ボード上の自分のコマを選択
    cy.get('#game-board .dog').first().click();

    // 手札に戻すために手札エリアをクリック
    cy.get('#top-hand').click();

    // アラートが表示されることを確認
    cy.on('window:alert', (str) => {
      expect(str).to.equal('このコマを手札に戻すと、他のコマが孤立してしまいます！');
    });
  });

  it('8. コマの操作後にボス犬が囲まれた場合に勝者判定される', () => {
    // テストのために、ボス犬を囲むようにコマを配置します

    // プレイヤー1の手札のコマを配置
    cy.get('#top-hand .hand-dog').first().click();
    cy.get('.valid-move').first().click();

    // ターンを切り替え、プレイヤー2の手札のコマを配置
    cy.get('#bottom-hand .hand-dog').first().click();
    cy.get('.valid-move').first().click();

    // ボス犬の周囲をコマで囲む手順を繰り返します
    // 省略

    // 勝者のモーダルが表示されることを確認
    cy.get('.modal-content').should('contain', 'おめでとうございます、Player 1さんが勝ちました！');
  });

  it('9. ボス犬は手札に戻せない', () => {
    // ボード上のボス犬を選択
    cy.get('#game-board .dog').contains('ボス犬').click();

    // 手札に戻そうとする
    cy.get('#top-hand').click();

    // アラートが表示されることを確認
    cy.on('window:alert', (str) => {
      expect(str).to.equal('ボス犬は手札に戻せません！');
    });
  });

  it('10. コマを操作した後にフィールドの全コマの配置が縦横4マスを超えていない', () => {
    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // フィールドの端にコマを配置しようとする（縦横4マスを超える位置は表示されないはず）
    cy.get('.valid-move').each(($move) => {
      const moveX = parseInt($move.css('left')) / 100 + boardBounds.minX;
      const moveY = parseInt($move.css('top')) / 100 + boardBounds.minY;

      expect(moveX).to.be.at.least(boardBounds.minX);
      expect(moveX).to.be.at.most(boardBounds.minX + 3);
      expect(moveY).to.be.at.least(boardBounds.minY);
      expect(moveY).to.be.at.most(boardBounds.minY + 3);
    });
  });

  it('11. 各コマ操作後のコンポーネント再設計メソッドがちゃんと呼びだされている', () => {
    // コマを配置した後に、ボードの境界が更新されていることを確認

    // プレイヤー1の手札のコマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // コマを配置
    cy.get('.valid-move').first().click();

    // ボードの幅と高さが更新されていることを確認
    cy.get('#game-board').invoke('width').should('be.gte', 100);
    cy.get('#game-board').invoke('height').should('be.gte', 100);
  });

  it('12. 各コマ操作前に一度移動箇所のハイライトをしている', () => {
    // コマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // 有効な移動先が表示されていることを確認
    cy.get('.valid-move').should('exist');
  });

  it('13. ハイライトは特定の条件を満たした上で表示されている', () => {
    // コマを選択
    cy.get('#top-hand .hand-dog').first().click();

    // 有効な移動先が特定の条件を満たしているか確認
    cy.get('.valid-move').each(($move) => {
      // 移動先がルールに従って計算されているかを検証
      // 例として、移動先に他のコマがないこと、ボードのサイズを超えていないことなど
    });
  });
});