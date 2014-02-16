from django.conf.urls import patterns, include, url
from django.views.generic import DetailView, ListView, CreateView, UpdateView
from django.contrib.auth import views
from .views import FloodAPIView

urlpatterns = patterns('flooddata.views',
    url(r'^floods$',
        FloodAPIView.as_view(
            template_name='stub.html'
        ),
        name='flood_api'
    )
)
