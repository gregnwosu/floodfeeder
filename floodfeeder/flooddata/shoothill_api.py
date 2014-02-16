
import requests
import simplejson as json

#lat=51.431480&lon=-0.515525&radius=50

import simplejson as json

def getJsonData(lat , lon , radius):
    payload = {'latitude': lat, 'longitude': lon, 'radius':radius}
    r = requests.get("http://dbec32afb59243e0a83d0216b56eccce.cloudapp.net/api/proximityfloodalerts", params=payload)
    return r.json()




if __name__ == "__main__":
    print getJsonData(51.431480,-0.515525,50)

