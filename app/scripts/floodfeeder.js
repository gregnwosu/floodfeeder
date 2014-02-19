/*
	Flood Feeder - main script
*/

var Feeder = {

  mapConfig: {
    projections:{}
  },

  map:{},

  feeds: [],

  init: function(){
    var app = this;

    app.createFeedList();
    app.setupMap();
    app.bindInteraction();
    app.geocoder = new google.maps.Geocoder();

  },

  setupMap: function(){
    var app = this;

    app.mapConfig.width = $('#map').width();
    app.mapConfig.height = $('#map').height();   

    // set up the map
    app.map = new L.Map('map');

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © OpenStreetMap contributors';
    var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 20, attribution: osmAttrib});   

    // start the map in South-East England
    app.map.setView(new L.LatLng(52.01193653675363, -0.3240966796875), 7);
    app.map.addLayer(osm);

  },

  getFeed: function(id){



  },

  bindInteraction: function(){

    var app = this, map = app.map;

    $('#data-layers ul li:not(".category")').click(function(e){
    	
    	e.preventDefault();

    	var checkbox = $(this).find('input[type="checkbox"]');
     	var id = checkbox.attr('id');

     	if(checkbox.is(':checked')){
     		checkbox.prop('checked', false);
     	} else {
     		checkbox.prop('checked', true);
     	}	

     	app.toggleFeed(id);
      
/*
      if($(this).is(':checked')){
        // on 
        if(id === 'warnings' || $(this).attr('id') === 'alerts'){

          var loc = map.getCenter();

          var params = {
            url: app.data.warningsURL,
            data:{
              lat: loc.lat,
              lon: loc.lng,
              radius: 50
            },
            success: function(data){
              app.addPointsToMap(data);
            },
            error: function(){
              console.warn("Unable to retrieve "+$(this).attr('id')+" data, using dummy data");
              app.addPointsToMap(app.data.dummyWarnings);
            }
          };

          app.requestData(params);

        } else if($(this).attr('id') === 'countries'){
          app.showGeography('countries');
        } else if($(this).attr('id') === 'wards'){
          app.showGeography('wards');
        } else if($(this).attr('id') === 'mobilephonemasts'){
          app.showCellPhoneMasts();
          app.addPointsToMap(app.data.mobilephonemasts)
        }

      } else {
        // off
        
        if(false){

        } else if($(this).attr('id') === 'countries'){
          $('#map').find('svg').remove();
        } else if($(this).attr('id') === 'wards'){
          $('#map').find('svg').remove();
        }

      }
      */
    });

    $('#search').keypress(function(e) {
      if(e.which == 13) {
          e.preventDefault();
          app.focusOnLocation($(this).val());
      }
    });

    $('.countries').on('click', function(){
      console.log("clicked country");
    });

    $('.btn-default').click(function(){
        window.location.href = 'http://floodfeeder.cluefulmedia.com/subunits.json';
    });
    $('.btn-primary').click(function(){
        window.location.href = 'http://floodfeeder.cluefulmedia.com/uk.json';
    });


  },

  toggleFeed: function(id){

    var app = this, 
    map = app.map;

    if(!app.feeds[id])
    	app.feeds[id] = {};

    if(!app.feeds[id].loaded){              // If the feed isn't loaded, load it

      // load the feed
      app.getFeed(id, function(data){
      	
      	app.feeds[id].data = data;
      	app.feeds[id].loaded = true;
      	
      	// add it to map
     	app.showFeedOnMap(id);

      }, function(){						// if error retrieving, try to use dummy data

      	var category = $('#'+id).data('category');

      	if(app.data[category][id].dummy){
      		
      		app.feeds[id].data = app.data[category][id].dummy;
      		app.feeds[id].loaded = true;
      		
      		// add it to map
      		app.showFeedOnMap(id);
      	
      	} else {
      		app.feeds[id].data = [];
      		console.error("Couldn't load feed: "+id);
      	}
      });
    
    } else if(!app.feeds[id].isVisible){    // Else, if the feed is not visible on the map, show it 
      // show feed on map
      app.showFeedOnMap(id);
      app.feeds[id].isVisible = true;
    } else {                                // Else, hide it
      // hide feed from map
      app.hideFeedOnMap(id);
      app.feeds[id].isVisible = false;
    }

  },


  getFeed: function(id, success, error){

    var app = this, map = app.map;

    var params = app.buildParams(id);

    $.ajax({
      type:'get',
      url: params.url,
      data: params.data,
      success: success,
      error: error
    });


  /*
    $.getJSON(app.data.warningsURL+'?lat='+params.lat+"&lon="+params.lon+"&radius=50", function(data){
      
      console.log(data);

      if(!data || data.length === 0){
        data = app.data.dummyWarnings;
        console.warn("Using dummy warnings data");
      }
      
      app.markerData = data;

      L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup("<strong>"+feature.properties.title+"</strong><br />"+feature.properties.description);
        }
      }).addTo(map);

    }, function(data){
      console.log('error?', data);
    });
  */

  },

  buildParams: function(id){

	var app = this, map = app.map;
	var loc = map.getCenter();

   	var category = $('#'+id).data('category');

	var params = {
		url: app.data[category][id].url,
		data: ''
	};

	switch(id){
		case 'warnings':
		    params.data = {
		        lat: loc.lat,
		        lon: loc.lng,
		        radius: 50
		    };
		  break;
		case 'alerts' : 
		    params.data = {
		        lat: loc.lat,
		        lon: loc.lng,
		        radius: 50
		    };
		  break;
		case 'countries' : 

		  break;
		case 'wards' :

		  break;
		case 'mobilephonemasts' :

		  break;
		default:
	  		console.error(id+": can't build params");
	  		break;
	}

	return params;
  },

  showFeedOnMap: function(id){



  },

  hideFeedFromMap: function(id){



  },

  addPointsToMap: function(data){

    var app = this, map = app.map;

    L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup("<strong>"+feature.properties.title+"</strong><br />"+feature.properties.description);
        }
    }).addTo(map);

  },
