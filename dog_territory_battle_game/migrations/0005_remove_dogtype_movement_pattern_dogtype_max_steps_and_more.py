# Generated by Django 5.0.6 on 2024-08-04 06:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "dog_territory_battle_game",
            "0004_dog_is_in_hand_alter_dog_x_position_and_more",
        ),
    ]

    operations = [
        migrations.RemoveField(
            model_name="dogtype",
            name="movement_pattern",
        ),
        migrations.AddField(
            model_name="dogtype",
            name="max_steps",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="dogtype",
            name="movement_type",
            field=models.CharField(default="orthogonal", max_length=50),
            preserve_default=False,
        ),
    ]
