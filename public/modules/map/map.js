angular.module('avatech.system').controller('MapController', function ($rootScope, $q, $scope, $state, $location, $modal, $http, $timeout, $compile, Profiles, Observations, Global, mapLayers, PublishModal, snowpitExport, $templateRequest, Restangular, ObSearch) {
    $scope.global = Global;

    $rootScope.isDemo = true;
    $scope.routeEditMode = true;

    if ($rootScope.isDemo) mixpanel.track("demo");

    $scope.formatters = snowpitExport.formatters;

    $scope._showPreviewPane;
    $scope.showPreviewPane = function(){ 
        // if ($state.current.data.modal) return $scope._showPreviewPane;
        // else {
        //     $scope._showPreviewPane = $state.current.data.showPreviewPane;
        //     return $scope._showPreviewPane;
        // } 
        return $state.current.data.showPreviewPane;
    };
    $scope._isFullScreen;
    $scope.isFullScreen = function() { 
        // if ($state.current.data.modal) return $scope._isFullScreen;
        // else {
        //     $scope._isFullScreen = $state.current.data.fullScreen; 
        //     return $scope._isFullScreen;
        // }
        return $state.current.data.fullScreen;
    };

    $scope.showBottomPane = function() {
        return $scope.routeEditMode;
    }
    $scope.showRoutePane = function() {
        return $scope.routeEditMode;
    }

    $scope.showList = true;

    $scope.mapLayers = mapLayers;

    // which list to show in side bar
    $scope.selectedList = 'published';
    $scope.selectList = function(listName, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.selectedList = listName;

        // clear selected profiles
        $scope.selectedProfiles = [];

        return false;
    }

    mixpanel.track("home");

    // pre-compile observation map popup
    $scope.compiledPopup;
    $templateRequest("/modules/map/observation-map-popup.html").then(function(templateHtml) {
        $scope.compiledPopup = $compile(angular.element(templateHtml));
    });

    // ======= SEARCH =======

    $scope.obSearch = new ObSearch();

    var searchObs = function() {
        // hide all markers
        angular.forEach(obsOnMap, function(marker) {
            marker.filtered = true;
            marker.data.filtered = true;
        });
        // iterate through obs and filter
        angular.forEach($scope.profiles,function(ob) {
            ob.filtered = true;
            if ($scope.obSearch.doSearch(ob)) {
                ob.filtered = false;
                obsOnMap[ob._id].filtered = false;
                obsOnMap[ob._id].data.filtered = false;
            }
        });
        pruneCluster.ProcessView();
    }
    // debounce search
    var _searchTimeout;
    $scope.$watch('obSearch',function() {
        if (_searchTimeout) $timeout.cancel(_searchTimeout);
        _searchTimeout = $timeout(function() {
            searchObs();
        }, 120);
    }, true);
    
    // filters for my observations (published / unpublished)

    $scope.my_unpublished = function(profile) {
        if (profile.type != $scope.type_unpublished) return false;
        var ok = (profile.published === false && profile.user._id == $scope.global.user._id);

        if ($scope.obSearch.search_text(profile) === false) ok = false;
        if ($scope.obSearch.search_elevation(profile) === false) ok = false;
        if ($scope.obSearch.search_aspect(profile) === false) ok = false;
        if ($scope.obSearch.search_slope(profile) === false) ok = false;

        return ok;
    }
    $scope.my_published = function(profile) {
        var ok = (profile.published === true && profile.user._id == $scope.global.user._id);

        if ($scope.obSearch.search_type(profile) === false) ok = false;
        if ($scope.obSearch.search_text(profile) === false) ok = false;
        if ($scope.obSearch.search_elevation(profile) === false) ok = false;
        if ($scope.obSearch.search_aspect(profile) === false) ok = false;
        if ($scope.obSearch.search_slope(profile) === false) ok = false;

        return ok;
    }

    $scope.type_unpublished = 'test';
    $scope.set_type_unpublished = function(type) {
        $scope.type_unpublished = type;
        // clear selected profiles
        $scope.selectedProfiles = [];
    }

    // formatters

    $scope.formatElev = function(val) {
        if (!Global.user.settings) return;
        // meters
        if (Global.user.settings.elevation == 0)
            return val + " m";
        // feet
        else {
            return Math.round(val * 3.28084).toFixed(0) + " ft";
        }
    }
    $scope.formatTempRange = function(val1,val2) {
        if (!Global.user.settings) return;
        // meters
        if (Global.user.settings.elevation == 0)
            return val1 + "-" + val2 + " m";
        // feet
        else {
            return Math.round(val1 * 3.28084).toFixed(0) + "-" + Math.round(val2 * 3.28084).toFixed(0) + " ft";
        }
    }
    $scope.formatDegSlider = function(val) {
        return val + "°"
    }

    // ======= END SEARCH =======

    // DRAFTS

    $scope.selectedProfiles = [];
    $scope.selectProfile = function(profile) {
        var index = $scope.getProfileSelectedIndex(profile);
        if (index > -1) {
            $scope.selectedProfiles.splice(index, 1);
            return false;
        }

        $scope.selectedProfiles.push(profile);

        return false;
    }
    $scope.getProfileSelectedIndex = function(profile) {
        for (var i = 0; i < $scope.selectedProfiles.length; i++) {
            if ($scope.selectedProfiles[i]._id == profile._id) { return i; break; }
        }
        return -1;
    }
    $scope.isProfileSelected = function(profile) {
        return ($scope.getProfileSelectedIndex(profile) != -1);
    }
    $scope.publishProfiles = function() {

        PublishModal.open({ initialSharing: null })
        .then(function (sharing) {

            angular.forEach($scope.selectedProfiles,function(profile) {

                profile.published = true;
                profile.sharingLevel = sharing.sharingLevel;
                profile.shareWithAvyCenter = sharing.shareWithAvyCenter;
                profile.sharedOrganizations = sharing.sharedOrganizations;
                profile.shareWithStudents = sharing.shareWithStudents;

                console.log(sharing);

                Observations.save(profile);

            });
    
            // clear selected profiles
            $scope.selectedProfiles = [];

        }, function () {
            // on dismiss
        });
    }

    // ---------------------------


    $scope.setBaseLayer = function(layer, clicked) {

        if (clicked) mixpanel.track("set base layer", { alias: layer.alias, name: layer.name });

        $scope.selectedBaseLayer = layer;

        var newBaseLayer;
        if (layer.type == "TILE") {
            var options = {
                zIndex: 2,
                opacity: 1,
                detectRetina: true,
                errorTileUrl: "https://s3.amazonaws.com/avatech-static/empty.png",
                tms: layer.tms == null ? false : layer.tms
            }
            if (layer.retina != null) options.detectRetina = layer.retina;
            if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution;
            if (layer.subdomains) options.subdomains = layer.subdomains;

            newBaseLayer = L.tileLayer(layer.template, options);
        }
        else if (layer.type == "WMS") {
            var options = {
                zIndex: 2,
                opacity: 1,
                //detectRetina: true,
                maxNativeZoom: 16,
                format: 'image/png',
                errorTileUrl: "https://s3.amazonaws.com/avatech-static/empty.png"
            };
            if (layer.layers) options.layers = layer.layers;
            else options.layers = 0;

            if (layer.version) options.version = layer.version;

          newBaseLayer = L.tileLayer.wms(layer.template, options);
        }
        else if (layer.type == "MAPBOX") {
            var options = {};
            if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution;
            newBaseLayer = L.mapbox.tileLayer(layer.id, options);
        }

        // add new layer to map
        if (newBaseLayer) {
            newBaseLayer.addTo($scope.map);
            //newBaseLayer.bringToFront();
        }
        // remove old layer from map (todo: should we keep it?)
        if ($scope.baseLayer) $scope.map.removeLayer($scope.baseLayer);

        // keep track of base layer on scope
        $scope.baseLayer = newBaseLayer;

        // save to user settings
        $scope.global.setUserSetting("defaultMap", layer.alias);
    }

    // init mapbox
    $scope.map = L.map('map', {
        zoomControl: false,
        minZoom: 2,
        maxZoom: 19,
        worldCopyJump: true
    });

    // disable scroll wheel zoom
    $scope.map.scrollWheelZoom.disable();

    // add markers layer
    $scope.mapLayer = L.mapbox.featureLayer().addTo($scope.map);

    // add zoom control to map
    //new L.Control.Zoom({ position: 'bottomright' }).addTo($scope.map);
    L.control.zoomslider({ position: 'bottomright' }).addTo($scope.map);

    // add scale control to map
    //new L.control.scale().addTo($scope.map);

    // map load event must be defined before we set initial zoom/location)
    var mapLoaded = $q.defer();
    $scope.map.on('load', function(e) { mapLoaded.resolve(); });

    // setup heatmap
    var heatMap;
    // var heatMap = L.heatLayer([], {
    //     radius: 10, blur: 15, 
    //     maxZoom: $scope.map.getZoom() 
    // }).addTo($scope.map);

    $scope.detailedZoomMin = 9;
    $scope.map.on('zoomend', function(e) {
        var zoom = $scope.map.getZoom();
        if (zoom < $scope.detailedZoomMin) {
            // show heatmap
            if (heatMap) heatMap.setOptions({
                radius: 10, blur: 15,
                maxZoom: (zoom + (zoom / 2))
            });
        }
        else {
            // hide heatmap
            if (heatMap) heatMap.setOptions({
                radius: 1, blur: 1, maxZoom: 20
            });
            // show markers
        }
    });

    // setup clustering  
    var pruneCluster = new PruneClusterForLeaflet(); //30, 20);
    // console.log(pruneCluster.Cluster.Margin);
    pruneCluster.Cluster.Size = 10; 
    $scope.map.addLayer(pruneCluster);

    // $scope.clustersize = 10;
    // $scope.$watch('clustersize', function() {
    //     pruneCluster.Cluster.Size = parseInt($scope.clustersize);
    //     //console.log(pruneCluster.Cluster.Margin);
    //     pruneCluster.ProcessView();
    //     heatMap.setOptions({
    //         radius: 10,
    //         blur: 15,
    //         maxZoom: $scope.map.getZoom()
    //     });
    // }, true)

    // render observation icons
    pruneCluster.PrepareLeafletMarker = function(leafletMarker, data) {
        // detailed mode
        if ($scope.map.getZoom() >= $scope.detailedZoomMin) {
            // set marker icon based on observation type
            leafletMarker.setIcon(L.divIcon({
                //className: 'count-icon-' + data.observation.type,
                className: 'count-icon-test',
                html: "",
                iconSize: [14, 14]
            }));

            // clear existing bindings
            leafletMarker.off('click');

            // show popup on click
            leafletMarker.on('click', function (e) {
                var existingPopup = leafletMarker.getPopup();
                // if popup doesn't exist, create it
                if (!existingPopup) {
                    // create scope for popup (true indicates isolate scope)
                    var newScope = $scope.$new(true);
                    newScope.profile = data.observation;
                    // bind scope to pre-compiled popup template
                    $scope.compiledPopup(newScope, function(clonedElement) {
                        // bind popup with compiled template html
                        leafletMarker.bindPopup(clonedElement[0], {
                            className: 'popup-' + data.observation.type
                        });
                        // remove default click event (to disable opening of popup on click)
                        // leafletMarker.off('click');

                        // // new click event should load profile
                        // leafletMarker.on('click', function(e) {
                        //     //e.originalEvent.preventDefault();

                        //     $location.path('/a/' + data.observation._id);
                        //     $scope.$apply();
                        // });
                    });
                    $scope.$apply();
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
                $scope.map.setView(e.latlng, 11, { animate: true });
            });

        }
    };

    // render observation cluster icons
    pruneCluster.BuildLeafletCluster = function(cluster, position) {
        console.log("BUILDING CLUSTER FOR ZOOM LEVEL " + $scope.map.getZoom());
        // create icon
        var icon = pruneCluster.BuildLeafletClusterIcon(cluster);

        // if in detailed mode, style icon accordingly
        if ($scope.map.getZoom() >= $scope.detailedZoomMin) {
            icon.options.className += " detailed";
        }
         
        // create marker
        var m = new L.Marker(position, { icon: icon });

          m.on('click', function() {
            // Compute the  cluster bounds (it's slow : O(n))
            var markersArea = pruneCluster.Cluster.FindMarkersInArea(cluster.bounds);
            var b = pruneCluster.Cluster.ComputeBounds(markersArea);

            if (b) {
              var bounds = new L.LatLngBounds(
                new L.LatLng(b.minLat, b.maxLng),
                new L.LatLng(b.maxLat, b.minLng));

              var zoomLevelBefore = pruneCluster._map.getZoom();
              var zoomLevelAfter = pruneCluster._map.getBoundsZoom(bounds, false, new L.Point(20, 20, null));

              // If the zoom level doesn't change
              if (zoomLevelAfter === zoomLevelBefore) {
                // Send an event for the LeafletSpiderfier
                pruneCluster._map.fire('overlappingmarkers', {
                  cluster: pruneCluster,
                  markers: markersArea,
                  center: m.getLatLng(),
                  marker: m
                });

                pruneCluster._map.setView(position, zoomLevelAfter);
              }
              else {
                pruneCluster._map.fitBounds(bounds);
              }
            }
          });
          m.on('mouseover', function() {
            //do mouseover stuff here
          });
          m.on('mouseout', function() {
            //do mouseout stuff here
          });

          return m;
    };

    // re-render observation icons when zoom level is changed
    $scope.map.on('zoomend', function(e) {
        // todo: only do this when zoom level change is significant ($scope.detailedZoomMin)
        // if ($scope.map.getZoom() == ($scope.detailedZoomMin - 1)) {
        //     console.log("DETAIL MODE OFF");
        // }
        // else if ($scope.map.getZoom() == $scope.detailedZoomMin) {
        //     console.log("DETAIL MODE ON");
        // }
        // pruneCluster.ProcessView();
        // pruneCluster.RedrawIcons();
        // $scope.$apply();

        // remove everything from map
        // pruneCluster.ProcessView();

        // var markerArray = [];
        // for(var i in obsOnMap) {
        //     markerArray.push(obsOnMap[i]);
        // } 
        //console.log("ZOOM END! " + $scope.map.getZoom());
        // pruneCluster.ProcessView();
        // plotObsOnMap();
        // for (var i = 0; i < pruneCluster.Cluster._markers.length; i++) {
        //     pruneCluster.Cluster._markers[i].data.forceIconRedraw = true;
        // }

        // not working...
        // obsOnMap = {};
        // pruneCluster.RemoveMarkers();
        // pruneCluster.ProcessView();
        // plotObsOnMap();
    });

    // keep track of location at cursor
    $scope.map.on('mousemove', function(e) {
        $scope.mapCursorLocation = e.latlng;
        $scope.$apply();
    });
    $scope.map.on('mouseout', function(e) {
        $scope.mapCursorLocation = null;
        $scope.$apply();
    });

    // set initial location and zoom level
    var defaultZoom = 13;
    var initialLocation = (!$scope.global.user.location) ? [40.633052,-111.7111795] : [$scope.global.user.location[1],$scope.global.user.location[0]];
    if ($rootScope.isDemo) initialLocation = [40.6050907,-111.6114807];
    $scope.map.setView(initialLocation, defaultZoom);

    // set base layer after map has been initialized and layers have been loaded from server
    $q.all([
        mapLoaded,
        $scope.mapLayers.loaded
    ]).then(function() {

        // get default layer based on location
        var defaultMap = "mbworld";
        var country = $scope.global.user.country;
        if (country) {
            if (country == "United States") defaultMap = "mbus";
            else if (country == "Canada") defaultMap = "mbmetric";
            else if (country == "France") defaultMap = "mbfr";
            else if (country == "Germany") defaultMap = "mbde";
            else if (country == "Austria") defaultMap = "mbde";
            else defaultMap = "mbworld";
        }
        var defaultLayer = $scope.mapLayers.getLayerByAlias(defaultMap);

        // get saved default base layer
        var savedMap = $scope.global.user.settings.defaultMap;

        var baseMap = $scope.mapLayers.getLayerByAlias(savedMap);
        if (!baseMap) baseMap = defaultLayer;

        // setTimeout is needed to solve that bug where the zoom animation is incorrect
        setTimeout(function(){
            $scope.setBaseLayer(baseMap);
        });

    });

    var hoverDelay;
    $scope.hoverProfile = function(profile) {
        // debounce
        if (hoverDelay) $timeout.cancel(hoverDelay);
        hoverDelay = $timeout(function(){
            $scope.hideMapButtons = !!profile;
            // if ob is specified, only show that ob
            if (profile) {
                angular.forEach(obsOnMap, function(marker) {
                    // hide
                    marker.filtered = true;
                    // show if matches filter
                    if (profile._id == marker.data.observation._id) marker.filtered = false;
                });
            }
            // if no ob is specified, reset to former value
            else {
                angular.forEach(obsOnMap, function(marker) {
                    marker.filtered = marker.data.filtered;
                });
            }
            pruneCluster.ProcessView();
        }, 100);
    };
    // hide zoom control on hideMapButtons
    $scope.$watch("hideMapButtons", function() {
        $(".leaflet-control-zoomslider").css("opacity", $scope.hideMapButtons ? 0 : 1);
    });

    $scope.$on('resizeMap', function() { 
        $timeout(function() { $scope.map.invalidateSize(); });
        $timeout(function() { $scope.map.invalidateSize(); }, 200);
    });

    $scope.$on('goToUnpublished', function() { 
        $scope.selectedList = 'my_unpublished';
        $scope.type_unpublished = 'test';
    });

    $scope.$on('profileLoaded', function(e, profile) {
        if (!profile || !profile.location) return;

        $timeout(function() {

            // close open popup
            var closebtn = $(".leaflet-popup-close-button");
            if (closebtn.length) closebtn[0].click();

            // pan to location
            $scope.map.panTo({ lat: profile.location[1], lng: profile.location[0] });

            $scope.mapLayer.eachLayer(function(marker) {
                
                marker.setIcon(L.divIcon({
                    className: "count-icon-" + marker.profile.type,
                    html: "",
                    iconSize: [14, 14]
                }));
                marker.setZIndexOffset(-1000);

                console.log(marker.profile.type + "," + profile.type);

                if(profile && marker.profile.type == profile.type && marker.profile._id == profile._id &&
                    marker.options && marker.options.icon && marker.options.icon.options &&
                    marker.options.icon.options.className) {

                    marker.setIcon(L.divIcon({
                        className: "count-icon-" + marker.profile.type + ' selected',
                        html: "",
                        iconSize: [14, 14]
                    }));
                    marker.setZIndexOffset(1000);
                }
            });

        });
    });


    $scope.loadMyProfiles = function() {
        $scope.myProfiles = Observations.observations;
    }

    // on map search select
    $scope.mapSearchSelect = function(location) {
        if (location.lat && location.lng)
            $scope.map.setView([location.lat,location.lng], 
                11, // zoom
                { animate: true});
    }

    // plot obs on map
    var obsOnMap = {};
    function plotObsOnMap() {
        angular.forEach($scope.profiles,function(profile) {
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

                var marker = new PruneCluster.Marker(profile.location[1], profile.location[0]);

                // associate profile with marker
                marker.data.observation = profile;
                
                // set observation type
                //marker.category = 0;

                // add to map
                pruneCluster.RegisterMarker(marker);
                // keep track of all markers placed on map
                obsOnMap[profile._id] = marker;

                // add to heatmap
                if (heatMap) heatMap.addLatLng([profile.location[1], profile.location[0]]);

            }
        });
        pruneCluster.ProcessView();
    }

    // load profiles
    $scope.loadingNew = false;
    $scope.loadProfiles = function(showLoader) {
        var bounds = $scope.map.getBounds();
        if (showLoader !== false) $scope.loadingNew = true;

        // abort previous requests
        if ($scope.canceler) $scope.canceler.resolve();
        $scope.canceler = $q.defer();

        // zoom level
        //var verbose = ($scope.map.getZoom() > 7); 

        // padding in pixels (so we don't get cut-off map points)
        var padding = 5;

        var point_ne = $scope.map.latLngToContainerPoint(bounds._northEast);
        point_ne.y += padding; point_ne.x -= padding;
        point_ne = $scope.map.containerPointToLatLng(point_ne);

        var point_sw = $scope.map.latLngToContainerPoint(bounds._southWest);
        point_sw.y -= padding; point_sw.x += padding;
        point_sw = $scope.map.containerPointToLatLng(point_sw);

        // get obs from server
        // todo: use 'since' ? use 'startDate'?
        Restangular.all("observations")
        .withHttpConfig({ timeout: $scope.canceler.promise })
        .getList({
            nelat: point_ne.lat, nelng: point_ne.lng, 
            swlat: point_sw.lat, swlng: point_sw.lng, 
            verbose: false
        })
        .then(function(obs) {

            var d = new Date().getTime();
            // todo: make this like the "observations" service? (i.e. addorreplace)
            $scope.profiles = obs;
            plotObsOnMap();
            searchObs();

            console.log("LOADED! " + (new Date().getTime() - d) + " ms");

            $scope.loadingProfiles = false;
            $scope.loadingNew = false;
        });
    }

    // handle loading of observations
    if ($rootScope.isDemo === false) {

        $scope.loadingProfiles = true;
        $scope.loadProfiles(false);
        $scope.loadMyProfiles();
        setTimeout(function(){
            setInterval(function(){
                $scope.loadProfiles(false);
                $scope.loadMyProfiles();
            }, 60000);
        }, 60000);

        $scope.map.on('moveend', function() {
            $timeout.cancel($scope.loadProfilesTimer);
            $scope.loadProfilesTimer = $timeout(function(){
                $scope.loadProfiles();
            }, 300);
        });

        $scope.map.on('zoomend', function() {
            $timeout.cancel($scope.loadProfilesTimer);
            $scope.loadProfilesTimer = $timeout(function(){
                $scope.loadProfiles();
            }, 300);
            mixpanel.track("zoom", $scope.map.getZoom());
        });

    }

    // make sure map loads properly
    $timeout(function(){
        $scope.map.invalidateSize();
    });

    $scope.href = function (path) {
      $location.path(path);
    };

    // ---------------------------------------------------
    // --------------------- TERRAIN ---------------------
    // ---------------------------------------------------

    // init terrain layer
    $scope.overlayOpacity = .5;
    var terrainLayer = $scope.terrainLayer = L.tileLayer.terrain({
        zIndex: 999,
        opacity: $scope.overlayOpacity,
        maxNativeZoom: 13
    });
    setTimeout(function(){
        terrainLayer.addTo($scope.map);
    }, 100);

    $scope.$watch('overlayOpacity', function() {
        terrainLayer.setOpacity($scope.overlayOpacity);
    });

    $scope.map.on('viewreset', function () {
        terrainLayer.redrawQueue = [];
        // workers.forEach(function (worker) {
        //     worker.postMessage('clear');
        // });
    });

    // set terrain overlay
    $scope.terrainOverlay;
    if ($rootScope.isDemo) $scope.terrainOverlay = "elevation";
    $scope.$watch('terrainOverlay', function(){
        terrainLayer.overlayType = $scope.terrainOverlay;
        terrainLayer.needsRedraw = true;
    });

    // sun exposure stuff

    $scope.sunHours = 17;
    var _debounce;
    $scope.$watch('sunHours', function() {
        if (_debounce) $timeout.cancel(_debounce);
        _debounce = $timeout(function(){
            $scope.sunDate = new Date(); 
            $scope.sunDate.setTime(Date.parse("2015 01 01"));
            $scope.sunDate.setHours($scope.sunHours);
            if ($scope.sunHours % 1 == .5) $scope.sunDate.setMinutes(30);

            terrainLayer.sunDate = angular.copy($scope.sunDate);
            terrainLayer.needsRedraw = true
        }, 50);

    },true);

    // $scope.map.on('click', function(e) {
    //     terrainLayer.initiateGetTerrainData(e.latlng.lat, e.latlng.lng);
    // });

    // custom terrain visualization
    $scope.customTerrain = {
        color: '#ffcc00',

        elev_low: 0,
        elev_high: $scope.elevationMax,

        slope_low: 0,
        slope_high: 70,

        aspect_low: 0,
        aspect_high: 359,
    };
    $scope.$watch('customTerrain', function() {
        if ($scope.customTerrain.color.indexOf('#') == 0) $scope.customTerrain.color = $scope.customTerrain.color.substr(1);

        terrainLayer.customParams = angular.copy($scope.customTerrain);
        terrainLayer.needsRedraw = true;

    }, true);

    $scope.capitalizeFirstLetter = function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ---------------------------------------------------
    // ----------------- ROUTE PLANNING ------------------
    // ---------------------------------------------------

    $scope._hoverOnLeg = function(index) {
        $scope.hoverOnLeg = index;
    }
    $scope._hoverOnPoint = function(index) {
        $scope.hoverOnPoint = index;
    }

    $scope.munterRate = {
        up: 4,
        down: 10
    }

    // temporary demo stuff
    // if ($rootScope.isDemo) {
    //     var markers = [
    //         {lat: 40.602484146302075, lng: -111.67482376098631},
    //         {lat: 40.59753131967109, lng: -111.6844367980957},
    //         {lat: 40.58254026662807, lng: -111.68289184570312},
    //         {lat: 40.60287514330199, lng: -111.66091918945312},
    //         {lat: 40.60261447888953, lng: -111.62675857543945},
    //         {lat: 40.597009948152916, lng: -111.63087844848633},
    //         {lat: 40.58645130010923, lng: -111.64392471313475},
    //         {lat: 40.57967203006171, lng: -111.65594100952148},
    //         {lat: 40.60105047106781, lng: -111.64976119995117},
    //         {lat: 40.590622817080714, lng: -111.65130615234375},
    //         {lat: 40.59635822803742, lng: -111.66864395141602},
    //         {lat: 40.58684239087908, lng: -111.67516708374023},
    //         {lat: 40.57458712662696, lng: -111.66641235351562},
    //         {lat: 40.57328324298059, lng: -111.64392471313475},
    //         {lat: 40.587103116788455, lng: -111.62847518920898},
    //         {lat: 40.57915051929101, lng: -111.61645889282227},
    //     ]
    //     for (var i = 0; i < markers.length; i++) {
    //         var newMarker = new L.marker(markers[i], { icon: new L.divIcon({
    //             className: 'flag-icon',
    //             html: '<i class="fa fa-flag"></i>',
    //             iconSize: [16, 16]
    //         }) } ).addTo($scope.map);

    //         newMarker.bindPopup("<div style='padding:10px;padding-right:12px;'><b style='color:red;font-weight:bold;font-size:17px;    margin-bottom: 6px; display: inline-block;'><i class='fa fa-flag'></i>&nbsp;&nbsp;RED FLAG ALERT</b><br/><ul style='margin-bottom: 2px;padding-left: 20px;font-size:16px;'><li>12 inches of new snow</li><li>Wind loading reported in area</ul></div>")
    //     }

    // }

    // --------------------------------

    var gridOverlayLayer;
    $scope.$watch('gridOverlay', function(newOverlay, oldOverlay) {
        if (newOverlay != oldOverlay && gridOverlayLayer) {
            $scope.map.removeLayer(gridOverlayLayer);
            gridOverlayLayer = null;
        }

        if (newOverlay == 'utm') {
            gridOverlayLayer = new UTMGridLayer();
        }
        else if (newOverlay == 'dd') {
            gridOverlayLayer = new LatLngGridLayer();
        }

        if (gridOverlayLayer) {
            //console.log("yooooooo")
            gridOverlayLayer.addTo($scope.map);
            gridOverlayLayer.setZIndex(99999);
        }
    })
    
    //

});