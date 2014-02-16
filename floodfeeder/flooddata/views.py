from django.http import Http404, HttpResponse
from django.shortcuts import render
from django.views.generic import TemplateView
import json
import shoothill_api

class FloodAPIView(TemplateView):
    lat = None
    lon = None
    radius = None

    def dispatch(self, request, *args, **kwargs):
        if 'lat' in request.GET and 'lon' in request.GET:
            self.lat = request.GET.get('lat')
            self.lon = request.GET.get('lon')
            self.radius = str(request.GET.get('radius', 50.0)) # default
        else:
            raise Http404("You must pass a lat and lon parameter to query our data. radius is optional")

        self.data = shoothill_api.getJsonData(self.lat, self.lon, self.radius)
        return super(FloodAPIView, self).dispatch(request, *args, **kwargs)

    def render_to_response(self, context, **kwargs):
        object = [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-0.515525, 51.431480]
            },
            "properties": {
                "title" : "Geo feature 123",
                "html" : "<p>Here is some stuff.</p>"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-0.515535, 51.441880]
            },
            "properties": {
                "title" : "Geo feature 456",
                "html" : "<p>Here is some other stuff.</p>"
            }
        }];
        object = self.data
        data = json.dumps(object)
        kwargs['content_type'] = 'application/json'
        return HttpResponse(data, **kwargs)

