
var AvatechTerrainLayer = require('./terrain-layer')

angular.module('avatech').directive('map', function($timeout, $q, $state, $rootScope, $templateRequest, $compile, snowpitExport, snowpitConstants, Global, mapLayers, $http, $log, terrainVisualization, $uibModal) {
  return {
    restrict: 'A',
    templateUrl: "/modules/map/map-directive.html",
    scope: { 
        map: '=map',
        terrainLayer: '=terrainLayer',
        profiles: '=obs',
        detailMode: '=detailMode',
        loadingNew: '=loadingNew',
        loadingProfiles: '=loading',
        hoverOb: '=hoverOb',
        obSearch: '=search',
        showTerrain: '=showTerrain',
        showCoords: '=showCoords',
        load: '=load'
    },
    link: function(scope, element) {

        scope.global = Global;

        scope.formatters = snowpitExport.formatters;

        scope.mapLayers = mapLayers;

        // get color maps for terrain viz legends
        scope.colorMaps = terrainVisualization.colorMaps;

        // defaults
        if (scope.showTerrain == undefined) scope.showTerrain = true;
        if (scope.showCoords == undefined) scope.showCoords = true;

        var loaded = false;
        scope.$watch('load', function() {
            if (scope.load && !loaded) loadMap();
        });

        function loadMap() {
            loaded = true;

            // pre-compile observation map popup
            scope.compiledPopup;
            $templateRequest("/modules/map/observation-map-popup.html").then(function(templateHtml) {
                scope.compiledPopup = $compile(angular.element(templateHtml));
            });

            // get map holder DOM element
            var mapElement = element[0].querySelector('.map-holder');

            function newOb(type, latlng) {
                // lng/lat array
                var location = [
                    parseFloat(latlng.lng.toFixed(7)),
                    parseFloat(latlng.lat.toFixed(7))
                ];
                // for snowpit, go to snowpit editor
                if (type == "snowpit") {
                    $state.go('index.profileEditor.details', { profileId: "new", location: location })
                    return;
                }
                // for everything else, show edit modal
                $uibModal.open({
                    templateUrl: "/modules/observations/new.html",
                    controller: "NewObservationModalController",
                    backdrop: 'static',
                    windowClass: 'width-480',
                    resolve: {
                      ob: function() { return { type: type, location: location }; }
                    }
                });
            }

             // init leaflet map
            scope.map = L.map(mapElement, {
                zoomControl: false,
                minZoom: 3,
                maxZoom: 18,
                worldCopyJump: true,
                // context menu
                contextmenu: true,
                contextmenuWidth: 140,
                contextmenuItems: [
                {
                    text: 'Avalanche',
                    callback: function(e) { newOb('avalanche', e.latlng); }
                },
                {
                    text: 'Snowpack',
                    callback: function(e) { newOb('snowpack', e.latlng); }
                }, 
                {
                    text: 'Snowpack Test',
                    callback: function(e) { newOb('snowpack-test', e.latlng); }
                }, 
                {
                    text: 'Snowpit',
                    callback: function(e) { newOb('snowpit', e.latlng); }
                }, 
                {
                    text: 'Weather',
                    callback: function(e) { newOb('weather', e.latlng); }
                },
                {
                    text: 'Wind',
                    callback: function(e) { newOb('wind', e.latlng); }
                }
                ]
            });

            // disable scroll wheel zoom
            //scope.map.scrollWheelZoom.disable();

            // add markers layer
            scope.mapLayer = L.layerGroup().addTo(scope.map);

            // add zoom control to map
            new L.Control.Zoom({ position: 'bottomright' }).addTo(scope.map);
            //L.control.zoomslider({ position: 'bottomright' }).addTo(scope.map);

            // add scale control to map
            // L.control.scale({
            //     metric: true,
            //     imperial: true,
            //     position: 'topleft'
            // }).addTo(scope.map);
            
            var mapLoaded = $q.defer();
            scope.map.on('load', function(e) { mapLoaded.resolve(); });

            // setup heatmap
            var heatMap;
            setTimeout(function() {
                heatMap = L.heatLayer([], { radius: 1, blur: 1, maxZoom: 20 }).addTo(scope.map);
            },10);

            // setup clustering
            var pruneCluster = new PruneCluster.PruneClusterForLeaflet();
            pruneCluster.Cluster.Size = 10; 
            scope.map.addLayer(pruneCluster);

            // render observation icons
            pruneCluster.PrepareLeafletMarker = function(leafletMarker, data) {
                // detailed mode
                if (scope.detailMode) {
                    var markerClass = 'count-icon';
                    // append observation type to class
                    markerClass += ' ' + data.observation.type
                    // append redFlag
                    if (data.observation.redFlag) markerClass += ' redFlag';

                    // set marker icon based on observation type
                    leafletMarker.setIcon(L.divIcon({
                        className: markerClass,
                        html: "",
                        iconSize: [30, 45]
                    }));

                    // clear existing bindings
                    leafletMarker.off('click');

                    // show popup on click
                    leafletMarker.on('click', function (e) {
                        var existingPopup = leafletMarker.getPopup();
                        // if popup doesn't exist, create it
                        if (!existingPopup) {
                            // create scope for popup (true indicates isolate scope)
                            var newScope = scope.$new(true);
                            newScope.profile = data.observation;
                            // bind scope to pre-compiled popup template
                            scope.compiledPopup(newScope, function(clonedElement) {
                                // bind popup with compiled template html
                                leafletMarker.bindPopup(clonedElement[0], {
                                    offset: new L.Point(0, -10)
                                });
                            });
                            scope.$apply();
                            this.openPopup();
                        }
                    });
                }
                // heatmap mode
                else {
                    // if single icon, style as cluster icon
                    leafletMarker.setIcon(L.divIcon({
                        className: 'prunecluster',
                        html: "<div><span>1</span></div>",
                        iconSize: [30, 30]
                    }));

                    // clear existing bindings
                    leafletMarker.off('click');

                    // zoom in on click
                    leafletMarker.on('click', function (e) {
                        scope.map.setView(e.latlng, 11, { animate: true });
                    });
                }
            };

            // render observation cluster icons
            pruneCluster.BuildLeafletClusterIcon = function(cluster) {
                var className = 'prunecluster'

                // if in detailed mode
                if (scope.detailMode) className += ' detailed'

                // hacky yet highly performant way to determine if there is a red flag in the cluster
                var redFlagInCluster = cluster.stats[1] > 0;
                if (redFlagInCluster) className += ' redFlag';

                // create icon
                return new L.DivIcon({
                    html: "<div><span>" + cluster.population + "</span></div>",
                    className: className,
                    iconSize: L.point(30, 30)
                });
            }

            // plot obs on map
            var obsOnMap = {};
            function plotObsOnMap() {
                angular.forEach(scope.profiles,function(profile) {
                    // already on map
                    var existingMarker = obsOnMap[profile._id];
                    if (existingMarker) {
                        // if deleted, remove it from map and from list
                        if (profile.removed) {
                            pruneCluster.RemoveMarkers([existingMarker]);
                            delete obsOnMap[profile._id];
                        }
                    }
                    // not on map (ignore if removed)
                    else if (!profile.removed) {
                        var marker = new PruneCluster.PruneCluster.Marker(profile.location[1], profile.location[0]);

                        // associate profile with marker
                        marker.data.observation = angular.copy(profile);

                        // this looks hacky but it's by far the most performant way to keep
                        // track of red flags (uses the PruneCluster lib's 'category' feature)
                        marker.category = + profile.redFlag;

                        // add to map
                        pruneCluster.RegisterMarker(marker);
                        // keep track of all markers placed on map
                        obsOnMap[profile._id] = marker;
                    }
                });
                pruneCluster.ProcessView();
            }

            // search
            var searchObs = function() {
                if (!scope.obSearch) return;
                // reset heatmap
                if (heatMap) heatMap.setLatLngs([]);

                // hide all markers
                angular.forEach(obsOnMap, function(marker) {
                    marker.filtered = true;
                    marker.data.filtered = true;
                });
                // iterate through obs and filter
                angular.forEach(scope.profiles,function(ob) {
                    ob.filtered = true;
                    if (scope.obSearch.doSearch(ob)) {
                        ob.filtered = false;
                        obsOnMap[ob._id].filtered = false;
                        obsOnMap[ob._id].data.filtered = false;
                        // add to heatmap
                        if (heatMap) heatMap.addLatLng([ob.location[1], ob.location[0]]);
                    }
                });
                pruneCluster.ProcessView();
            }

            // debounce ob search
            var _searchTimeout;
            scope.$watch('obSearch',function() {
                if (!scope.obSearch) return;
                if (_searchTimeout) $timeout.cancel(_searchTimeout);
                _searchTimeout = $timeout(function() {
                    searchObs();
                }, 200);
            }, true);

            // go to location selected in location search
            scope.mapSearchSelect = function(location) {
                if (location.lat && location.lng)
                    scope.map.setView([location.lat,location.lng], 
                        12, // zoom
                        { animate: false });
            }

            scope.setBaseLayer = function(layer, clicked) {

                if (__PROD__) {
                    if (clicked) mixpanel.track("set base layer", { alias: layer.alias, name: layer.name });
                }

                scope.selectedBaseLayer = layer;

                var newBaseLayer;
                if (layer.type == "TILE") {
                    var options = {
                        zIndex: 2,
                        opacity: 1,
                        detectRetina: true,
                        errorTileUrl: "https://s3.amazonaws.com/avatech-static/empty.png",
                        tms: layer.tms == null ? false : layer.tms,
                        reuseTiles: true, updateInterval: 400
                    }
                    if (layer.retina != null) options.detectRetina = layer.retina;
                    if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution;
                    if (layer.subdomains) options.subdomains = layer.subdomains;

                    var _url = layer.template;
                    // if (layer.proxy) {
                    //     var _url = "http://localhost:4000/?url=" +
                    //         _url.substr(_url.indexOf("://") + 3);
                    // }

                    newBaseLayer = L.tileLayer(_url, options);
                }
                else if (layer.type == "WMS") {
                    var options = {
                        zIndex: 2,
                        opacity: 1,
                        //detectRetina: true,
                        maxNativeZoom: 16,
                        format: 'image/png',
                        errorTileUrl: "https://s3.amazonaws.com/avatech-static/empty.png",
                        reuseTiles: true, updateInterval: 400
                    };
                    if (layer.layers) options.layers = layer.layers;
                    else options.layers = 0;

                    if (layer.version) options.version = layer.version;

                    newBaseLayer = L.tileLayer.wms(layer.template, options);
                }
                else if (layer.type == "MAPBOX") {
                    var options = {};
                    if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution;
                   // newBaseLayer = L.mapbox.tileLayer(layer.id, options);

                    newBaseLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/{layerId}/{z}/{x}/{y}{retina}.png?access_token={accessToken}', {
                        accessToken: 'pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg',
                        layerId: layer.id,
                        retina: L.Browser.retina ? '@2x' : '',
                        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
                        reuseTiles: true, updateInterval: 400
                        //crossOrigin: true
                    });
                }

                // add new layer to map
                if (newBaseLayer) newBaseLayer.addTo(scope.map);
                // remove old layer from map (todo: should we keep it?)
                if (scope.baseLayer) scope.map.removeLayer(scope.baseLayer);
                // keep track of base layer on scope
                scope.baseLayer = newBaseLayer;

                // save to user settings
                scope.global.setUserSetting("defaultMap", layer.alias);
            }

             // re-render observation icons when zoom level is changed
            var detailedZoomMin = 9;
            scope.detailMode = true;
            scope.map.on('zoomend', function(e) {
                var zoom = scope.map.getZoom();

                if (!scope.detailMode && zoom >= detailedZoomMin) {
                    $log.debug("DETAIL MODE ON");
                    scope.detailMode = true;

                    // redraw icons
                    pruneCluster.RedrawIcons();
                    pruneCluster.ProcessView();

                    // hide heatmap
                    if (heatMap) heatMap.setOptions({ radius: 1, blur: 1, maxZoom: 20 });
                }
                else if (scope.detailMode && zoom < detailedZoomMin) {
                    $log.debug("DETAIL MODE OFF");
                    scope.detailMode = false;

                    // redraw icons
                    pruneCluster.RedrawIcons();
                    pruneCluster.ProcessView();

                    // show heatmap
                    if (heatMap) heatMap.setOptions({
                        radius: 10, blur: 15, maxZoom: zoom //(zoom + (zoom / 4))
                    });
                }

                // track zoom on mixpanel (to see which zoom levels are most popular)
                if (__PROD__) {
                    mixpanel.track("zoom", zoom);
                }
            });

            // keep track of location at cursor
            var terrainQueryTimer;
            scope.map.on('mousemove', function(e) {
                scope.$apply(function() {
                    scope.mapCursorLocation = e.latlng;
                    // query terrain layer
                    if (e.latlng && scope.terrainLayer) {
                        if (terrainQueryTimer) $timeout.cancel(terrainQueryTimer);
                        terrainQueryTimer = $timeout(function(){
                            scope.terrainLayer.getTerrainData(e.latlng.lat, e.latlng.lng)
                            .then(function(data) {
                                if (!data || !data.elevation) return;
                                scope.mapCursorElevation = data.elevation;
                                scope.$apply();
                            });
                        }, 50);
                    }
                });
                //scope.$apply();
            });
            scope.map.on('mouseout', function(e) {
                //$timeout(;
                scope.$apply(function(){ scope.mapCursorLocation = null; });
            });

            // set initial location and zoom level
            var defaultZoom = 13;
            var initialLocation = (!scope.global.user.location) ? [40.633052,-111.7111795] : [scope.global.user.location[1],scope.global.user.location[0]];
            scope.map.setView(initialLocation, defaultZoom);

            // set base layer after map has been initialized and layers have been loaded from server
            $q.all([
                mapLoaded,
                scope.mapLayers.loaded
            ]).then(function() {

                // get default layer based on location
                var defaultMap = "mbworld";
                var country = scope.global.user.country;
                if (country) {
                    if (country == "US") defaultMap = "mbus";
                    else if (country == "CA") defaultMap = "mbmetric";
                    else if (country == "FR") defaultMap = "mbfr";
                    else if (country == "DE") defaultMap = "mbde";
                    else if (country == "AT") defaultMap = "mbde";
                }
                var defaultLayer = scope.mapLayers.getLayerByAlias(defaultMap);

                // get saved default base layer
                var savedMap = scope.global.user.settings.defaultMap;
                var baseMap = scope.mapLayers.getLayerByAlias(savedMap);
                if (!baseMap) baseMap = defaultLayer;

                // setTimeout is needed to solve that bug where the zoom animation is incorrect
                setTimeout(function() {
                    scope.setBaseLayer(baseMap);
                });

                // load obs

            });


            // resize map when window is resized
            scope.$on('resizeMap', function() { 
                $timeout(function() { scope.map.invalidateSize(); });
                // weird hack to ensure correct new window size
                $timeout(function() { scope.map.invalidateSize(); }, 200);
            });

            // load profiles
            scope.loadingNew = false;
            scope.loadProfiles = function(showLoader) {
                var bounds = scope.map.getBounds();
                if (showLoader !== false) scope.loadingNew = true;

                // abort previous requests
                //if (scope.canceler) scope.canceler.resolve();
                //scope.canceler = $q.defer();

                // padding in pixels (so we don't get cut-off map points)
                var padding = 5;

                var point_ne = scope.map.latLngToContainerPoint(bounds._northEast);
                point_ne.y += padding; point_ne.x -= padding;
                point_ne = scope.map.containerPointToLatLng(point_ne);

                var point_sw = scope.map.latLngToContainerPoint(bounds._southWest);
                point_sw.y -= padding; point_sw.x += padding;
                point_sw = scope.map.containerPointToLatLng(point_sw);

                $http({
                    method: 'GET',
                    url: window.apiBaseUrl + "observations",
                    responseType: "json",
                    params: {
                        nelat: point_ne.lat, nelng: point_ne.lng, 
                        swlat: point_sw.lat, swlng: point_sw.lng, 
                        verbose: false
                    }
                })
                .then(function(res) {
                    scope.profiles = res.data;
                    plotObsOnMap();
                    searchObs();
                    scope.loadingProfiles = false;
                    scope.loadingNew = false;
                });
            }

            // handle loading of observations
            function initLoad() {
                scope.loadingProfiles = true;
                scope.loadProfiles(false);
                setTimeout(function(){
                    setInterval(function(){
                        scope.loadProfiles(false);
                    }, 60000);
                }, 60000);
            }

            function terrainLoad() {
                scope.terrainLayer.off('load', terrainLoad);
                scope.loadProfiles();
            }
            var moveTimer;
            scope.map.on('moveend', function() {
                if (scope.terrainLayer) {
                    scope.terrainLayer.off('load', terrainLoad);
                    // todo: hacky way to wait for terrain loading, need to find a better solution
                    if (moveTimer) $timeout.cancel(moveTimer);
                    moveTimer = $timeout(function() {
                        if(!scope.isTerrainLoaded) {
                            scope.terrainLayer.off('load', terrainLoad);
                            scope.terrainLayer.on('load', terrainLoad);
                        } 
                        else terrainLoad();

                    }, 200);
                }
                else scope.loadProfiles();
            });

            // make sure map loads properly
            $timeout(function(){
                scope.map.invalidateSize();
            });

            var hoverDelay;
            scope.$watch('hoverOb', function() {
                // debounce
                if (hoverDelay) $timeout.cancel(hoverDelay);
                hoverDelay = $timeout(function() {
                    scope.hideMapButtons = !!scope.hoverOb;
                    // if ob is specified, only show that ob
                    if (scope.hoverOb) {
                        angular.forEach(obsOnMap, function(marker) {
                            // hide
                            marker.filtered = true;
                            // show if matches filter
                            if (scope.hoverOb == marker.data.observation._id) marker.filtered = false;
                        });
                    }
                    // if no ob is specified, reset to former value
                    else {
                        angular.forEach(obsOnMap, function(marker) {
                            marker.filtered = marker.data.filtered;
                        });
                    }
                    pruneCluster.ProcessView();
                }, 50);
            }, true);


            // hack to hide zoom control on hideMapButtons
            scope.$watch("hideMapButtons", function() {
                $(mapElement).find(".leaflet-control-zoom").css("opacity", scope.hideMapButtons ? 0 : 1);
            });

            // ---------------------------------------------------
            // --------------------- TERRAIN ---------------------
            // ---------------------------------------------------

            // init terrain layer
            if (scope.showTerrain) {
                scope.overlayOpacity = .5;
                scope.terrainLayer = AvatechTerrainLayer({
                    zIndex: 999,
                    opacity: scope.overlayOpacity
                }).addTo(scope.map);

                scope.terrainLayer.on('loading', function() {
                    scope.isTerrainLoaded = false;
                });
                scope.terrainLayer.on('load', function() {
                    scope.isTerrainLoaded = true;
                });
                scope.terrainLayer.once('load', initLoad);

                setTimeout(function(){
                    scope.terrainLayer.setZIndex(99998);
                }, 100);

                scope.$watch('overlayOpacity', function() {
                    scope.terrainLayer.setOpacity(scope.overlayOpacity);
                });

                scope.map.on('viewreset', function () {
                    scope.terrainLayer.redrawQueue = [];
                    // workers.forEach(function (worker) {
                    //     worker.postMessage('clear');
                    // });
                });
                scope.map.on('zoomstart', function(e) {
                    scope.terrainLayer.redrawQueue = [];
                });

                // set terrain overlay
                scope.$watch('terrainOverlay', function() {
                    scope.terrainLayer.setOverlayType(scope.terrainOverlay);
                });

                // custom terrain visualization
                scope.elevationMax = Global.user.settings.elevation == 0 ? 8850 : 8850;
                scope.customTerrain = {
                    color: '#FFFF00',

                    elev_low: 0,
                    elev_high: scope.elevationMax,

                    slope_low: 0,
                    slope_high: 70,

                    aspect_low: 0,
                    aspect_high: 359,
                };
                var customTerrainTimer;
                scope.$watch('customTerrain', function() {
                    if (customTerrainTimer) clearTimeout(customTerrainTimer);
                    customTerrainTimer = setTimeout(function(){
                        if (scope.customTerrain.color.indexOf('#') == 0) scope.customTerrain.color = scope.customTerrain.color.substr(1);
                        scope.terrainLayer.setCustomParams(angular.copy(scope.customTerrain));
                    }, 30);
                }, true);
            }
            else initLoad();

            scope.capitalizeFirstLetter = function(str) {
                if (!str) return '';
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            // map grid overlay
            var gridOverlayLayer;
            scope.$watch('gridOverlay', function(newOverlay, oldOverlay) {
                if (newOverlay != oldOverlay && gridOverlayLayer) {
                    scope.map.removeLayer(gridOverlayLayer);
                    gridOverlayLayer = null;
                }
                if (newOverlay == 'utm') {
                    gridOverlayLayer = new graticule.UTMGridLayer();
                }
                else if (newOverlay == 'dd') {
                    //gridOverlayLayer = new LatLngGridLayer();
                }
                if (gridOverlayLayer) {
                    gridOverlayLayer.addTo(scope.map);
                    gridOverlayLayer.setZIndex(99999);
                }
            });

            // todo: duplicate
            scope.formatElev = function(val) {
                if (!Global.user.settings) return;
                // meters
                if (Global.user.settings.elevation == 0)
                    return val + " m";
                // feet
                else {
                    return Math.round(val * 3.28084).toFixed(0) + " ft";
                }
            }
            scope.formatTempRange = function(val1,val2) {
                if (!Global.user.settings) return;
                // meters
                if (Global.user.settings.elevation == 0)
                    return val1 + "-" + val2 + " m";
                // feet
                else {
                    return Math.round(val1 * 3.28084).toFixed(0) + "-" + Math.round(val2 * 3.28084).toFixed(0) + " ft";
                }
            }
            scope.formatDegSlider = function(val) {
                return val + "°"
            }
        }
    }
  };
});