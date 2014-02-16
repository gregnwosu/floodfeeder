from django.shortcuts import render
from django.views.generic import DetailView

class FloodDataView(DetailView):
    def dispatch(self, request, *args, **kwargs):
        return super(FloodDataView, self).dispatch(request, *args, **kwargs)    
