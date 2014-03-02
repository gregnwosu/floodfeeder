/*
	Flood Feeder - main script
*/

var Feeder = {

	mapConfig: {
    tiles:{
      osm: {
        url:'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      },
      transport: {
        url:'http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png'
      }
    },
		projections:{}
	},

	map:{},

	data: {},

	layers: {
		detected:{}
	},

  init: function(){
    var app = this;

    app.setupMap();

    // start the map in South-East England
    //app.map.setView(new L.LatLng(52.01193653675363, -0.3240966796875), 7);

    app.centerTarget();

    app.loadFeedConfigs(function(){
      app.createFeedList();
      app.bindInteraction();
    });

  },

  setupMap: function(tiles){
    var app = this;

    $('#map').empty();

    app.mapConfig.width = $('#map').width();
    app.mapConfig.height = $('#map').height();   

    // set up the map
    // app.map = new L.Map('map');

    // create the tile layer with correct attribution
    /*var osmAttrib='Map data © OpenStreetMap contributors';
    var osm = new L.TileLayer(tiles, {
      minZoom: 1, maxZoom: 20, attribution: osmAttrib
    });*/ 
  
    var layers = [];

    $.each(app.mapConfig.tiles, function(id, url){
      app.mapConfig.tiles[id].layer = L.tileLayer(url);
      layers.push(app.mapConfig.tiles[id].layer);
    });

    app.map = new L.map('map', {
        center: new L.LatLng(52.01193653675363, -0.3240966796875),
        zoom: 7,
        layers: layers
    });

    //app.map.addLayer(osm);

  },

  addTileLayer: function(url){

    var app = this, map = app.map;

    var layer = new L.TileLayer(url);   
    
    if(!app.layers['tiles']){
      app.layers['tiles'] = {};
    } 

    if(app.layers.tiles[id]){
      // just show the layer
      map.showLayer(app.layers.tiles[id]);
    } else {
      // add the new layer to the map
      app.layers.tiles[id] = layer;
      map.addLayer(layer);      
    }


  },

  removeTileLayer: function(id){
    var app = this, map = app.map;
    map.removeLayer(app.layers.tiles[id]);
  },

  bindInteraction: function(){

    var app = this, map = app.map;

    $('#data-layers ul li.feed').hover(function(){
      var e = $(this);

      //e.unbind('hover');
      if(e.attr('id') === "detect"){
        e.popover({
          title: "Auto-detection provided by MapIt",
          content: "Depending on where the center of the map is, we call MapIt's API to suggest which areas contain that point.",
          placement: 'right'
        }).popover('show'); 
      } else {
        e.popover({
          title: app.feedConfigs[e.data('category')][e.attr('id')].label,
          content: app.feedConfigs[e.data('category')][e.attr('id')].description,
          placement: 'right'
        }).popover('show');      
      }
    },function(){
      var e = $(this);
      //e.unbind('hover');
      e.popover('destroy');
    });

    $('#data-layers ul li.feed').click(function(e){
    	
    	var toggle = $(this).find('i.toggle');
     	var id = $(this).attr('id');

     	$(this).toggleClass('enabled');

     	if(!toggle.hasClass('fa-check-circle')){
     		toggle.removeClass('fa-circle-o').addClass('fa-check-circle');
     		if($(this).hasClass('detect')){
          app.detectArea();
        } else {
          app.enableFeed(id);
        }
     	} else {
			  toggle.removeClass('fa-check-circle').addClass('fa-circle-o');
        if($(this).hasClass('detect')){
          app.disableAutoDetect();
        } else {
          app.disableFeed(id);
        }        
     	}	

    });

    $('#data-layers ul li.tiles').click(function(){
      var id = $(this).attr('id'), category = $(this).data('category');
      $(this).toggleClass('enabled');
      if(!$(this).hasClass('enabled')){
        app.addTileLayer(app.feedConfigs[category][id].url);
      } else {
        app.removeTileLayer(id);
      }
      
    });

    $('li.userArea').on('mouseover', function(){
      $(this).find('i').addClass('fa-ban');
    }).on('mouseout', function(){
      $(this).find('i').removeClass('fa-ban');
    }).on('click', function(){
      app.removeUserGeography();
    });

    map.on('move', function(){
      if(app.autoDetectEnabled){
        app.detectArea();
      }
	   });

    $('#search').keypress(function(e) {
      if(e.which == 13) {
          e.preventDefault();
          app.focusOnLocation($(this).val());
      }
    }).parent().find('button').click(function(){
        app.focusOnLocation($('#search').val());     
    })


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

    if(params.url){
      $.ajax({
        type:'get',
        url: params.url,
        data: params.data,
        success: success,
        error: error
      });
    } else {
      error();
    }

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

  	switch(id){
  		case 'countries':
  			app.showCountries();
  			break;
  		case 'wards' : 
  			app.showWards();
  			break;
      case 'warnings':
      case 'alerts' :
      case 'mobilephonemasts' : 
        app.showMarkers(id);
        break;
  	}

  },

  hideFeedFromMap: function(id){
  	
  	var app = this, map = app.map;

  	map.removeLayer(app.layers[id]);

  },


  showCountries: function(){

    var app = this, map = app.map;

    var countries = app.data['countries'].data;

 		app.layers['countries'] = 
      L.geoJson(topojson.feature(countries, countries.objects.subunits).features, {

 			style: function(feature) {
 				
 			  var style = {
          className: 'country'
        };

        switch (feature.properties.name) {
          case 'England': 
          style.fillColor = style.color = "#7900FF"; break;
          case 'Scotland': 
          style.fillColor = style.color = "#2277FF"; break;
          case 'N. Ireland': 
          style.fillColor = style.color = "#5CB340"; break;
          case 'Ireland': 
          style.opacity = 0; 
          style.fillOpacity = 0; 
          style.className = ''; break;
          case 'Wales': 
          style.fillColor = style.color = "#ff0000"; break;
        }

        return style;
	    },
      onEachFeature: function (feature, layer) {
        layer.bindPopup("<strong>"+feature.properties.name+"</strong>");

        layer.on({
          click:function(e){
            app.setUserGeography({
              type: 'country',
              name: feature.properties.name,
              data: feature,
              layer: layer
            });
          }
        });
      }
    })
 		.addTo(map);

  },

  showWards: function(){

    var app = this, map = app.map;

    var wards = app.data['wards'].data
 		app.layers['wards'] = 
    L.geoJson(topojson.feature(wards, wards.objects.ukwards).features, {
      style:{
        className: 'ward'
      }, 
      onEachFeature: function (feature, layer) {
          
          layer.bindPopup("<strong>"+feature.properties.WD11NM+"</strong>");

          layer.on({
            click:function(){
              app.setUserGeography({
                type:'ward',
                name: feature.properties.WD11NM,
                data: feature,
                layer: layer
              });
            }
          });
      }

    })
 		.addTo(map);

  },

  showMarkers: function(id){

    var app = this, map = app.map;

    app.layers[id] = L.geoJson(app.data[id].data, {
      onEachFeature: function(feature, layer){
        //console.log(feature);
        layer.bindPopup("<strong>"+feature.properties.title +
            "</strong><br />"+feature.properties.description);      
      }
    }).addTo(map);
  },

  detectArea: function(){

  	var app = this, map = app.map;

    app.autoDetectEnabled = true;
    $('#map i.target').show();

  	var loc = map.getCenter(), 
    lat = loc.lat, 
    lon = loc.lng;

  	$.getJSON('http://mapit.mysociety.org/point/4326/'+lon+','+lat, function(data){
  		//console.log(data);
  		app.autoDetectTemp = data;
  		app.createDetectedAreaList(data);
  	});

  },

  centerTarget: function(){
    var mapWidth2 = $('#map').width()/2;
    var iconWidth2 = $('#map i.target').width()/2;
    var mapHeight2 = $('#map').height()/2;
    var iconHeight2 = $('#map i.target').height()/2;
    $('#map i.target')
    .css('left', mapWidth2-iconWidth2+'px')
    .css('top', mapHeight2-iconWidth2+'px');
  },

  disableAutoDetect: function(){
    var app = this, map = app.map;
    // destroy list
    $('#auto-detect-list').removeClass('open');
    //$('#auto-detect-list').empty().hide();
    // remove layer from map

    $.each(app.layers.detected, function(id, layer){
      map.removeLayer(layer);
    });

    $('#map i.target').hide();
    app.autoDetectEnabled = false;

  },

  createDetectedAreaList: function(areas){

  	var app = this, map = app.map;

  	var div = $('#auto-detect-list').empty();
  	var ul = $('<ul class="nav nav-sidebar" />');

  	div.append($('<h3 />').text("Nearby areas"));

    var sortedAreas = app.objectToSortedArray(areas, 'name');

    for (var i = 0; i < sortedAreas.length; i++) {
      ul.append($('<li />').text(sortedAreas[i].name).attr('id', sortedAreas[i].id));
    };

    app.bindInteractionAutoDetectList(ul);

  	div.append(ul);

    div.addClass('open');

  },

  bindInteractionAutoDetectList:function(ul){

    var app = this, map = app.map;

    ul.find('li').mouseover(function(){
      $(this).toggleClass('hovering');
      $(this).append($('<i />').attr('class', 'fa fa-lg fa-spin fa-spinner'));
      app.showDetectedAreaOnMap($(this).attr('id'));  
    });

    ul.find('li').mouseout(function(){
      $(this).toggleClass('hovering');
      $(this).find('i').remove();
      if(!$(this).hasClass('enabled')){
        map.removeLayer(app.layers.detected[$(this).attr('id')]); 
      }
    });   

    ul.find('li').click(function(){
      if(!$(this).hasClass('enabled')){

        var chosenAreaID = $(this).attr('id');

        ul.find('li.enabled').removeClass('enabled');
        $.each(app.layers.detected, function(id, layer){
          if(id !== chosenAreaID){
            map.removeLayer(layer);
          }
        });

        app.userArea = app.autoDetectTemp[chosenAreaID];
        app.setUserGeography({
          type: 'detected',
          name: app.userArea.name,
          data: app.userArea,
          layer: app.layers.detected[chosenAreaID]
        });
      } else {
        app.disableAutoDetect();
      }

      $(this).toggleClass("enabled");

    });

  },

  showDetectedAreaOnMap: function(id){
  	var app = this, map = app.map;

    if(app.layers['detected'][""+id]){
      app.layers['detected'][""+id].addTo(map);
      $('li#'+id).find('i.fa-spin')
      .removeClass('fa-spin fa-spinner')
      .addClass('fa-check-circle');
    } else {
    	$.getJSON('http://mapit.mysociety.org/area/'+id+'.geojson', function(data){

        app.layers['detected'][""+id] = L.geoJson(data, {
          onEachFeature: function(feature, layer){
            layer.on('click', function(){
              app.setUserGeography({
                type: 'detected',
                name: app.autoDetectTemp[id].name,
                data: feature,
                layer: layer
              });
            });
          }
        }).addTo(map);

        $('li#'+id).find('i.fa-spin')
        .removeClass('fa-spin fa-spinner')
        .addClass('fa-check-circle');

    	});
    }

  },

  setUserGeography: function(area){
    var app = this, map = app.map;
    app.userArea = area.data;

    // Wipe any other user geography that's been set
    var li = $('#data-layers ul li.userArea').empty().hide();
    //console.log(li);
    li.text(area.name).append($('<i class="fa fa-lg" />')).show();

    map.fitBounds(area.layer.getBounds(), {padding: [0,0]});
  },

  removeUserGeography: function(){
    var app = this;
    delete app.userArea;
    $('li.userArea').empty().hide();
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
		          if(results.length > 0 && results[0].geometry 
                && results[0].geometry.location){

		            var latlong = L.latLng(results[0].geometry.location.d, 
                  results[0].geometry.location.e);
		            map.setView(latlong, 11);
		          }
		       }
		       else {
		          console.log("Geocoding failed: " + status);
		       }
		    });
		}

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

        var className = 'feed';

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
          case 'tiles' : 
            icon = 'fa-th';
            className = 'tiles';
            break;
        }

				ul.append($('<li />').attr('id', feed)
          .attr('class', className)
          .attr('data-category', category)
          .text(config.label)
          .append($('<span class="area btn btn-success btn-xs" />'))
          .append($('<i />').attr('class', 'toggle fa fa-lg fa-circle-o'))
          .append($('<i />').attr('class', 'fa fa-lg fa-fw '+icon))
          );
			});

			if(category === "Geography"){
				ul.append($('<li id="detect" class="detect" />')
          .text('Auto-detect')
          .append($('<i class="toggle fa fa-lg fa-circle-o" />'))
          .append($('<i class="fa fa-lg fa-fw fa-crosshairs" />'))
          );
        ul.append($('<li class="userArea" />'));
      }

			$('#data-layers').append(ul);

		});

	},

  loadFeedConfigs: function(callback){
    var app = this;
    $.getJSON('feedConfigs.json', function(data){
      app.feedConfigs = data;
      callback();
    });
  },

  objectToSortedArray: function(object, key){

    var sortable = [];
    
    $.each(object, function(key, item){
      sortable.push(item);
    });

    //console.log(sortable);

    return sortable.sort(function(a, b) {
      if(a[key] < b[key]) return -1;
      if(a[key] > b[key]) return 1;
      return 0;
    });;
  }

};

(function(){
  Feeder.init();

  $(window).resize(function(){
    Feeder.centerTarget();
  });

}());
