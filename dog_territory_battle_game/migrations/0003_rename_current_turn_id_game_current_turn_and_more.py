# Generated by Django 5.0.6 on 2024-06-18 07:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        (
            "dog_territory_battle_game",
            "0002_rename_current_turn_game_current_turn_id_and_more",
        ),
    ]

    operations = [
        migrations.RenameField(
            model_name="game",
            old_name="current_turn_id",
            new_name="current_turn",
        ),
        migrations.RenameField(
            model_name="game",
            old_name="winner_id",
            new_name="winner",
        ),
    ]
