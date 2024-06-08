import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dogTerritoryBattle.settings')
django.setup()

from game.models import Dog

# サンプルデータ
dogs_data = [
    {"name": "Bulldog", "movement": "Slow"},
    {"name": "Greyhound", "movement": "Fast"},
    {"name": "Beagle", "movement": "Medium"},
]

for dog_data in dogs_data:
    Dog.objects.create(**dog_data)

print("Sample dogs data added successfully!")