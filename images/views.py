from django.shortcuts import render
from django.http import HttpResponse

from images.models import MyModel
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect

def index(request):
    return render(request, 'images/index.html')


def create(request):
    print('creating ...')
    name = request.POST.get('name', '')
    tag = request.POST.get('tag', '')
    image = request.POST.get('image', '')
    print(name, tag)

    mymodel = MyModel.objects.create(upload=image, name=name, tag=tag)
    return JsonResponse({'data': {'id': mymodel.id} })


def delete(request, id):
    print('delteing ...')
    image = get_object_or_404(MyModel, id=id)
    image.delete()
    print(id)
    return JsonResponse({'data': {'name': id} })

def update(request, id):
    image = get_object_or_404(MyModel, id=id)
    print('updating ...')
    name = request.POST.get('name', '')
    tag = request.POST.get('tag', '')
    image.name = name
    image.tag = tag
    image.save()
    return JsonResponse({'data': {'name': image.name} })