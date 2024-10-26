from django.db import models
from django.contrib.auth.models import User

class Meta:
    app_label = 'dog_territory_battle_game'

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

class Player(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.user.username

class DogType(TimeStampedModel):
    name = models.CharField(max_length=100)
    movement_type = models.CharField(max_length=50)
    max_steps = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return self.name

class Game(TimeStampedModel):
    player1 = models.ForeignKey(Player, related_name='player1_games', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name='player2_games', on_delete=models.CASCADE)
    current_turn = models.ForeignKey(Player, related_name='current_turn_games', on_delete=models.CASCADE)
    winner = models.ForeignKey(Player, related_name='won_games', null=True, blank=True, on_delete=models.SET_NULL)
    
    def __str__(self):
        return f"Game between {self.player1} and {self.player2}"

class Dog(TimeStampedModel):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    dog_type = models.ForeignKey(DogType, on_delete=models.CASCADE)
    x_position = models.IntegerField(null=True, blank=True)
    y_position = models.IntegerField(null=True, blank=True)
    is_in_hand = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.dog_type.name} at ({self.x_position}, {self.y_position})" if not self.is_in_hand else f"{self.dog_type.name} in hand"
