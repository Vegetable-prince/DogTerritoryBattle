$(document).ready(function() {
  $(".dog").draggable({
      grid: [100, 100],
      stop: function(event, ui) {
          var dog_id = $(this).data("dog-id");
          var x = ui.position.left / 100;
          var y = ui.position.top / 100;
          $.ajax({
              url: "{% url 'move_dog' game.id %}",
              method: "POST",
              data: {
                  dog_id: dog_id,
                  x: x,
                  y: y,
                  csrfmiddlewaretoken: '{{ csrf_token }}'
              },
              success: function(response) {
                  if (response.success) {
                      console.log("Move successful");
                  } else {
                      console.log("Move failed: " + response.error);
                  }
              }
          });
      }
  });
});