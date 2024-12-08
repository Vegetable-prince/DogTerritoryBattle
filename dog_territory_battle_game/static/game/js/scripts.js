$(document).ready(function() {
  var selectedDog = null;

  // すべての駒にクリックイベントを追加
  $(".dog").on("click", function(event) {
      // イベントのバブルアップを停止
      event.stopPropagation();

      // 選択されている駒が同じ場合は選択を解除
      if (selectedDog && selectedDog.is($(this))) {
          selectedDog.css("background-color", "");
          selectedDog = null;
          $(".valid-move").remove();
          return;  // 処理を終了
      }

      // 他の駒が選択されている場合は背景色をリセット
      if (selectedDog) {
          selectedDog.css("background-color", "");
      }

      // 新しい駒を選択
      selectedDog = $(this);
      selectedDog.css("background-color", "yellow");
      highlightValidMoves(selectedDog);
  });

  // ハイライトされたマス以外をクリックした場合の処理
  $(document).on("click", function(event) {
    if (!$(event.target).hasClass("valid-move")) {
      // 駒が選択されている場合の処理
      if (selectedDog) {
        selectedDog.css("background-color", "");
        selectedDog = null;
        $(".valid-move").remove();
      }
    }
  });

  function highlightValidMoves(dog) {
      var x = dog.position().left / 100;
      var y = dog.position().top / 100;

      // 既存のハイライトを削除
      $(".valid-move").remove();

      // 縦横斜めの1マス移動をチェック
      var possibleMoves = [
          {dx: 0, dy: -1},  // 上
          {dx: 0, dy: 1},   // 下
          {dx: -1, dy: 0},  // 左
          {dx: 1, dy: 0},   // 右
          {dx: -1, dy: -1}, // 左上
          {dx: 1, dy: -1},  // 右上
          {dx: -1, dy: 1},  // 左下
          {dx: 1, dy: 1}    // 右下
      ];

      possibleMoves.forEach(function(move) {
          var newX = x + move.dx;
          var newY = y + move.dy;

          if (isValidMove(newX, newY)) {
              $("#game-board").append('<div class="valid-move" style="left: ' + (newX * 100) + 'px; top: ' + (newY * 100) + 'px;"></div>');
          }
      });

      // 移動先のマスをクリックした場合のイベントを追加
      $(".valid-move").one("click", function() { // .oneに変更してイベントが一度だけトリガーされるようにする
          var newX = $(this).position().left / 100;
          var newY = $(this).position().top / 100;
          moveDog(selectedDog.data("dog-id"), newX, newY);
      });
  }

  function isValidMove(x, y) {
      if (x < 0 || x > 4 || y < 0 || y > 4) {
          return false;
      }

      var futurePositions = $(".dog").map(function() {
          var dogX = $(this).position().left / 100;
          var dogY = $(this).position().top / 100;
          if ($(this).data("dog-id") == selectedDog.data("dog-id")) {
              dogX = x;
              dogY = y;
          }
          return {x: dogX, y: dogY};
      }).get();

      var maxX = Math.max.apply(Math, futurePositions.map(function(pos) { return pos.x; }));
      var minX = Math.min.apply(Math, futurePositions.map(function(pos) { return pos.x; }));
      var maxY = Math.max.apply(Math, futurePositions.map(function(pos) { return pos.y; }));
      var minY = Math.min.apply(Math, futurePositions.map(function(pos) { return pos.y; }));

      if (maxX - minX >= 4 || maxY - minY >= 4) {
          return false;
      }

      return true;
  }

  function moveDog(dog_id, x, y) {
      $.ajax({
          url: moveDogUrl,
          method: "POST",
          data: {
              dog_id: dog_id,
              x: x,
              y: y,
              csrfmiddlewaretoken: csrf_token
          },
          success: function(response) {
              if (response.success) {
                  console.log("Move successful");
                  selectedDog.css({left: x * 100, top: y * 100});
                  selectedDog.css("background-color", "");
                  selectedDog = null;
                  $(".valid-move").remove();
                  updateFieldBoundary();
              } else {
                  console.log("Move failed: " + response.error);
              }
          },
          error: function(xhr, status, error) {
              console.log("Move failed: " + error);
          }
      });
  }

  function updateFieldBoundary() {
      var minX = 4, maxX = 0, minY = 4, maxY = 0;
      $(".dog").each(function() {
          var x = $(this).position().left / 100;
          var y = $(this).position().top / 100;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
      });

      var verticalBoundaryVisible = (maxX - minX + 1) >= 4;
      var horizontalBoundaryVisible = (maxY - minY + 1) >= 4;

      $(".vertical-boundary").remove();
      $(".horizontal-boundary").remove();

      if (verticalBoundaryVisible) {
          $("#game-board").append('<div class="vertical-boundary" style="left: ' + (minX * 100) + 'px; top: 0; height: 400px;"></div>');
          $("#game-board").append('<div class="vertical-boundary" style="left: ' + (maxX * 100 + 100) + 'px; top: 0; height: 400px;"></div>');
      }

      if (horizontalBoundaryVisible) {
          $("#game-board").append('<div class="horizontal-boundary" style="top: ' + (minY * 100) + 'px; left: 0; width: 400px;"></div>');
          $("#game-board").append('<div class="horizontal-boundary" style="top: ' + (maxY * 100 + 100) + 'px; left: 0; width: 400px;"></div>');
      }
  }

  updateFieldBoundary();
});