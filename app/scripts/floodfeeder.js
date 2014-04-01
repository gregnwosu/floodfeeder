/*
	Flood Feeder - main script
*/

var Feeder = {

	mapConfig: {
    tiles:{},
		projections:{}
	},

	map:{},

	data: {},

	layers: {
    tiles:{},
		detected:{}
	},

  init: function(){
    var app = this;

    app.loadFeedConfigs(function(){
      app.centerTarget();
      app.createFeedList();
      app.setupMap();
      app.bindInteraction();
    });

  },

  setupMap: function(){
    var app = this;

    app.mapConfig.width = $('#map').width();
    app.mapConfig.height = $('#map').height();   

    // set up the map
    app.map = new L.Map('map');

    // create the tile layer with correct attribution
    /*var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © OpenStreetMap contributors';
    var osm = new L.TileLayer(osmUrl, {
      minZoom: 1, maxZoom: 20, attribution: osmAttrib
    });*/
    //app.layers.tiles['osm'] = osm;

    // select the OSM map in the menu

    // start the map in South-East England
    app.map.setView(new L.LatLng(52.01193653675363, -0.3240966796875), 7);
    //app.map.addLayer(app.layers.tiles['osm']);

  },

  bindInteraction: function(){

    var app = this, map = app.map;

    $('#data-layers ul li:not(".category, .userArea")').hover(function(){
      var e = $(this);

      //e.unbind('hover');
      if(e.attr('id') === "detect"){
        e.popover({
          title: "Nearby areas API provided by MapIt",
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

    $('#data-layers ul li:not(".category, .userArea, .Maps")').click(function(e){
    	
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


    $('#data-layers ul li.Maps').click(function(e){
      
      $('#data-layers ul li.Maps').removeClass('enabled');
      $('#data-layers ul li.Maps i.toggle').removeClass('fa-check-circle').addClass('fa-circle-o');

      var toggle = $(this).find('i.toggle');
      var id = $(this).attr('id');

      $(this).toggleClass('enabled');

      if(!toggle.hasClass('fa-check-circle')){
        toggle.removeClass('fa-circle-o').addClass('fa-check-circle');
        app.addTileLayer($(this).attr('id'));
      } else {
        toggle.removeClass('fa-check-circle').addClass('fa-circle-o');
        app.removeTileLayer($(this).attr('id'));      
      } 

    });

    $('li.userArea').on('mouseover', function(){
      $(this).find('i').addClass('fa-ban');
    }).on('mouseout', function(){
      $(this).find('i').removeClass('fa-ban');
    }).on('click', function(){
      app.removeUserAreas();
    });

    map.on('click', function(){
      $('#dataGridPanel').hide();  
	  });

    $('#viewData').click(function(){
      app.showDataGrid(app.currentFeed);
    });

    map.on('moveend', function(e) {
      
      if(app.autoDetectEnabled){
        app.detectArea();
      }

      app.getUpdatedData(e.target.getBounds());

    });

    $('#search').keypress(function(e) {
      if(e.which == 13) {
          e.preventDefault();
          app.focusOnLocation($(this).val());
      }
    }).parent().find('button').click(function(){
        app.focusOnLocation($('#search').val());     
    });

/*
    $('ul.nav-sidebar li:not(.category, .enabled)').hide();

    $('ul.nav-sidebar').hover(function(){
        $(this).find('li').show();
    },function(){
        $(this).find('li:not(.category, .enabled)').hide();
    });
*/
    app.setupSliders();

    //app.setupDataGrid();

    $('li#osm').click();

  },

  getUpdatedData: function(bounds){

    // find out which feeds are displaying

    // request them again, but using the new bounds

    console.warn('Requesting new data with new bounds...', bounds);
  },

  showDataGrid: function(id){

    console.log("here");

    var app = this;

    var props = [];

    var columns = [{
        property: 'lat',
        label: 'Latitude',
        sortable: false
      },{
        property: 'lng',
        label: 'Longitude',
        sortable: false
      }];

    for ( property in app.data[id].data.features[0].properties ) {
      props.push(property);
      columns.push({
        property: property,
        label: property,
        sortable: false
      });
    }


    // INITIALIZING THE DATAGRID
    var dataSource = new StaticDataSource({

      // Column definitions for Datagrid
      columns: columns,

      // Create IMG tag for each returned image
      formatter: function (items) {
        $.each(items, function (index, item) {
          item.lat = item.geometry.coordinates[1];
          item.lng = item.geometry.coordinates[0];
          for (var i = 0; i < props.length; i++) {
            item[props[i]] = item.properties[props[i]];
          };
        });
      },

      data: app.data[id].data.features,
      
      delay: 250

    });

    $('#dataGrid').datagrid({
      dataSource: dataSource,
      stretchHeight: true
    });

    $('#dataGridPanel').show();

    //$('#dataGrid').datagrid({ dataSource: dataSource, stretchHeight: true })

  },

  setupSliders: function(){

    var app = this, map = app.map;

    $('#opacity').slider().on('slide', function(ev){
        var layer = app.selectedLayer;
        /*var style = layer._options.style();
        var value = ev.value;
        console.log(value/10);
        style.opacity = value/10;
        style.fillOpacity = value/10;
        layer.setStyle(style);*/
        app.setLayerStyle(layer);
    }).data('slider');

    $('#thickness').slider().on('slide', function(ev){
        var layer = app.selectedLayer;
        /*var style = layer._options.style();
        var value = ev.value;
        console.log(value);
        if(value > 0){
          style.width = value;
          style.stroke = true;
        } else {
          style.stroke = false;
        }
        layer.setStyle(style);*/
        app.setLayerStyle(layer);
    }).data('slider');

    var RGBChange = function() {
      $('#RGB').css('background', 'rgb('+r.getValue()+','+g.getValue()+','+b.getValue()+')');
      var layer = app.selectedLayer;
      /*var style = layer._options.style();
      style.color = 'rgb('+r.getValue()+','+g.getValue()+','+b.getValue()+')';*/
      app.setLayerStyle(layer);
    };

    var r = $('#R').slider()
      .on('slide', RGBChange)
      .data('slider');
    var g = $('#G').slider()
      .on('slide', RGBChange)
      .data('slider');
    var b = $('#B').slider()
      .on('slide', RGBChange)
      .data('slider'); 
  },  

  setLayerStyle: function(layer, style){

    var app = this, map = app.map;
   
    layer.setStyle({
      opacity: $('#opacity').data('slider').getValue()/10,
      fillOpacity: $('#opacity').data('slider').getValue()/10,
      strokeWidth: $('#thickness').data('slider').getValue(),
      color: $('#RGB').css('background-color')
    });

  },

  selectLayer: function(layer){
    var app = this, map = app.map;
    app.selectedLayer = layer;
    $('#layerControls').show();
  },

  addTileLayer: function(id){

    var app = this, map = app.map; 
    
    if(!app.layers['tiles']){
      app.layers['tiles'] = {};
    } 

    if(app.mapConfig.currentLayer){
      app.removeTileLayer(app.mapConfig.currentLayer);
    }

    if(app.layers.tiles[id]){
      // just show the layer
      //map.showLayer(app.layers.tiles[id]);
      map.addLayer(app.layers.tiles[id]);
    } else {
      // add the new layer to the map
      app.layers.tiles[id] = new L.TileLayer(app.mapConfig.tiles[id].url, {
        minZoom: 1, 
        maxZoom: 20, 
        attribution: app.mapConfig.tiles[id].attribution
      });

      map.addLayer(app.layers.tiles[id]);      
    }

    app.mapConfig.currentLayer = id;

  },

  removeTileLayer: function(id){
    var app = this, map = app.map;
    map.removeLayer(app.layers.tiles[id]);
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

    var bounds = app.map.getBounds();
    //swBounds = [bounds._southWest.lat, bounds._southWest.lng],
    //neBounds = [bounds._northEast.lat, bounds._northEast.lng];

  	var params = {
  		url: app.feedConfigs[category][id].url,
  		data: {
        bbox: bounds._southWest.lng + ',' + bounds._southWest.lat + 
        ',' + bounds._northEast.lng + ',' + bounds._northEast.lat
      }
  	};

    params.data[id] = true;

  	switch(id){
      case 'alertareas':
        break;
  		case 'warnings':
  		  break;
  		case 'alerts' : 
        break;
      case 'alertareas':
  		  break;
  		case 'countries' : 
  		  break;
  		case 'wards' :
  		  break;
      case 'nuclear' :
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

    $('#viewData').show();
    app.currentFeed = id;

  	switch(id){
  		case 'countries':
  			app.showCountries();
  			break;
  		case 'wards' : 
  			app.showWards();
  			break;
      case 'warnings':
      case 'alerts' :
        break;
      case 'alertareas':
        app.showTopoJSON(id);
        break;
      case 'forests' :
        app.showPolygons(id, 'NAME', 'MEASURE');
        break;
       case 'heritage' :
        app.showPolygons(id, 'NAME', 'MEASURE');
        break;
      case 'nuclear' : 
        app.showPoints(id, 'NAME', 'OPERATOR');
        break;
      case 'mobilephonemasts' : 
        app.showPoints(id, 'title', 'description');
        break;
  	}

  },

  hideFeedFromMap: function(id){
  	
  	var app = this, map = app.map;

    $('#viewData').hide();
    $('#dataGridPanel').hide();
    delete app.currentFeed;

  	map.removeLayer(app.layers[id]);

  },

  showTopoJSON: function(id){

    var app = this, map = app.map;
    
    //console.log('showTopoJSON');

    // in case it hasn't been parsed
    if(typeof app.data[id].data === "string"){
      app.data[id].data = JSON.parse(app.data[id].data);
    }

    var data = app.data[id].data;

    // dymamically get the area name of the topology
    for ( property in data.objects ) {
      var areaName = property;
    }

    app.layers[id] = 
      L.geoJson(topojson.feature(data, data.objects[areaName]).features, {

      style: function(feature) {
        
        var style = {
          className: id,
          color: "#7900FF",
          weight: 1,
          opacity: 0.5,
          fillOpacity: 0.5
        };

        switch(id){
          case 'alertareas':
            style.color = "#FF9600";
            break;
          case 'warningareas':
            style.color = "#FF0000";
            break;
        }

        return style;
      },
      onEachFeature: function (feature, layer) {

        var table = "<table>";
        $.each(feature.properties, function(id, value){
          if(value && value.length > 0){
            table += "<tr><td>"+id+"</td><td>"+value+"</td></tr>";
          }
        });
        table+= "</table>";

        layer.bindPopup(table);
        layer.on({
          click: function(){
            app.selectLayer(layer);
          }
        });
      }
    })
    .addTo(map);

    map.fitBounds(app.layers[id].getBounds(), {padding: [0,0]});

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
            app.selectLayer(layer);
            app.setUserAreas({
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
              app.selectLayer(layer);
              app.setUserAreas({
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

  showPoints: function(id, titleKey, descriptionKey){

    var app = this, map = app.map;

    app.layers[id] = L.geoJson(app.data[id].data, {
      onEachFeature: function(feature, layer){
        //console.log(feature);
        layer.bindPopup("<strong>"+feature.properties[titleKey] +
            "</strong><br />"+feature.properties[descriptionKey]);      
      }
    }).addTo(map);
  },


  showPolygons: function(id, titleKey, descriptionKey){

    var app = this, map = app.map;

    app.layers[id] = L.geoJson(app.data[id].data, {
      onEachFeature: function(feature, layer){
        //console.log(feature);
        layer.bindPopup("<strong>"+feature.properties[titleKey] +
            "</strong><br />"+feature.properties[descriptionKey]);      
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
        app.setUserAreas({
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
              app.setUserAreas({
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

  setUserAreas: function(area){
    var app = this, map = app.map;
    app.userArea = area.data;

    // Wipe any other user geography that's been set
    var li = $('#data-layers ul li.userArea').empty().hide();
    //console.log(li);
    li.text(area.name).append($('<i class="fa fa-lg" />')).show();

    map.fitBounds(area.layer.getBounds(), {padding: [0,0]});
  },

  removeUserAreas: function(){
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

/*  addLayersToMap: function(map){
    
    var app = this, map = app.map;
    var layers = [];

    $.each(app.mapConfig.tiles, function(id, url){
      app.mapConfig.tiles[id].layer = L.tileLayer(url);
      map.addLayer(app.mapConfig.tiles[id].layer);
    });

  },
*/
	createFeedList: function(){

		var app = this;

		$.each(app.feedConfigs, function(category, feeds){
			var ul = $('<ul class="nav nav-sidebar" />');

			var icon = '';

			if(category === "Areas"){
				icon = 'fa-globe';
			} else if(category === "Floods"){
        ul.addClass('floods');
      }

			ul.append($('<li class="category" />').append($('<h3 />').text(category)));

			$.each(feeds, function(feed, config){

				switch(config.type){
					case 'points' : 
						icon = 'fa-map-marker';
						break;
					case 'tiles' : 
						icon = 'fa-th';
						break;
					case 'tabular' : 
						icon = 'fa-th-list';
						break;
				}

				ul.append($('<li />')
          .attr('id', feed)
          .attr('data-category', category)
          .attr('class', category)
          .text(config.label)
          .append($('<span class="area btn btn-success btn-xs" />'))
          .append($('<i />').attr('class', 'toggle fa fa-lg fa-circle-o'))
          .append($('<i />').attr('class', 'fa fa-lg fa-fw '+icon))
          );
			});

			if(category === "Areas"){
				ul.append($('<li id="detect" class="detect" />')
          .text('Find area')
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
      app.mapConfig.tiles = data.Maps;
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
