/*
	Flood Feeder - main script
*/

var Feeder = {

	mapConfig: {
		projections:{}
	},

	map:{},

	feedConfigs:{
		"Geography": {
			"countries":{
				"url": 'countries.json',
				"label": 'Countries',
				"type": "geography"
			},
			"wards":{
				"url": 'subunits.json',
				"label": 'Wards',
				"type": "geography"
			}
		},
		"Floods": {
			"warnings":{
				"url":'http://floodfeeder.cluefulmedia.com/api/floods/',
				"label": 'Flood warnings',
				"type": 'points',
				"dummy":[{"geometry":{"type":"Point","coordinates":[-0.5195557785325841,51.42974919545905,0]},"type":"Feature","properties":{"description":"<p>The River and Flooding forecast is as follows: River levels on the Thames in the Staines area are now slowly rising again in response to the rain that fell on Friday. River levels are currently expected to stop rising overnight on Tuesday and will be lower than the high levels we have seen in the last week and those seen in January 2003. The Environment Agency's incident room is currently open 24 hours a day  and we are monitoring the situation closely. Residents however, should remain vigilant.  If you believe you are in immediate danger call 999. The weather prospects are for a clear, dry evening with patchy showers expected to develop overnight and through Monday.</p>","title":"River Thames at Staines and Egham"}},{"geometry":{"type":"Point","coordinates":[-0.5442061744301574,51.44118820174332,0]},"type":"Feature","properties":{"description":"<p>The river and flooding forecast is as follows: River levels in the Datchet to Shepperton Green areas remain high but are slowly falling, however persistent showers forecast over Monday mean levels may rise again. Flooding of low lying land and roads are still possible. Severe Flood Warnings are in force for the area as widespread property flooding is still expected. The weather prospects are to expect a dry day on Sunday with showers forecast from Monday morning that will continue throughout the day.</p>","title":"River Thames from Datchet to Shepperton Green"}},{"geometry":{"type":"Point","coordinates":[-0.521536889996408,51.42530011905948,0]},"type":"Feature","properties":{"description":"<p>Groundwater levels in Egham are continuing to rise. Groundwater levels are expected to continue to rise over the next couple of days and we could see flooding in some areas. Further rain is forecast over the next few days and this could cause levels to remain high. Levels are expected to remain high for several weeks and impacts are expected to be similar to the flooding during the winter 2000/01. This message will be updated on Wednesday 19 February 2014.</p>","title":"Groundwater flooding in Egham"}}]
			},
			"alerts":{
				"url":'http://floodfeeder.cluefulmedia.com/api/floods/',
				"label": 'Flood alerts',
				"type": 'points',
				"dummy":[{"geometry":{"type":"Point","coordinates":[-0.52987576,51.44907892,0]},"type":"Feature","properties":{"description":"<p>The River and Flooding forecast is as follows: River levels on the Thames in the Staines area are now slowly rising again in response to the rain that fell on Friday. River levels are currently expected to stop rising overnight on Tuesday and will be lower than the high levels we have seen in the last week and those seen in January 2003. The Environment Agency's incident room is currently open 24 hours a day  and we are monitoring the situation closely. Residents however, should remain vigilant.  If you believe you are in immediate danger call 999. The weather prospects are for a clear, dry evening with patchy showers expected to develop overnight and through Monday.</p>","title":"River Thames at Staines and Egham"}},{"geometry":{"type":"Point","coordinates":[-0.5498972,51.46202948,0]},"type":"Feature","properties":{"description":"<p>The river and flooding forecast is as follows: River levels in the Datchet to Shepperton Green areas remain high but are slowly falling, however persistent showers forecast over Monday mean levels may rise again. Flooding of low lying land and roads are still possible. Severe Flood Warnings are in force for the area as widespread property flooding is still expected. The weather prospects are to expect a dry day on Sunday with showers forecast from Monday morning that will continue throughout the day.</p>","title":"River Thames from Datchet to Shepperton Green"}},{"geometry":{"type":"Point","coordinates":[-0.5378292,51.456789876,0]},"type":"Feature","properties":{"description":"<p>Groundwater levels in Egham are continuing to rise. Groundwater levels are expected to continue to rise over the next couple of days and we could see flooding in some areas. Further rain is forecast over the next few days and this could cause levels to remain high. Levels are expected to remain high for several weeks and impacts are expected to be similar to the flooding during the winter 2000/01. This message will be updated on Wednesday 19 February 2014.</p>","title":"Groundwater flooding in Egham"}}]
			}
		},
		"Infrastructure": {
			"mobilephonemasts":{
				"url":'',
				"label": 'Mobile phone masts',
				"type": 'points',
				"dummy":[{"geometry":{"type":"Point","coordinates":[51.46598592502469,-0.5791854858398438,0]},"type":"Feature","properties":{"description":"","title":"O2 Mast 21312"}},{"geometry":{"type":"Point","coordinates":[51.516007082492614, -0.5029678344726562,0]},"type":"Feature","properties":{"description":"","title":"Orange Mast DD21"}},{"geometry":{"type":"Point","coordinates":[51.47197425351888, -0.36289215087890625,0]},"type":"Feature","properties":{"description":"","title":"EE Mast AS0D2"}},{"geometry":{"type":"Point","coordinates":[51.45999681055089, -0.5469131469726562,0]},"type":"Feature","properties":{"description":"","title":"Orange Mast OR213"}}]
			}
		}
	},

	data: {},

	layers: {
		auto:{}
	},

  init: function(){
    var app = this;

    app.createFeedList();
    app.setupMap();
    app.bindInteraction();

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

  bindInteraction: function(){

    var app = this, map = app.map;

    $('#data-layers ul li:not(".category, .detect")').click(function(e){
    	
    	var toggle = $(this).find('i.toggle');
     	var id = $(this).attr('id');

     	$(this).toggleClass('enabled');

     	if(!toggle.hasClass('fa-check-circle')){
     		toggle.removeClass('fa-circle-o').addClass('fa-check-circle');
     		app.enableFeed(id);
     	} else {
			toggle.removeClass('fa-check-circle').addClass('fa-circle-o');
     		app.disableFeed(id);
     	}	

    });

    $('#data-layers ul li.detect').click(function(e){
    	$(this).append($('<i />').attr('class', 'fa fa-lg fa-spin fa-spinner'));
    	app.detectArea();
    });

    map.on('move', function(){
    	// hide the autodetect list
    	$('#auto-detect-list').hide().empty();
    	// Remove the auto detect layers on map
    	$.each(app.layers.auto, function(id, layer){
  			map.removeLayer(layer);
  		});  	
	});

    $('#search').keypress(function(e) {
      if(e.which == 13) {
          e.preventDefault();
          app.focusOnLocation($(this).val());
      }
    });

    $('button.json').click(function(){
        window.location.href = 'http://floodfeeder.cluefulmedia.com/subunits.json';
    });
    $('button.geojson').click(function(){
        window.location.href = 'http://floodfeeder.cluefulmedia.com/uk.json';
    });


  },

  enableFeed: function(id){
  	
  	var app = this;

  	// if feed doesn't exist, load feed
  	if(!app.data[id] || !app.data[id].loaded) {
  		app.loadFeed(id);
  	} else {
  		// show feed on map
  		app.showFeedOnMap(id);
  	}

  },

  disableFeed: function(id){

  	var app = this;

  	app.hideFeedFromMap(id);

  },

  loadFeed: function(id, callback){

  	var app = this;

	app.getFeed(id, function(data){
      	
      	console.log("successfully loaded "+id);

      	app.data[id] = {};
      	app.data[id].data = data;
      	app.data[id].loaded = true;
      	
      	// add it to map
     	app.showFeedOnMap(id);

      }, function(){						// if error retrieving, try to use dummy data

      	var category = $('li#'+id).data('category');

      	if(app.feedConfigs[category][id].dummy){
      		
      		console.log("loading dummy data for "+id);

      		app.data[id] = {};
      		app.data[id].data = app.feedConfigs[category][id].dummy;
      		app.data[id].loaded = true;
      		
      		// add it to map
      		app.showFeedOnMap(id);
      	
      	} else {
      		app.data[id].data = [];
      		console.error("Couldn't load feed: "+id);
      	}
      });

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

  },

  buildParams: function(id){

	var app = this, map = app.map;
	var loc = map.getCenter();

   	var category = $('li#'+id).data('category');

	var params = {
		url: app.feedConfigs[category][id].url,
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

  	var app = this, map = app.map;

  	var category = $('li#'+id).data('category');

  	console.log('feedConfigs', app.feedConfigs);

  	var feed = app.feedConfigs[category][id];

  	switch(id){
  		case 'countries':
  			app.showCountries();
  			break;
  		case 'wards' : 
  			app.showWards();
  			break;
  	}

  },

  hideFeedFromMap: function(id){
  	
  	var app = this, map = app.map;

  	map.removeLayer(app.layers[id]);

  },


  showCountries: function(){

    var app = this, map = app.map;

   	d3.json("countries.json", function(error, countries) {
   		app.layers['countries'] = L.geoJson(topojson.feature(countries, countries.objects.subunits).features, {

   			style: function(feature) {
   				
   				var style = {
				    "stroke-width": 1,
				    "opacity": 0.5
   				};

		        switch (feature.properties.name) {
		            case 'England': style.color = "#ff9999";
		            case 'Scotland': style.color = "#0000ff";
		            case 'Ireland': style.color = "#00ff00";
		            case 'Wales': style.color = "#ff0000";
		        }

		        return style;
		    },
	        onEachFeature: function (feature, layer) {
	          layer.bindPopup("<strong>"+feature.properties.name+"</strong>");
	          //console.log('clicked ', layer, feature);
	        }
	    })
   		.addTo(map);
   	});

    //app.svg = d3.select(map.getPanes().overlayPane).append("svg"),
    //app.g = app.svg.append("g").attr("class", "leaflet-zoom-hide");

/*

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
*/

  },


  showWards: function(){

    var app = this, map = app.map;

   	d3.json("ukwards.topo.json", function(error, wards) {
   		app.layers['wards'] = L.geoJson(topojson.feature(wards, wards.objects.ukwards).features, {

   			style: function(feature) {
   				
   				var style = {
				    "stroke-width": 1,
				    "opacity": 0.5
   				};

   				return style;
		    },
	        onEachFeature: function (feature, layer) {
	          layer.bindPopup("<strong>"+feature.properties.WD11NM+"</strong>");
	        }
	    })
   		.addTo(map);
   	});

/*
   if(id === "wards"){

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

    } else if(id === "countries"){
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
*/
  },

  detectArea: function(){

  	var app = this, map = app.map;

  	var loc = map.getCenter(), lat = loc.lat, lon = loc.lng;

  	$.getJSON('http://mapit.mysociety.org/point/4326/'+lon+','+lat, function(data){
  		console.log(data);
  		app.autoDetectTemp = data;
  		app.createAreaList(data);
  	});

  },

  createAreaList: function(areas){

  	var app = this, map = app.map;

  	var div = $('#auto-detect-list').empty();
  	var ul = $('<ul class="nav nav-sidebar" />');

  	div.append($('<h3 />').text("Nearby areas"));

  	$.each(areas, function(id, data){
  		ul.append($('<li />').text(data.name).attr('id', id));
  	});

    ul.find('li').click(function(){
    	if($(this).hasClass('enabled')){
    		$(this).find('i').remove();
    		map.removeLayer(app.layers.auto[$(this).attr('id')]);
    	} else {
    		ul.find('li.enabled').click();
    		$(this).append($('<i />').attr('class', 'fa fa-lg fa-check-square'));
    		app.showAreaOnMap($(this).attr('id'));
    	}
    	$(this).toggleClass("enabled");
    });

  	div.append(ul);
  	var ok = $('<button class="btn btn-primary ok" />').text('OK'), cancel = $('<button class="btn btn-default cancel" />').text('Cancel');
  	ok.click(function(){
  		var chosenAreaID = $('#auto-detect-list li.enabled').eq(0).attr('id');
  		app.userArea = app.autoDetectTemp[chosenAreaID];
  		$('#data-layers ul li.detect').text('Auto-detect ('+app.userArea.name+')')
  		// destroy list
  		$('#auto-detect-list').empty().hide();
  		// remove layer from map
  		$.each(app.layers.auto, function(id, layer){
  			map.removeLayer(layer);
  		});
  	});
  	cancel.click(function(){
  		// destroy list
  		$('#auto-detect-list').empty().hide();
  		// remove layer from map
  		$.each(app.layers.auto, function(id, layer){
  			map.removeLayer(layer);
  		});
  	});

  	div.append(ok, cancel);
  	div.show();
  	$('#data-layers ul li.detect').find('i').remove();

  },

  showAreaOnMap: function(id){
  	var app = this, map = app.map;

  	$.getJSON('http://mapit.mysociety.org/area/'+id+'.geojson', function(data){
  		app.layers['auto'][""+id] = L.geoJson(data).addTo(map);
  	});

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
    Sets map view based on string location e.g. "London" or "staines"
  */
  focusOnLocation: function(string){

		var app = this, map = app.map, geocoder = app.geocoder;

		string = string.replace(/ /g,'+');

		if (!geocoder) {
			app.geocoder = new google.maps.Geocoder();
			    app.focusOnLocation(string);    	
		} else {
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

	},

	addDataToMap: function(){
		var app = this, map = app.map;

	},

	constructGeoJSON: function(rows){

		var app = this, map = app.map;
		var markers = [];

		app.feedConfigs.geoJson = {
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

		    app.feedConfigs.geoJson.features.push(marker);

		};

		L.geoJson(app.feedConfigs.geoJson, {
		    onEachFeature: function (feature, layer) {
		        //layer.bindPopup("<b>"+feature.properties.title+"</b><br />"+feature.properties.description);
		    }
		}).addTo(app.map);

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

		$.each(app.feedConfigs, function(category, feeds){
			var ul = $('<ul class="nav nav-sidebar" />');

			var icon = '';

			if(category === "Geography"){
				icon = 'fa-globe';
			}

			ul.append($('<li class="category" />').append($('<h3 />').text(category)));

			$.each(feeds, function(feed, config){

				console.log(config.type);

				switch(config.type){
					case 'points' : 
						icon = 'fa-map-marker';
						break;
					case 'shapes' : 
						//icon = 'fa-tint';
						break;
					case 'tabular' : 
						icon = 'fa-th-list';
						break;
				}

				ul.append($('<li />').attr('id', feed).attr('data-category', category).text(config.label).append($('<i />').attr('class', 'toggle fa fa-lg fa-circle-o')).append($('<i />').attr('class', 'fa fa-lg fa-fw '+icon)));
			});

			if(category === "Geography")
				ul.append($('<li class="detect" />').text('Auto-detect'));

			$('#data-layers').append(ul);

		});

	}

};

(function(){
  Feeder.init();
}());