/*
  showCellPhoneMasts: function(){

    var app = this, map = app.map;

    // TODO: remove dummy data, use real data
    var littleton = L.marker([51.46598592502469,-0.5791854858398438]).bindPopup('O2 Mast 21312'),
      denver    = L.marker([51.516007082492614, -0.5029678344726562]).bindPopup('Orange Mast DD21'),
      aurora    = L.marker([51.47197425351888, -0.36289215087890625]).bindPopup('EE Mast AS0D2'),
      golden    = L.marker([51.45999681055089, -0.5469131469726562]).bindPopup('Orange Mast OR213');

    var masts = L.layerGroup([littleton, denver, aurora, golden]).addTo(map);

    L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup("<strong>"+feature.properties.title+"</strong><br />"+feature.properties.description);
        }
    }).addTo(map);

  },
*/
  showGeography: function(type){

    var app = this, map = app.map;

    app.svg = d3.select(map.getPanes().overlayPane).append("svg"),
    app.g = app.svg.append("g").attr("class", "leaflet-zoom-hide");

   if(type === "wards"){

      if(!app.subunits){
        d3.json("subunits.json", function(error, subunits) {

        app.subunits = subunits;
        app.bounds = d3.geo.bounds(subunits.features);
        app.path = d3.geo.path().projection(project);

        app.feature = app.g.selectAll("path")
              .data(subunits.features)
            .enter().append("path")
            .attr("class", "path subunits")
            .attr("d", app.path);

          map.on("viewreset", app.resetMap);
          reset();
        });
      } else {
          app.bounds = d3.geo.bounds(app.subunits.features);
          app.path = d3.geo.path().projection(project);

          app.feature = app.g.selectAll("path")
                .data(app.subunits.features)
              .enter().append("path")
              .attr("class", "path subunits")
              .attr("d", app.path);

            map.on("viewreset", app.resetMap);
            reset();

      }  

    } else if(type === "countries"){
      if(!app.uk){
        d3.json("uk.json", function(error, uk) {

        app.uk = uk;
        app.bounds = d3.geo.bounds(topojson.feature(uk, uk.objects.subunits));
        app.path = d3.geo.path().projection(project);

        app.feature = app.g.selectAll("path")
              .data(topojson.feature(uk, uk.objects.subunits).features)
            .enter().append("path")
            .attr("class", "path countries")
            .attr("d", app.path);

          map.on("viewreset", app.resetMap);
          reset();
        });
      } else {
          app.bounds = d3.geo.bounds(topojson.feature(app.uk, app.uk.objects.subunits));
          app.path = d3.geo.path().projection(project);

          app.feature = app.g.selectAll("path")
                .data(topojson.feature(app.uk, app.uk.objects.subunits).features)
              .enter().append("path")
              .attr("class", "path countries")
              .attr("d", app.path);

          map.on("viewreset", app.resetMap);
          reset();

      }
    }

  },


  /*
    Sets map view based on string location e.g. "London" or "staines"
  */
  focusOnLocation: function(string){

    var app = this, map = app.map, geocoder = app.geocoder;

    string = string.replace(/ /g,'+');

    if (geocoder) {
        geocoder.geocode({ 'address': string+", United+Kingdom" }, function (results, status) {
           if (status == google.maps.GeocoderStatus.OK) {
              //console.log(results[0].geometry.location);
              if(results.length > 0 && results[0].geometry && results[0].geometry.location){
                var latlong = L.latLng(results[0].geometry.location.d, results[0].geometry.location.e);
                map.setView(latlong, 11);
              }
           }
           else {
              console.log("Geocoding failed: " + status);
           }
        });
     }

    //$.get('https://maps.googleapis.com/maps/api/geocode/json?address=122+Flinders+St,+Darlinghurst,+NSW,+Australia&sensor=false&key=AIzaSyBKeLEYFHnhkhEl9gzt7fycrhvdK6Yp7l8')
    //$.get('http://maps.googleapis.com/maps/api/geocode/json?address=Staines,+United+Kingdom&sensor=false');
    /*
    $.get('http://maps.googleapis.com/maps/api/geocode/json?address='+string+',+United+Kingdom&sensor=false', function(data){
      if(data && data.geometry && data.geomtery.location){
        var latlong = L.latLng(data.geomtery.location.lat, data.geomtery.location.lng);
        map.setView(latlong);
      }
    })*/

	},

	addDataToMap: function(){
	var app = this, map = app.map;

	},

	constructGeoJSON: function(rows){

	var app = this, map = app.map;
	var markers = [];

	app.data.geoJson = {
	  type: 'FeatureCollection',
	  features: []
	};

	for (var i = rows.length - 1; i >= 0; i--) {
	  
	  var row = rows[i];
	  //console.log(row);

	    var marker = {
	        // this feature is in the GeoJSON format: see geojson.org
	        // for the full specification
	        type: 'Feature',
	        geometry: {
	            type: 'Point',
	            // coordinates here are in longitude, latitude order because
	            // x, y is the standard for GeoJSON and many formats
	            coordinates: [parseFloat(row["Longitude"]), parseFloat(row["Latitude"])]
	        },
	        properties: {
	            title: '',
	            description: ''
	            // one can customize markers by adding simplestyle properties
	            // http://mapbox.com/developers/simplestyle/
	            // 'marker-size': 'small'
	        }
	    };

	    app.data.geoJson.features.push(marker);

	};

	L.geoJson(app.data.geoJson, {
	    onEachFeature: function (feature, layer) {
	        //layer.bindPopup("<b>"+feature.properties.title+"</b><br />"+feature.properties.description);
	    }
	}).addTo(app.map);

	//map.markerLayer.setGeoJSON(app.data.geoJson);
	/*map.markerLayer.on('mouseover', function(e) {
	    e.layer.openPopup();
	});
	map.markerLayer.on('mouseout', function(e) {
	    e.layer.closePopup();
	});*/ 

	//console.log(app.data.geoJson);

	},

	// Reposition the SVG to cover the features.
	resetMap: function() {
		var app = this, map = app.map;

		var bottomLeft = app.project(app.bounds[0]), 
		topRight = app.project(app.bounds[1]);

		app.svg.attr("width", topRight[0] - bottomLeft[0])
		  .attr("height", bottomLeft[1] - topRight[1])
		  .style("margin-left", bottomLeft[0] + "px")
		  .style("margin-top", topRight[1] + "px");

		app.g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

		app.feature.attr("d", app.path);
	},

	// Use Leaflet to implement a D3 geographic projection.
	project: function(x) {
		var app = this, map = app.map;
	  	var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
	  	return [point.x, point.y];
	},

	createFeedList: function(){

		var app = this;

		$.each(app.data, function(category, feeds){
			var ul = $('<ul class="nav nav-sidebar" />');

			var icon = '';

			if(category === "Geography"){
				icon = 'fa-globe';
			}

			ul.append($('<li class="category" />').append($('<h3 />').text(category)));

			$.each(feeds, function(feed, config){

				console.log(config.type);

				switch(config.type){
					case 'point' : 
						icon = 'fa-map-marker';
						break;
					case 'shapes' : 
						//icon = 'fa-tint';
						break;
					case 'tabular' : 
						icon = 'fa-th-list';
						break;
				}

				ul.append($('<li />').text(config.label).append($('<input />').attr('id', feed).attr('type', 'checkbox').attr('data-category', category)).append($('<i />').attr('class', 'fa fa-lg fa-fw '+icon)));
			});

			$('#data-layers').append(ul);
		});

	},

	data:{
		'Geography': {
			'countries':{
				url: 'uk.json',
				label: 'Countries'
			},
			'wards':{
				url: 'subunits.json',
				label: 'Wards'
			}
		},
		'Floods': {
			'warnings':{
				url:'http://floodfeeder.cluefulmedia.com/api/floods/',
				label: 'Flood warnings',
				type: 'point',
				dummy:[{"geometry":{"type":"Point","coordinates":[-0.5195557785325841,51.42974919545905,0]},"type":"Feature","properties":{"description":"<p>The River and Flooding forecast is as follows: River levels on the Thames in the Staines area are now slowly rising again in response to the rain that fell on Friday. River levels are currently expected to stop rising overnight on Tuesday and will be lower than the high levels we have seen in the last week and those seen in January 2003. The Environment Agency's incident room is currently open 24 hours a day  and we are monitoring the situation closely. Residents however, should remain vigilant.  If you believe you are in immediate danger call 999. The weather prospects are for a clear, dry evening with patchy showers expected to develop overnight and through Monday.</p>","title":"River Thames at Staines and Egham"}},{"geometry":{"type":"Point","coordinates":[-0.5442061744301574,51.44118820174332,0]},"type":"Feature","properties":{"description":"<p>The river and flooding forecast is as follows: River levels in the Datchet to Shepperton Green areas remain high but are slowly falling, however persistent showers forecast over Monday mean levels may rise again. Flooding of low lying land and roads are still possible. Severe Flood Warnings are in force for the area as widespread property flooding is still expected. The weather prospects are to expect a dry day on Sunday with showers forecast from Monday morning that will continue throughout the day.</p>","title":"River Thames from Datchet to Shepperton Green"}},{"geometry":{"type":"Point","coordinates":[-0.521536889996408,51.42530011905948,0]},"type":"Feature","properties":{"description":"<p>Groundwater levels in Egham are continuing to rise. Groundwater levels are expected to continue to rise over the next couple of days and we could see flooding in some areas. Further rain is forecast over the next few days and this could cause levels to remain high. Levels are expected to remain high for several weeks and impacts are expected to be similar to the flooding during the winter 2000/01. This message will be updated on Wednesday 19 February 2014.</p>","title":"Groundwater flooding in Egham"}}]
			},
			'alerts':{
				url:'http://floodfeeder.cluefulmedia.com/api/floods/',
				label: 'Flood alerts',
				type: 'point',
				dummy:[{"geometry":{"type":"Point","coordinates":[-0.52987576,51.44907892,0]},"type":"Feature","properties":{"description":"<p>The River and Flooding forecast is as follows: River levels on the Thames in the Staines area are now slowly rising again in response to the rain that fell on Friday. River levels are currently expected to stop rising overnight on Tuesday and will be lower than the high levels we have seen in the last week and those seen in January 2003. The Environment Agency's incident room is currently open 24 hours a day  and we are monitoring the situation closely. Residents however, should remain vigilant.  If you believe you are in immediate danger call 999. The weather prospects are for a clear, dry evening with patchy showers expected to develop overnight and through Monday.</p>","title":"River Thames at Staines and Egham"}},{"geometry":{"type":"Point","coordinates":[-0.5498972,51.46202948,0]},"type":"Feature","properties":{"description":"<p>The river and flooding forecast is as follows: River levels in the Datchet to Shepperton Green areas remain high but are slowly falling, however persistent showers forecast over Monday mean levels may rise again. Flooding of low lying land and roads are still possible. Severe Flood Warnings are in force for the area as widespread property flooding is still expected. The weather prospects are to expect a dry day on Sunday with showers forecast from Monday morning that will continue throughout the day.</p>","title":"River Thames from Datchet to Shepperton Green"}},{"geometry":{"type":"Point","coordinates":[-0.5378292,51.456789876,0]},"type":"Feature","properties":{"description":"<p>Groundwater levels in Egham are continuing to rise. Groundwater levels are expected to continue to rise over the next couple of days and we could see flooding in some areas. Further rain is forecast over the next few days and this could cause levels to remain high. Levels are expected to remain high for several weeks and impacts are expected to be similar to the flooding during the winter 2000/01. This message will be updated on Wednesday 19 February 2014.</p>","title":"Groundwater flooding in Egham"}}]
			}
		},
		'Infrastructure': {
			'mobilephonemasts':{
				url:'',
				label: 'Mobile phone masts',
				type: 'point',
				dummy:[{"geometry":{"type":"Point","coordinates":[51.46598592502469,-0.5791854858398438,0]},"type":"Feature","properties":{"description":"","title":"O2 Mast 21312"}},{"geometry":{"type":"Point","coordinates":[51.516007082492614, -0.5029678344726562,0]},"type":"Feature","properties":{"description":"","title":"Orange Mast DD21"}},{"geometry":{"type":"Point","coordinates":[51.47197425351888, -0.36289215087890625,0]},"type":"Feature","properties":{"description":"","title":"EE Mast AS0D2"}},{"geometry":{"type":"Point","coordinates":[51.45999681055089, -0.5469131469726562,0]},"type":"Feature","properties":{"description":"","title":"Orange Mast OR213"}}]
			}
		}
	}

};

(function(){
  Feeder.init();
}());
