
import requests
import simplejson as json

#lat=51.431480&lon=-0.515525&radius=50

import simplejson as json

def getJsonData(lat , lon , radius):
    payload = {'latitude': lat, 'longitude': lon, 'radius':radius}
    r = requests.get("http://dbec32afb59243e0a83d0216b56eccce.cloudapp.net/api/proximityfloodalerts", params=payload)
    rdict =  r.json()
    return parseDict(rdict)

def makeDict(fa):
    
    ad = fa['FloodAlert']['AreaDescription']
    lat = fa['FloodAlert']['Center']['Latitude']
    lon = fa['FloodAlert']['Center']['Longitude']
    alt = fa['FloodAlert']['Center']['Altitude']
    msg = fa['FloodAlert']['MessageEnglish']
    return { "type": "Feature",
  "geometry": {
    "type": "Point",
      "coordinates": [lon, lat, alt]
   },
  "properties": {
    "title": ad,
    "html": "<p>"+msg+"</p>"
  }
}

    


def parseDict(d):
    return map (makeDict, d['ProximityFloodAlerts'])


if __name__ == "__main__":
    print getJsonData('51.431480','-0.515525',50)

