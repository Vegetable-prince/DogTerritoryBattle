from django.shortcuts import render
from .models import Dog

def index(request):
    dogs = Dog.objects.all()
    return render(request, 'game/index.html', {'dogs': dogs})
