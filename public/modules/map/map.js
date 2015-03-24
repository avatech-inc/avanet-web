angular.module('avatech.system').controller('MapController', ['$rootScope', '$q', '$scope', '$state', '$location', '$modal', '$http', '$timeout','$compile','Profiles','Observations', 'Global', 'Restangular', 'mapLayers', 'PublishModal'
    , function ($rootScope, $q, $scope, $state, $location, $modal, $http, $timeout, $compile, Profiles, Observations, Global, Restangular, mapLayers, PublishModal) {
    $scope.global = Global;
    $scope.showPreviewPane = function(){ return ($state.current.name.indexOf("index.") != -1) };

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

    // ====== NEW VERSION MODAL ========

   // var modalInstance = $modal.open({
   //      templateUrl: '/modules/location-select-modal/location-select-modal.html',
   //      controller: 'LocationSelectModalController',
   //      backdrop: 'static',
   //      // resolve: {
   //      //     initialLocation: function () {
   //      //       return options.initialLocation
   //      //     }
   //      // }
   //  }).then(function (location) {

   //  });

    // ======= SEARCH =======

    $scope.elevationMax = Global.user.settings.elevation == 0 ? 8850 : 8850;
    var defaultPublisher = { orgs: null, outsideOrgs: true, me: true, students: false };
    $scope.searchQuery = {
        days: 365,

        elev_low: 0,
        elev_high: $scope.elevationMax,

        aspect_low: 0,
        aspect_high: 359,

        slope_low: 0,
        slope_high: 70,

        text: '',

        type: { profile: true, avy: true, test: true },

        publisher: angular.copy(defaultPublisher)
    }
    $scope._searchQuery = angular.copy($scope.searchQuery);

    // save search query in user settings
    $scope.$watch('searchQuery',function(){
        //todo
    }, true);

    $scope.isDefaultPublisher = function() {
        if (!$scope.searchQuery) return false;

        var publisher = $scope.searchQuery.publisher;
        if (
            (publisher.orgs == null || publisher.orgs.length == $scope.global.orgs.length) &&
            (publisher.outsideOrgs == true) &&
            (publisher.me == true) &&
            (publisher.students == false)
            )
            return true;
        else return false;
    }
    $scope.setDefaultPublisher = function() {
        $scope.searchQuery.publisher = angular.copy(defaultPublisher);
    }
    
    // debounce search
    var _searchTimeout;
    $scope.$watch('searchQuery',function(){
        if (_searchTimeout) $timeout.cancel(_searchTimeout);
        _searchTimeout = $timeout(function(){
            $scope._searchQuery = angular.copy($scope.searchQuery);
        },100);
    }, true);

    $scope.doSearch = function(profile){
        var ok = true;

        // only search through published profiles 
        if (profile.type == 'profile' && !profile.published) return false;
        // todo: for SP1 profiles make sure "published" field is added

        if ($scope.search_type(profile) === false) ok = false;
        if ($scope.search_date(profile) === false) ok = false;
        if ($scope.search_text(profile) === false) ok = false;
        if ($scope.search_publisher(profile) === false) ok = false;
        if ($scope.search_elevation(profile) === false) ok = false;
        if ($scope.search_aspect(profile) === false) ok = false;
        if ($scope.search_slope(profile) === false) ok = false;

        return ok;
    }

    // debounce plotting of map
    var _mapTimeout;
    $scope.$watch('filteredProfiles',function(){
        if (_mapTimeout) $timeout.cancel(_mapTimeout);
        _mapTimeout = $timeout(function() {

            var allMarkers = {};
            $scope.mapLayer.eachLayer(function(marker) { 
                allMarkers[marker._id] = marker;
            });

            var allProfileIds = [];
            angular.forEach($scope.filteredProfiles,function(profile) {
                allProfileIds.push(profile._id);
                var marker = allMarkers[profile._id];
                // if not on map, add to map
                if (!marker) {
                    $scope.addToMap(profile);
                }
                // if already on map, make it visible
                else {
                    marker.setOpacity(1);
                    marker._icon.style.pointerEvents = "";
                }
            });

            // if not in list, make invisible
            $scope.mapLayer.eachLayer(function(marker) {
                if(allProfileIds.indexOf(marker._id) == - 1 && marker.options && marker.options.icon && marker.options.icon.options &&
                    marker.options.icon.options.className) {

                    marker.setOpacity(0);
                    marker._icon.style.pointerEvents = "none";
                }
                // open popup automatically if new_id is specified (from querystring)
                if ($scope.new_id && marker._id == $scope.new_id) {
                    $scope.new_id = null;
                    marker.openPopup();
                }

            });

        },100);

    },true);

    var dateOnLoad = new Date();

    $scope.my_unpublished = function(profile) {
        if (profile.type != $scope.type_unpublished) return false;

        var ok = (profile.published === false && profile.user._id == $scope.global.user._id);

        if ($scope.search_date(profile) === false) ok = false;
        if ($scope.search_text(profile) === false) ok = false;
        if ($scope.search_elevation(profile) === false) ok = false;
        if ($scope.search_aspect(profile) === false) ok = false;
        if ($scope.search_slope(profile) === false) ok = false;

        return ok;
    }
    $scope.my_published = function(profile) {
        var ok = (profile.published === true && profile.user._id == $scope.global.user._id);

        if ($scope.search_type(profile) === false) ok = false;
        if ($scope.search_date(profile) === false) ok = false;
        if ($scope.search_text(profile) === false) ok = false;
        if ($scope.search_elevation(profile) === false) ok = false;
        if ($scope.search_aspect(profile) === false) ok = false;
        if ($scope.search_slope(profile) === false) ok = false;

        return ok;
    }

    $scope.search_text = function(val) {
        var needle = $scope.searchQuery.text.toLowerCase();
        if (needle.length < 3) return true;

        // build haystack
        var haystack = [];

        if (val.user.fullName) haystack.push(val.user.fullName.toLowerCase());
        if (val.metaData && val.metaData.location) haystack.push(val.metaData.location.toLowerCase());
        if (val.organization) haystack.push(val.organization.name.toLowerCase());

        // search through haystack
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i].length == 0) continue;
            if (haystack[i].indexOf(needle) != -1) return true;
        }
        return false;
    }

    $scope.search_publisher = function(val) {

        //if ($scope.isDefaultPublisher()) return true;

        var allowed = false;  

        // my orgs
        // console.log("orgs:");
        // console.log($scope.searchQuery.publisher.orgs);
        if ($scope.searchQuery.publisher.orgs) {
            // if no organization specified, return null
            if (!val.organization) allowed = false;

            if (val.organization 
                && !$scope.publisher_isOutsideOrg(val.organization._id)
                && $scope.searchQuery.publisher.orgs.indexOf(val.organization._id) != -1) allowed = true;
        } 
        else if (!$scope.searchQuery.publisher.orgs) allowed = true;

        // outside orgs
        if (!val.organization || (val.organization && $scope.publisher_isOutsideOrg(val.organization._id))) {
            // if ($scope.searchQuery.publisher.outsideOrgs == null) 
            //     $scope.searchQuery.publisher.outsideOrgs = true;
            allowed = $scope.searchQuery.publisher.outsideOrgs;
        } 
        //else if (!val.organization) allowed = $scope.searchQuery.publisher.outsideOrgs;

        // students
        if (val.user.student) {
            //console.log("student? " + ($scope.searchQuery.publisher.students));
            // if ($scope.searchQuery.publisher.students == null) 
            //     $scope.searchQuery.publisher.students = true;

            if (allowed === false && $scope.searchQuery.publisher.students) allowed = true;
            else if (allowed === true && !$scope.searchQuery.publisher.students) allowed = false;
        }

        // me
        if ($scope.searchQuery.publisher.me == null)
            $scope.searchQuery.publisher.me = true;

        if ($scope.searchQuery.publisher.me != null) {
            if (val.user._id == $scope.global.user._id) {
                //allowed = $scope.searchQuery.publisher.me;
                if (allowed === false && $scope.searchQuery.publisher.me) allowed = true;
                else if (allowed === true && !$scope.searchQuery.publisher.me) allowed = false;
            }
        }  

        return allowed;
    }
    $scope.publisher_isOutsideOrg = function(orgId) {
        for (var i = 0; i < $scope.global.orgs.length; i++) {
            //console.log($scope.global.orgs[i]._id == orgId);
            if ($scope.global.orgs[i]._id == orgId) return false;
        }
        return true;
    }
    $scope.publisher_isOrgSelected = function(orgId) {
        if (!$scope.searchQuery.publisher.orgs) return true;
        else return ($scope.searchQuery.publisher.orgs.indexOf(orgId) != -1);
    }
    $scope.publisher_selectOrg = function(orgId, exclusive) {
        // if (exclusive === true) {
        //     $scope.publisher_emptyQuery();
        //     $scope.searchQuery.publisher.orgs = [orgId]; return;
        // }

        // if empty, add all orgs
        if (!$scope.searchQuery.publisher.orgs) {
            $scope.searchQuery.publisher.orgs = [];
            angular.forEach($scope.global.orgs,function(org) { $scope.searchQuery.publisher.orgs.push(org._id) });
        }

        // if not in array, add
        if ($scope.searchQuery.publisher.orgs.indexOf(orgId) == -1)
            $scope.searchQuery.publisher.orgs.push(orgId);
        // if already in array, remove
        else {
            for (var i = 0; i < $scope.searchQuery.publisher.orgs.length; i++) {
                if ($scope.searchQuery.publisher.orgs[i] == orgId) { 
                    $scope.searchQuery.publisher.orgs.splice(i, 1); break;
                }
            }
        }
    }
    $scope.publisher_selectMyOrgs = function(exclusive) {
        // if all orgs selected, select none
        if ($scope.searchQuery.publisher.orgs == null 
            || ($scope.searchQuery.publisher.orgs && $scope.searchQuery.publisher.orgs.length == $scope.global.orgs.length)) {

            $scope.searchQuery.publisher.orgs = [];
        }
        // if none selected, add all orgs
        else {
            $scope.searchQuery.publisher.orgs = [];
            angular.forEach($scope.global.orgs,function(org) { $scope.searchQuery.publisher.orgs.push(org._id) });
        }
    }
    $scope.publisher_selectOutsideOrgs = function(exclusive) {
        // if (exclusive === true) {
        //     $scope.publisher_emptyQuery();
        //     $scope.searchQuery.publisher.outsideOrgs = true; return;
        // }
        if ($scope.searchQuery.publisher.outsideOrgs != null) $scope.searchQuery.publisher.outsideOrgs = !$scope.searchQuery.publisher.outsideOrgs;
        else $scope.searchQuery.publisher.outsideOrgs = false;
    }

    $scope.publisher_selectMe = function(exclusive) {
        // if (exclusive === true) {
        //     $scope.publisher_emptyQuery();
        //     $scope.searchQuery.publisher.me = true; return;
        // }
        if ($scope.searchQuery.publisher.me != null) $scope.searchQuery.publisher.me = !$scope.searchQuery.publisher.me;
        else $scope.searchQuery.publisher.me = false;
    }

    $scope.publisher_selectStudents = function(exclusive) {
        // if (exclusive === true) {
        //     $scope.publisher_emptyQuery();
        //     $scope.searchQuery.publisher.students = true; return;
        // }
        if ($scope.searchQuery.publisher.students != null) $scope.searchQuery.publisher.students = !$scope.searchQuery.publisher.students;
        else $scope.searchQuery.publisher.students = false;
    }

    $scope.publisher_emptyQuery = function() {
        $scope.searchQuery.publisher = { outsideOrgs: false, orgs: [], me: false, students: false };
    }

    $scope.type_select = function(type) {
        $scope.searchQuery.type[type] = !$scope.searchQuery.type[type];
    }
    $scope.type_unpublished = 'test';
    $scope.set_type_unpublished = function(type) {
        $scope.type_unpublished = type;
        // clear selected profiles
        $scope.selectedProfiles = [];
    }

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

                // get profile from array
                // todo: clean this up, not very angular-y...
                // this needs to be done since updating myProfiles replaces the references
                // should really implement a central store like in the app, with the same
                // replace-or-add type functionality
                // for (var i = 0; i < $scope.myProfiles.length; i++) {
                //     var _profile = $scope.myProfiles[i];
                //     if (_profile.type == profile.type && _profile._id == profile._id)  profile = _profile;
                // }

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

    $scope.search_type = function(val) { 
        // var d = new Date();
        // d.setDate(d.getDate() - $scope._searchQuery.days);

        // if (new Date(val.date) > d) return true;
        // else return false;
        return ($scope.searchQuery.type[val.type]);
    }

    $scope.search_date = function(val) { 
        var d = new Date();
        d.setDate(d.getDate() - $scope._searchQuery.days);

        if (new Date(val.date) > d) return true;
        else return false;
    }

    $scope.search_elevation = function(val) { 
        // if full range is selected, return everything (including profiles without elevation specified)
        if ($scope._searchQuery.elev_low == 0 && $scope._searchQuery.elev_high == $scope.elevationMax) {
            return true;
        }
        else if ((val.metaData && val.metaData.elevation) || val.elevation) {
            var elevation;
            if (val.metaData && val.metaData.elevation) elevation = val.metaData.elevation;
            else elevation = val.elevation;

            if (elevation >= $scope._searchQuery.elev_low &&
                elevation <= $scope._searchQuery.elev_high ) return true;
            else return false;
        }
        else return false;
    }
    $scope.search_aspect = function(val) { 
        // if full range is selected, return everything (including profiles without aspect specified)
        if ($scope._searchQuery.aspect_low == 0 && $scope._searchQuery.aspect_high == 359) {
            return true;
        }
        else if ((val.metaData && val.metaData.aspect) || val.aspect) {
            var aspect;
            if (val.metaData && val.metaData.aspect) aspect = val.metaData.aspect;
            else aspect = val.aspect;
            
            if ($scope._searchQuery.aspect_low > $scope._searchQuery.aspect_high) {
                if (aspect >= $scope._searchQuery.aspect_low ||
                    aspect <= $scope._searchQuery.aspect_high ) return true;
            }
            else if (aspect >= $scope._searchQuery.aspect_low &&
                    aspect <= $scope._searchQuery.aspect_high ) return true;
            
            return false;
        }
        else return false;
    }
    $scope.search_slope = function(val) { 
        // if full range is selected, return everything (including profiles without slope specified)
        if ($scope._searchQuery.slope_low == 0 && $scope._searchQuery.slope_high == 70) {
            return true;
        }
        else if ((val.metaData && val.metaData.slope) || val.slope) {
            var slope;
            if (val.metaData && val.metaData.slope) slope = val.metaData.slope;
            else slope = val.slope;

            if (slope >= $scope._searchQuery.slope_low &&
                slope <= $scope._searchQuery.slope_high ) return true;
            else return false;
        }
        else return false;
    }

    $scope.clearSearchElevation = function($event) {
        $event.preventDefault();
        $scope._searchQuery.elev_low = 0; 
        $scope._searchQuery.elev_high = 9000;
        $scope.searchQuery = angular.copy($scope._searchQuery);
        return false;
    }
    $scope.clearSearchAspect = function($event) {
        $event.preventDefault();
        $scope._searchQuery.aspect_low = 0;
        $scope._searchQuery.aspect_high = 359;
        $scope.searchQuery = angular.copy($scope._searchQuery);
        return false;
    }
    $scope.clearSearchSlope = function($event) {
        $event.preventDefault();
        $scope._searchQuery.slope_low = 0;
        $scope._searchQuery.slope_high = 70;
        $scope.searchQuery = angular.copy($scope._searchQuery);
        return false;
    }

    $scope.formatTemp = function(val) {
        // todo: temp while settings issue is figured out
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
        // todo: temp while settings issue is figured out
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
    $scope.setAspect = function(deg) {
        if ($scope._searchQuery.aspect_high < deg) $scope._searchQuery.aspect_high = deg;
        else if ($scope._searchQuery.aspect_low > deg) $scope._searchQuery.aspect_low = deg;
        else if (deg > $scope._searchQuery.aspect_low) $scope._searchQuery.aspect_low = deg;
        else if (deg < $scope._searchQuery.aspect_high) $scope._searchQuery.aspect_high = deg;
    }

    // ======= END SEARCH =======


    $scope.setBaseLayer = function(layer) {

        // remove old base layer
        //if ($scope.previousLayer) $scope.map.removeLayer($scope.previousLayer);

        $scope.selectedBaseLayer = layer;

        var newBaseLayer;
        if (layer.type == "TILE") {
        // L.tileLayer.wms("http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en", {
            var options = {
               // layers: ['limits','vegetation','builtup_areas','designated_areas','hydrography','hypsography','water_saturated_soils','landforms','constructions','water_features','road_network','railway','populated_places','structures','power_network','boundaries','feature_names'], 
              //  format: "image/png",
               // version: "1.1.1",
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
            newBaseLayer = L.mapbox.tileLayer(layer.id);
        }

        // add new layer to map
        if (newBaseLayer) {
            newBaseLayer.addTo($scope.map);
            newBaseLayer.bringToFront();
        }

        // save to user settings
        $scope.global.setUserSetting("defaultMap", layer.alias);

        //if ($scope.baseLayer) $scope.previousLayer = $scope.baseLayer;
        if ($scope.baseLayer) $scope.map.removeLayer($scope.baseLayer);
        $scope.baseLayer = newBaseLayer;
    }

    // init mapbox
    //$scope.map = L.mapbox.map('map', '', { //andrewsohn.e9ef13ee
    $scope.map = L.map('map', {
        zoomControl: false,
        worldCopyJump: true,
        minZoom: 2
    });
    $scope.map.on('load', function(e) {
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
        var defaultLayer = getLayerByAlias(defaultMap);

        // get saved default base layer
        var savedMap = $scope.global.user.settings.defaultMap;

        var baseMap = getLayerByAlias(savedMap);
        if (!baseMap) baseMap = defaultLayer;
        if (baseMap) $scope.setBaseLayer(baseMap);
    });

    function getLayerByAlias(alias) {
        var layer;
        for (var i = 0; i < $scope.mapLayers.baseLayers.terrain.length; i++) {
            var l = $scope.mapLayers.baseLayers.terrain[i];
            if (l.alias == alias) layer = l;
        }
        for (var i = 0; i < $scope.mapLayers.baseLayers.aerial.length; i++) {
            var l = $scope.mapLayers.baseLayers.aerial[i];
            if (l.alias == alias) layer = l;
        }
        return layer;
    }


    // disable scroll wheel zoom
    $scope.map.scrollWheelZoom.disable();

    // add markers layer
    $scope.mapLayer = L.mapbox.featureLayer().addTo($scope.map);

    // add zoom control to map
    new L.Control.Zoom({ position: 'bottomright' }).addTo($scope.map);

    // add scale control to map
    //new L.control.scale().addTo($scope.map);


    $scope.addToMap = function(profile) {
        if (!profile.location) return;

        var point = [profile.location[1],profile.location[0]];

        // todo: check if point is within map bounds

        var marker = L.marker(point, {
            type: profile.type,
            icon: L.divIcon({
                className: 'count-icon-' + profile.type,
                // Define what HTML goes inside each marker.
                html: "",
                // Set a markers width and height.
                iconSize: [14, 14]
            })
        });


        var html = '<div>';

        html += '<div class="popup-title">';
        if (profile.type == 'profile') html += 'Snowpit';
        else if (profile.type == 'test') html += 'SP1 Profile';
        else if (profile.type == 'avy') html += 'Avalanche';
        html += '</div>';

        html += '<a href=\'/{{ profile.type.substr(0,1) }}/{{ profile._id }}\' style="color:#222;">'

        html += '<div class="popup-content">';

        html += "<div><i style='margin-right:3px;' class='fa fa-user'></i>  {{profile.user.fullName}} <span ng-show='profile.user.student' style='color: #888;'>&nbsp;&nbsp;<i class='fa fa-graduation-cap'></i>&nbsp;<span style='font-size:8px;position: relative;bottom:1px;'>STUDENT</span></span></div>";

        html += "<div ng-show='profile.organization'><i style='margin-right:3px;' class='fa fa-group'></i>  {{ profile.organization.name }}</div>";

        html += "<div><i style='margin-right:3px;' class='fa fa-clock-o'></i>  {{profile.date | date:'M/d/yy'}} {{profile.time | date:'h:mm a'}}</div>";

        if (profile.type == 'profile' || profile.type == 'test') {
            html += "<div><i style='margin-right:3px;' class='fa fa-location-arrow'></i>  {{ profile.metaData.location }}</div>";
        }
        else if (profile.type == 'avy') {
            html += "<div><i style='margin-right:3px;' class='fa fa-location-arrow'></i>  {{ profile.locationName }}</div>";
        }

        if (profile.type == 'profile') {
            html += '<canvas profile="profile" width="360" height="320" style="margin-top:5px;margin-bottom:-4px;width:180px;height:160px;background:#eee;"></canvas>';
        }
        else if (profile.type == 'test') {
            html += '<canvas graph="profile.rows_small" width="360" height="320" style="margin-top:5px;margin-bottom:-4px;width:180px;height:160px;background:#eee;"></canvas>';
        }
        else if (profile.type == 'avy') {
            html += "<div ng-show='profile.photos.length' style='text-align:center;background:#eee;width:97%;margin-top:4px;''>"
            html += "<img src='{{ profile.photos[0].url }}' style='max-height:140px;max-width:100%;margin:auto;' />";
            html += "</div>";
        }

        html += "<div style='margin-top:6px;'><button class='btn btn-sm btn-default' style='width:100%;'>More Details&nbsp;&nbsp;<i class='fa fa-angle-right'></i></button>";

        html += "</div>";
        html += "</a>";
        html += "</div>";

        var linkFunction = $compile(angular.element(html));
        var newScope = $scope.$new();
        newScope.profile =  profile;
        var str = linkFunction(newScope)[0];

        marker.bindPopup(str, {
            className: 'popup-' + profile.type,
            minWidth: 180,
        });
        marker._id = profile._id;

        marker.addTo($scope.mapLayer);
    }

    $scope.closeThis = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        var el = $($event.target).closest(".open");
        el.data().$dropdownController.toggle()
    };

    $scope.hoverProfile = function(profile) {
        $scope.mapLayer.eachLayer(function(marker) {

            if (marker.options.icon.options.className.indexOf("selected") == -1) {
                marker.setIcon(L.divIcon({
                    className: "count-icon-" + marker.options.type,
                    html: "",
                    iconSize: [14, 14]
                }));
                marker.setZIndexOffset(-1000);
            }

            if(profile && marker.options.type == profile.type && marker._id == profile._id && 

                marker.options.icon && 
                marker.options.icon.options &&
                marker.options.icon.options.className && 
                marker.options.icon.options.className.indexOf("selected") == -1) {

                marker.setIcon(L.divIcon({
                    className: "count-icon-" + marker.options.type + ' active',
                    html: "",
                    iconSize: [14, 14]
                }));
                marker.setZIndexOffset(1000);
            }

        });
    }


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
                    className: "count-icon-" + marker.options.type,
                    html: "",
                    iconSize: [14, 14]
                }));
                marker.setZIndexOffset(-1000);

                console.log(marker.options.type + "," + profile.type);

                if(profile && marker.options.type == profile.type && marker._id == profile._id &&
                    marker.options && marker.options.icon && marker.options.icon.options &&
                    marker.options.icon.options.className) {

                    marker.setIcon(L.divIcon({
                        className: "count-icon-" + marker.options.type + ' selected',
                        html: "",
                        iconSize: [14, 14]
                    }));
                    marker.setZIndexOffset(1000);
                }
            });

        });
    });
    

// simple lat/lng distance sorting
function geoSort(locations, pos) {
  function dist(l) {
    return (l.lat - pos.lat) * (l.lat - pos.lat) +
      (l.lng - pos.lng) * (l.lng - pos.lng);
  }
  locations.sort(function(l1, l2) {
    return dist(l1) - dist(l2);
  });
}
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var deg2rad = function(deg) {
      return deg * (Math.PI/180)
    }
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  //Math.asin(Math.sqrt(a))
  var d = R * c; // Distance in km
  return d;
}
var levDist = function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
}

$scope.geo = { query: '', results: [] }
$scope.geoSearch = function() {
    console.log($scope.geo.query);

    // clear current results
    $scope.geo.results = [];
    $scope.geo.query = $scope.geo.query.trim();
    if ($scope.geo.query == "") return;
    //codeAddress($scope.geo.geoQuery);

    $.getJSON("https://ba-secure.geonames.net/searchJSON?q=" + $scope.geo.query + "&countryBias=US&featureClass=A&featureClass=L&featureClass=P&featureClass=T&featureClass=V&featureClass=S&style=FULL&maxRows=20&username=avatech")
    .success(function(data, status, headers, config) {

    // geoSort(data.geonames, 40.633052, -111.5658795);

    var states = {
        // primary
        "CO": 200,
        "UT": 200,
        "WA": 100,
        "NV": 100,
        "MT": 100,
        "WY": 100,
        "AK": 100,
        "CA": 100,
        "ID": 100,
        "OR": 100,

        // secondary
        "NH": 50,
        "ME": 50,
        "NM": 30,
        "VT": 20,
        "NY": 20,

        // mostly flat
        "AZ": 10,
        "MA": 10,
        "MN": 10,
        "NJ": 10,
        "NC": 10,
        "ND": 10,
        "PA": 10,
        "SD": 10,
        "TN": 10,
        "VA": 10,
        "WV": 10,
        "MI": 10,

        // flat places
        "NE": 0,
        "AL": 0,
        "AS": 0,
        "AR": 0,
        "CT": 0,
        "DE": 0,
        "DC": 0,
        "FM": 0,
        "FL": 0,
        "GA": 0,
        "GU": 0,
        "HI": 0,
        "IL": 0,
        "IN": 0,
        "IA": 0,
        "PR": 0,
        "RI": 0,
        "SC": 0,
        "PW": 0,
        "MP": 0,
        "MH": 0,
        "KS": 0,
        "MD": 0,
        "OH": 0,
        "OK": 0,
        "VI": 0,
        "MS": 0,
        "MO": 0,
        "TX": 0,
        "WI": 0,
        "KY": 0,
        "LA": 0,
    }

    // remove
    var exlcude = ['church','cemetery','mine(s)','tower','golf course','island','mall','museum','library'];
    data.geonames = data.geonames.filter(function(a) {
        var code = a.fcodeName;
        console.log(a.countryCode);
        if (exlcude.indexOf(code) == -1 && a.countryCode != undefined) return a;
    });

    // // sort by location weight
    // for (var i = 0; i < data.geonames.length; i++) {
    //     var result = data.geonames[i];
    //     result.weight = states[result.adminCode1.trim().toUpperCase()];
    //     if (result.weight == null) { console.log("NOT FOUND (" + result.adminCode1 + ")"); result.weight = 100; }
    // }

    //   data.geonames.sort(function(a,b) {
    //     return b.weight - a.weight;
    //   });
    
    // filter out only the "flat" areas
      // data.geonames = data.geonames.filter(function(a) {
      //   return a.weight > 0;
      // });

        // merge "neighbors"
        var merged = [];
        for (var i = 0; i < data.geonames.length; i++) {
            var neighbors = [];
            var result = data.geonames[i];
            // go through others
            (function() {
                for (var j = 0; j < data.geonames.length; j++) {
                    var result2 = data.geonames[j];
                    if (result2.merged) continue;
                    //if (result == result2) continue;
                    var distance = getDistanceFromLatLonInKm(
                        parseFloat(result.lat),
                        parseFloat(result.lng),
                        parseFloat(result2.lat),
                        parseFloat(result2.lng)
                    );
                    //console.log(distance);
                    //console.log(result2.merged);
                    if (distance < 2) {
                        result.merged = true;
                        result2.merged = true;
                        neighbors.push(result2);
                    }
                }
            })();

            //console.log(neighbors.length);
            if (neighbors.length != 0) merged.push(neighbors);
            //break;
        }

        // find the "best" of the merged
        var finalResults = [];
        for (var i = 0; i < merged.length; i++) {
            var _merged = merged[i];
            if (_merged.length == 1) { finalResults.push(_merged[0]); continue; }

            console.log("----------------------- " + i);
            // for (var m = 0; m < _merged.length; m++) {
            //     var result = _merged[m];
            //     var name = result.name.toLowerCase().trim();
            //     var query = $scope.geo.query.toLowerCase().trim();

            //     // if (name == query) result.quality = 3;
            //     // else if (name.indexOf(query) == 0) result.quality = 2;
            //     // else if (name.indexOf(query) != -1) result.quality = 1;
            //     // else result.quality = 0;

            //     //if (name == query) result.quality = 5;
            //     //else 
            //     result.quality = result.score;
            // }

            // sort by quality
            _merged.sort(function(a,b) { return b.score - a.score });

            for (var m = 0; m < _merged.length; m++) {
                var result = _merged[m];
                console.log(result.name + ": " + result.quality + " / " + result.score);
            }

            // pick first
            finalResults.push(_merged[0]);
        }


    // sort final results by quality
    //finalResults.sort(function(a,b) { return b.score - a.score });

      data.geonames = data.geonames.slice(0,8);
      //finalResults = finalResults.slice(0,8);

      $scope.geo.results = data.geonames;
      $scope.$apply();
    });
}
$scope.focusLocationSearchInput = function() {
    console.log("!");
    $(".location-search-input").focus();
}
$scope.goTo = function(result) {
    console.log(result);
    //$scope.map.panTo([parseFloat(result.lat),parseFloat(result.lng)]);
    $scope.map.setView([parseFloat(result.lat),parseFloat(result.lng)], 12,{ animate: true});
}

    // disable this for demo
    if ($location.search().lat && $location.search().lng) {
        $scope.new_id = $location.search()["_"];
        try {
            $scope.map.setView([$location.search().lat,$location.search().lng], 15);
            $location.search('lat', null);
            $location.search('lng', null);
            $location.search('_', null);
        }
        catch(e) { console.log(e); }
    }
    else if (!$scope.global.user.location) $scope.map.setView([40.633052,-111.7111795], 12); //8
    else $scope.map.setView([$scope.global.user.location[1],$scope.global.user.location[0]], 12); //8

    $scope.loadMyProfiles = function() {

        //Observations
        $scope.myProfiles = Observations.observations;

        // $http.get('/v1/profiles/mine', {}
        // // { params: { 
        // //     nelat: bounds._northEast.lat, 
        // //     nelng: bounds._northEast.lng, 
        // //     swlat: bounds._southWest.lat, 
        // //     swlng: bounds._southWest.lng, 
        // //   }, 
        // //   timeout: $scope.canceler.promise
        // // }
        // ).success(function(profiles) {
        //     $scope.myProfiles = profiles;
        // });
    }

    // load profiles
    $scope.loadingNew = false;
    $scope.loadProfiles = function(showLoader) {
        var bounds = $scope.map.getBounds();
        if (showLoader !== false) $scope.loadingNew = true;

        // abort previous profile requests
        if ($scope.canceler) $scope.canceler.resolve();
        $scope.canceler = $q.defer();
        $http.get('/v1/profiles', 
        { params: { 
            nelat: bounds._northEast.lat, 
            nelng: bounds._northEast.lng, 
            swlat: bounds._southWest.lat, 
            swlng: bounds._southWest.lng, 
          }, 
          timeout: $scope.canceler.promise
        }).success(function(profiles) {
            $scope.loadingProfiles = false;
            $scope.profiles = profiles;
            $scope.loadingNew = false;
            $timeout(function() { $scope.$apply(); });
        });

        // Profiles.query({ 
        //     nelat: bounds._northEast.lat, 
        //     nelng: bounds._northEast.lng, 
        //     swlat: bounds._southWest.lat, 
        //     swlng: bounds._southWest.lng, 
        // }, function(profiles) {
        //     $scope.loadingProfiles = false;
        //     $scope.profiles = profiles;
        //     console.log("loaded!");
        //     console.log(profiles.length);

        //     // sync with new

        // });

    }
    $scope.loadingProfiles = true;
    $scope.loadProfiles(false);
    $scope.loadMyProfiles();
    setTimeout(function(){
        setInterval(function(){
            $scope.loadProfiles(false);
            $scope.loadMyProfiles();
        }, 30000);
    }, 30000);

    $scope.map.on('moveend', function() {
        $timeout.cancel($scope.loadProfilesTimer);
        $scope.loadProfilesTimer = $timeout(function(){
            $scope.loadProfiles();
        },10);
    });

    $scope.map.on('zoomstart', function() {
        $timeout.cancel($scope.loadProfilesTimer);
        $scope.loadProfilesTimer = $timeout(function(){
            $scope.loadProfiles();
        },10);
        
        // here's where you decided what zoom levels the layer should and should
        // not be available for: use javascript comparisons like < and > if
        // you want something other than just one zoom level, like
        // (map.getZoom > 10)

        var zoom = $scope.map.getZoom();
        console.log(zoom);
        // if (zoom < 9) {

        //     //$scope.mapLayer.setFilter(function() { return false; });
        //     //console.log($scope.mapLayer);
        //     //$scope.mapLayer.setOpacity(0);
        //     $scope.mapLayer.eachLayer(function(marker) {
        //         //if(allProfileIds.indexOf(marker._id) == - 1) {
        //             //$scope.mapLayer.removeLayer(marker);
        //             //marker.setOpacity(.2);
        //             console.log(marker);
        //             //marker._icon.className += " tiny";
        //             //marker._icon.iconSize = [10, 10];
        //             marker.options.icon.options.iconSize = [10, 10];
        //         //}
        //         // // open popup automatically if new_id is specified (from querystring)
        //         // if ($scope.new_id && marker._id == $scope.new_id) {
        //         //     $scope.new_id = null;
        //         //     marker.openPopup();
        //         // }

        //     });
        // }

        // else if (zoom >= 8) {

        // }

        // if (map.getZoom() === 13) {
        //     // setFilter is available on L.mapbox.featureLayers only. Here
        //     // we're hiding and showing the default marker layer that's attached
        //     // to the map - change the reference if you want to hide or show a
        //     // different featureLayer.
        //     // If you want to hide or show a different kind of layer, you can use
        //     // similar methods like .setOpacity(0) and .setOpacity(1)
        //     // to hide or show it.
        //     map.featureLayer.setFilter(function() { return true; });
        // } else {
        //     map.featureLayer.setFilter(function() { return false; });
        // }
    });

    // terrain shading

     //http://basemap.nationalmap.gov/arcgis/services/USGSShadedReliefOnly/MapServer/WMSServer
    // L.tileLayer("http://s3-us-west-1.amazonaws.com/ctrelief/relief/{z}/{x}/{y}.png", {
    //     layers: 0,
    //     zIndex: 3,
    //     opacity: .2,
    //     detectRetina: true,
    //     maxZoom: 16
    // }).addTo($scope.map);



    // wasatch powderkeg

    var track_1 = [
      [40.582187057,-111.571730018],
      [40.580652952,-111.570289969],
      [40.579522967,-111.569885969],
      [40.579681993,-111.569844961],
      [40.578956008,-111.570250034],
      [40.578500032,-111.570132017],
      [40.575981975,-111.569679022],
      [40.575817943,-111.569776058],
      [40.575595021,-111.569841981],
      [40.574851990,-111.569785953],
      [40.574823976,-111.570476055],
      [40.574090004,-111.571429968],
      [40.573791027,-111.571488023],
      [40.573827028,-111.571509957],
      [40.573802948,-111.571499944],
      [40.573482990,-111.571406960],
   ];

    var track_2 = [
      [40.591484547,-111.562074423],
      [40.591554642,-111.562068701],
      [40.591701269,-111.562068701],
      [40.591823459,-111.562196970],
      [40.591921210,-111.562357306],
      [40.592043400,-111.562485576],
      [40.592165589,-111.562613845],
      [40.592263341,-111.562806249],
      [40.592409968,-111.562870383],
      [40.592548966,-111.562960029],
      [40.592828035,-111.563261986],
      [40.593400002,-111.563552976],
      [40.593703032,-111.563586950],
      [40.593734980,-111.563691020],
      [40.593904972,-111.564015031],
      [40.594128966,-111.564414024],
      [40.594459057,-111.564869046],
      [40.594882011,-111.564767957],
      [40.594823003,-111.564622045],
      [40.594766021,-111.564551950],
      [40.594974041,-111.564813972],
      [40.595309019,-111.565256953],
      [40.595514059,-111.565639973],
      [40.595718980,-111.565899968],
      [40.595636010,-111.565543056],
      [40.595520973,-111.565565944],
      [40.595638037,-111.565585971],
      [40.595801950,-111.565796018],
      [40.595769048,-111.565577984],
      [40.596037984,-111.565776944],
      [40.596518993,-111.565945983],
      [40.596878052,-111.566501021],
      [40.597203016,-111.567152023],
      [40.597390056,-111.567715049],
      [40.597344041,-111.567783952],
      [40.597432971,-111.567862988],
      [40.597499013,-111.568289995],
      [40.597795963,-111.568645954],
      [40.598284006,-111.569095016],
      [40.598708034,-111.569700956],
      [40.599131942,-111.570230961],
      [40.599660993,-111.570978999],
      [40.600139022,-111.571746945],
      [40.600211024,-111.572255969],
      [40.600211978,-111.572245002],
      [40.600474000,-111.572705030],
      [40.601479292,-111.573565006],
   ];

    var track_3 = [
      [40.592043400,-111.595931768],
      [40.591921210,-111.595803499],
      [40.591945648,-111.595611095],
      [40.591970086,-111.595418692],
      [40.592067838,-111.595258355],
      [40.592056990,-111.595039964],
      [40.592147946,-111.595057964],
      [40.592035055,-111.594957948],
      [40.592424035,-111.594859958],
      [40.592290998,-111.594560027],
      [40.592442036,-111.594452024],
   ];

    var track_4 = [
      [40.592442036,-111.594452024],
      [40.592582941,-111.594275951],
      [40.592743039,-111.593973994],
      [40.592522979,-111.594040990],
      [40.592751980,-111.593765020],
      [40.592826009,-111.593734026],
      [40.592808008,-111.593667030],
      [40.592843056,-111.593580961],
      [40.592743993,-111.593301058],
      [40.592640042,-111.593319058],
      [40.592962980,-111.593278050],
      [40.592844963,-111.593060017],
   ];

    var track_5 = [
      [40.593678951,-111.598026752],
      [40.593613625,-111.598155499],
      [40.593580961,-111.598305702],
      [40.593548298,-111.598455906],
      [40.593531966,-111.598584652],
      [40.593564630,-111.598713398],
      [40.593629956,-111.598842144],
      [40.593727946,-111.598906517],
      [40.593825936,-111.598927975],
      [40.593923926,-111.598885059],
      [40.594021916,-111.598799229],
      [40.594087243,-111.598691940],
      [40.594119906,-111.598563194],
      [40.594168901,-111.598412991],
      [40.594217896,-111.598284245],
      [40.594283223,-111.598155499],
      [40.594381213,-111.598069668],
      [40.594462872,-111.597983837],
      [40.594560862,-111.597940922],
      [40.594675183,-111.598005295],
      [40.594789505,-111.598091125],
      [40.594887495,-111.598176956],
      [40.594969153,-111.598284245],
      [40.595050812,-111.598370075],
      [40.595148802,-111.598370075],
      [40.595263124,-111.598348618],
      [40.595361114,-111.598284245],
      [40.595475435,-111.598219872],
      [40.595589757,-111.598134041],
      [40.595671415,-111.598048210],
      [40.595769405,-111.597962379],
      [40.595883727,-111.597812176],
      [40.595949054,-111.597704887],
      [40.596030712,-111.597597599],
      [40.596112370,-111.597425938],
      [40.596161366,-111.597297192],
      [40.596259356,-111.597146988],
      [40.596341014,-111.597039700],
      [40.596406341,-111.596932411],
      [40.596487999,-111.596825123],
      [40.596569657,-111.596739292],
      [40.596618652,-111.596610546],
      [40.596683979,-111.596503258],
      [40.596765637,-111.596395969],
      [40.596847296,-111.596310139],
      [40.596945286,-111.596331596],
      [40.597059608,-111.596245766],
      [40.597141266,-111.596159935],
      [40.597239256,-111.596074104],
      [40.597320914,-111.595988274],
      [40.597435236,-111.595923901],
      [40.597549558,-111.595838070],
      [40.597647548,-111.595773697],
      [40.597745538,-111.595730782],
      [40.597859859,-111.595666409],
      [40.597974181,-111.595623493],
      [40.598088503,-111.595602036],
      [40.598202825,-111.595580578],
      [40.598317146,-111.595537663],
      [40.598431468,-111.595494747],
      [40.598529458,-111.595430374],
      [40.598643780,-111.595366001],
      [40.598758101,-111.595280170],
      [40.598856091,-111.595237255],
      [40.598937750,-111.595129967],
      [40.599019408,-111.595044136],
      [40.599068403,-111.594915390],
      [40.599133730,-111.594786644],
      [40.599199057,-111.594657898],
      [40.599264383,-111.594550610],
      [40.599378705,-111.594400406],
      [40.599444032,-111.594293118],
      [40.599525690,-111.594207287],
      [40.599640012,-111.594057083],
      [40.599754333,-111.593906879],
      [40.599835992,-111.593778133],
      [40.599917650,-111.593692303],
      [40.599982977,-111.593585014],
      [40.600015640,-111.593456268],
      [40.600064635,-111.593306065],
      [40.600129962,-111.593198776],
      [40.600195289,-111.593091488],
      [40.600293279,-111.592962742],
      [40.600440264,-111.592855453],
      [40.600554585,-111.592769623],
      [40.600636244,-111.592683792],
      [40.600717902,-111.592576504],
      [40.600750566,-111.592447758],
      [40.600734234,-111.592319012],
      [40.600734234,-111.592190266],
      [40.600799561,-111.592061520],
      [40.600848556,-111.591932774],
      [40.600897551,-111.591782570],
      [40.600832224,-111.591675282],
      [40.600750566,-111.591589451],
      [40.600685239,-111.591482162],
      [40.600636244,-111.591331959],
      [40.600619912,-111.591181755],
      [40.600619912,-111.591053009],
      [40.600603580,-111.590881348],
      [40.600619912,-111.590752602],
      [40.600636244,-111.590623856],
      [40.600685239,-111.590473652],
      [40.600734234,-111.590323448],
      [40.600750566,-111.590194702],
      [40.600668907,-111.590108871],
      [40.600668907,-111.589980125],
      [40.600717902,-111.589851379],
      [40.600783229,-111.589744091],
      [40.600864887,-111.589636803],
      [40.600864887,-111.589443684],
      [40.600897551,-111.589207649],
      [40.600930214,-111.589057446],
      [40.600832224,-111.589100361],
      [40.600734234,-111.589143276],
      [40.600603580,-111.589186192],
      [40.600505590,-111.589186192],
      [40.600407600,-111.589121819],
      [40.600325942,-111.589035988],
      [40.600309610,-111.588907242],
      [40.600374937,-111.588799953],
      [40.600456595,-111.588714123],
      [40.600505590,-111.588563919],
      [40.600538254,-111.588435173],
      [40.600554585,-111.588284969],
      [40.600554585,-111.588156223],
      [40.600570917,-111.588027477],
      [40.600554585,-111.587877274],
      [40.600554585,-111.587705612],
      [40.600472927,-111.587598324],
      [40.600358605,-111.587576866],
      [40.600244284,-111.587512493],
      [40.600178957,-111.587405205],
      [40.600146294,-111.587212086],
      [40.600162625,-111.587083340],
      [40.600178957,-111.586933136],
      [40.600195289,-111.586782932],
      [40.600097299,-111.586761475],
      [40.599999309,-111.586697102],
      [40.599933982,-111.586589813],
      [40.599835992,-111.586503983],
      [40.599770665,-111.586396694],
      [40.599705338,-111.586267948],
      [40.599656343,-111.586139202],
      [40.599672675,-111.586010456],
   ];

    var track_6 = [
      [40.593656301,-111.597535133],
      [40.593656301,-111.597150326],
      [40.593607426,-111.596765518],
      [40.593558550,-111.596380711],
      [40.593558550,-111.595995903],
      [40.593558550,-111.595546961],
      [40.593656301,-111.595162153],
      [40.593851805,-111.594841480],
      [40.593832016,-111.595000029],
      [40.594095945,-111.594449997],
      [40.595159054,-111.592758060],
      [40.595220327,-111.592596769],
      [40.595269203,-111.592404366],
      [40.595318079,-111.592211962],
      [40.595366955,-111.592019558],
      [40.595440269,-111.591827154],
      [40.595538020,-111.591634750],
      [40.595635772,-111.591474414],
      [40.595709085,-111.591249943],
      [40.595806837,-111.591089606],
      [40.595855713,-111.590897202],
      [40.595929027,-111.590704799],
      [40.595953465,-111.590512395],
      [40.596100092,-111.590416193],
      [40.596246719,-111.590384126],
      [40.596393347,-111.590352058],
      [40.596539974,-111.590352058],
      [40.596686602,-111.590191722],
      [40.596833229,-111.590063453],
      [40.596979856,-111.589999318],
      [40.597053170,-111.589806914],
      [40.597102046,-111.589550376],
      [40.597150922,-111.589357972],
      [40.597224236,-111.589165568],
      [40.597321987,-111.588973165],
      [40.597444177,-111.588844895],
      [40.597541928,-111.588652492],
      [40.597688556,-111.588556290],
      [40.597835183,-111.588428020],
      [40.597957373,-111.588235617],
      [40.598079562,-111.588107347],
      [40.598201752,-111.587979078],
      [40.598348379,-111.587818742],
      [40.598446131,-111.587594271],
      [40.598519444,-111.587401867],
      [40.598617196,-111.587177396],
      [40.598643780,-111.587061882],
      [40.598692775,-111.586911678],
      [40.598758101,-111.586782932],
      [40.598807096,-111.586611271],
      [40.598888755,-111.586503983],
      [40.598954082,-111.586396694],
      [40.599019408,-111.586289406],
      [40.599133730,-111.586203575],
   ];

    var track_7 = [
      [40.591970086,-111.596188307],
      [40.591823459,-111.596188307],
      [40.591676831,-111.596188307],
      [40.591530204,-111.596188307],
      [40.591383576,-111.596188307],
      [40.591261387,-111.596316576],
      [40.591163635,-111.596508980],
      [40.591090322,-111.596701384],
      [40.591065884,-111.596893787],
      [40.590943694,-111.597054124],
      [40.590845942,-111.597214460],
      [40.590699315,-111.597214460],
      [40.590650439,-111.597406864],
      [40.590503812,-111.597406864],
   ];

    var track_8 = [
      [40.588328838,-111.561972499],
      [40.588451028,-111.561780095],
      [40.588597655,-111.561748028],
      [40.588744283,-111.561748028],
      [40.588915348,-111.561683893],
      [40.589061975,-111.561619759],
      [40.589208603,-111.561491489],
      [40.589330792,-111.561363220],
      [40.589452982,-111.561234951],
      [40.589550734,-111.561042547],
      [40.589672923,-111.560914278],
      [40.589795113,-111.560721874],
      [40.589892864,-111.560561538],
      [40.590039492,-111.560433269],
      [40.590161681,-111.560272932],
      [40.590259433,-111.560112596],
      [40.590406060,-111.560048461],
      [40.590552688,-111.559984326],
      [40.590699315,-111.559888124],
      [40.590870380,-111.559791923],
      [40.591017008,-111.559791923],
      [40.591090322,-111.559984326],
      [40.591109037,-111.560021996],
      [40.591092944,-111.560009003],
      [40.591416955,-111.560323000],
      [40.592090964,-111.560718060],
   ];

    var track_9 = [
      [40.599231720,-111.586053371],
      [40.599150062,-111.585967541],
      [40.599084735,-111.585838795],
      [40.598986745,-111.585795879],
      [40.598888755,-111.585795879],
      [40.598790765,-111.585795879],
      [40.598692775,-111.585795879],
      [40.598594785,-111.585817337],
      [40.598496795,-111.585838795],
      [40.598398805,-111.585860252],
      [40.598300815,-111.585860252],
      [40.598202825,-111.585860252],
      [40.598104835,-111.585946083],
      [40.597990513,-111.585988998],
      [40.597925186,-111.586096287],
      [40.597827196,-111.586096287],
      [40.597729206,-111.586074829],
      [40.597631216,-111.586074829],
      [40.597533226,-111.586117744],
      [40.597435236,-111.586117744],
      [40.597320914,-111.586096287],
      [40.597239256,-111.586010456],
      [40.597124934,-111.585967541],
      [40.597043276,-111.585881710],
      [40.596994281,-111.585752964],
      [40.596961617,-111.585624218],
      [40.596887946,-111.585630059],
      [40.596320033,-111.585690022],
      [40.596073985,-111.586107969],
      [40.596037984,-111.586750984],
      [40.595731020,-111.587121010],
      [40.594864011,-111.587694049],
      [40.594593048,-111.587437987],
      [40.595018983,-111.588238001],
      [40.594486952,-111.589529991],
      [40.594226003,-111.589808941],
      [40.593986034,-111.590206981],
      [40.593822956,-111.590827942],
      [40.593776941,-111.590967178],
      [40.593744278,-111.591095924],
      [40.593695283,-111.591224670],
      [40.593613625,-111.591310501],
      [40.593564630,-111.591439247],
      [40.593564630,-111.591610909],
      [40.593548298,-111.591739655],
      [40.593531966,-111.591889858],
      [40.593499303,-111.592018604],
      [40.593466640,-111.592147350],
      [40.593401313,-111.592276096],
      [40.593352318,-111.592404842],
      [40.593286991,-111.592533588],
      [40.593205333,-111.592619419],
      [40.593140006,-111.592748165],
      [40.593058348,-111.592855453],
   ];

    var track_10 = [
      [40.592312217,-111.560721874],
      [40.592458844,-111.560786009],
      [40.592605472,-111.560786009],
      [40.592752099,-111.560786009],
      [40.592898726,-111.560786009],
      [40.593069792,-111.560786009],
      [40.593216419,-111.560882211],
      [40.593235970,-111.560935020],
      [40.593315005,-111.561066985],
      [40.593834996,-111.561849952],
      [40.595337987,-111.562157989],
      [40.595152974,-111.562147975],
      [40.595128059,-111.562116981],
      [40.595054030,-111.562358975],
      [40.595335960,-111.563161969],
      [40.596727967,-111.566213965],
      [40.597725987,-111.568349957],
      [40.600507021,-111.571285009],
      [40.601637959,-111.573390007],
      [40.601806998,-111.573426008],
      [40.601590037,-111.573531032],
      [40.601639032,-111.573552012],
      [40.601616979,-111.573528051],
      [40.601698995,-111.573595047],
      [40.601786256,-111.573532820],
      [40.601823092,-111.573645473],
      [40.601773977,-111.573725939],
      [40.601700306,-111.573774219],
      [40.601626635,-111.573790312],
   ];

    var track_11 = [
      [40.590989947,-111.596621037],
      [40.591055036,-111.596526980],
      [40.591102958,-111.596570969],
      [40.591115952,-111.596456051],
      [40.591125011,-111.596328974],
      [40.591137052,-111.596320987],
      [40.591130018,-111.596325994],
      [40.591163039,-111.596277952],
      [40.591109037,-111.595813990],
      [40.591243029,-111.595410943],
      [40.591223955,-111.595389962],
      [40.591178060,-111.595348954],
      [40.591166019,-111.595147967],
      [40.591131210,-111.595022678],
      [40.591131210,-111.594851017],
      [40.591131210,-111.594722271],
      [40.591131210,-111.594593525],
      [40.591131210,-111.594443321],
      [40.591131210,-111.594271660],
      [40.591131210,-111.594142914],
      [40.591131210,-111.593992710],
      [40.591131210,-111.593756676],
      [40.591131210,-111.593585014],
      [40.591131210,-111.593456268],
      [40.591131210,-111.593306065],
      [40.591131210,-111.593177319],
      [40.591098547,-111.593048573],
      [40.591082215,-111.592898369],
      [40.591065884,-111.592769623],
      [40.591065884,-111.592640877],
      [40.591016889,-111.592512131],
      [40.590991974,-111.592465997],
      [40.590834022,-111.591312051],
      [40.591771960,-111.589141965],
      [40.591917038,-111.587749958],
      [40.592026949,-111.587604046],
      [40.592018008,-111.587592959],
      [40.591976047,-111.587666035],
      [40.592033982,-111.587651968],
      [40.592079997,-111.587739944],
      [40.592031956,-111.587592959],
      [40.592013955,-111.587692022],
   ];

    var track_12 = [
      [40.573690534,-111.571656823],
      [40.573763847,-111.571849227],
      [40.573837161,-111.572041631],
      [40.573983788,-111.572137833],
      [40.574130416,-111.572234035],
      [40.574228168,-111.572394371],
      [40.574325919,-111.572554708],
      [40.574423671,-111.572747111],
      [40.574472547,-111.572939515],
      [40.574496984,-111.573131919],
      [40.574496984,-111.573324323],
      [40.574521422,-111.573516726],
      [40.574570298,-111.573709130],
      [40.574741364,-111.573997736],
      [40.574887991,-111.574190140],
      [40.575059056,-111.574318409],
      [40.575181246,-111.574446678],
      [40.575352311,-111.574510813],
      [40.575474501,-111.574639082],
      [40.575621128,-111.574703217],
      [40.575767756,-111.574799418],
      [40.575889945,-111.574959755],
      [40.576012135,-111.575120091],
      [40.576158762,-111.575184226],
      [40.576378703,-111.575280428],
      [40.576500893,-111.575440764],
      [40.576647520,-111.575569034],
      [40.576769710,-111.575697303],
      [40.576940775,-111.575857639],
      [40.577087402,-111.575985909],
      [40.577209592,-111.576146245],
      [40.577282906,-111.576338649],
      [40.577380657,-111.576498985],
      [40.577527285,-111.576466918],
      [40.577543259,-111.576569080],
      [40.577608585,-111.576676369],
      [40.577624917,-111.576826572],
      [40.577641249,-111.576955318],
      [40.577624917,-111.577084064],
      [40.577624917,-111.577255726],
      [40.577592254,-111.577384472],
      [40.577608585,-111.577513218],
      [40.577608585,-111.577641964],
      [40.577608585,-111.577770710],
      [40.577624917,-111.577942371],
      [40.577624917,-111.578071117],
      [40.577641249,-111.578221321],
      [40.577657580,-111.578350067],
      [40.577690244,-111.578478813],
      [40.577722907,-111.578607559],
      [40.577771902,-111.578736305],
      [40.577788234,-111.578865051],
      [40.577820897,-111.578993797],
      [40.577853560,-111.579122543],
      [40.577869892,-111.579251289],
      [40.577886224,-111.579380035],
      [40.577918887,-111.579508781],
      [40.577935219,-111.579637527],
      [40.577984214,-111.579766273],
      [40.578049541,-111.579937935],
      [40.578114867,-111.580066681],
      [40.578212857,-111.580195427],
      [40.578294516,-111.580345631],
      [40.578359842,-111.580474377],
      [40.578441501,-111.580560207],
      [40.578539491,-111.580646038],
      [40.578621149,-111.580753326],
      [40.578719139,-111.580839157],
      [40.578817129,-111.580924988],
      [40.578947783,-111.581032276],
      [40.579045773,-111.581161022],
      [40.579160094,-111.581268311],
      [40.579258084,-111.581354141],
      [40.579356074,-111.581397057],
      [40.579470396,-111.581439972],
      [40.579568386,-111.581525803],
      [40.579715371,-111.581633091],
      [40.579813361,-111.581740379],
      [40.579895020,-111.581826210],
      [40.579993010,-111.581933498],
      [40.580107331,-111.582019329],
      [40.580205321,-111.582083702],
      [40.580303311,-111.582126617],
      [40.580401301,-111.582169533],
      [40.580515623,-111.582233906],
      [40.580629945,-111.582298279],
      [40.580744267,-111.582384109],
      [40.580842257,-111.582448483],
      [40.580923915,-111.582534313],
      [40.581021905,-111.582555771],
      [40.581119895,-111.582555771],
      [40.581217885,-111.582555771],
      [40.581146002,-111.582708955],
      [40.581276059,-111.582774043],
      [40.581212997,-111.582718968],
   ];

    var track_13 = [
      [40.582268238,-111.571304083],
      [40.582463741,-111.570919275],
      [40.582610369,-111.570534468],
      [40.582756996,-111.570149660],
      [40.582952499,-111.569764853],
      [40.583181024,-111.569484949],
      [40.585196018,-111.570716977],
      [40.588822961,-111.575194955],
      [40.591635942,-111.576982975],
      [40.595728040,-111.581519008],
   ];

    var track_14 = [
      [40.591114759,-111.562196970],
      [40.590821505,-111.562389374],
      [40.590577126,-111.562645912],
      [40.590492964,-111.562680006],
      [40.590463996,-111.563159943],
      [40.590316057,-111.565366030],
      [40.591217041,-111.569566011],
      [40.591229200,-111.569402218],
      [40.591310859,-111.569509506],
      [40.591359854,-111.569638252],
      [40.591425180,-111.569766998],
      [40.591457844,-111.569895744],
      [40.591490507,-111.570024490],
      [40.591539502,-111.570174694],
      [40.591621161,-111.570281982],
      [40.591702819,-111.570367813],
      [40.591784477,-111.570475101],
      [40.591866136,-111.570560932],
      [40.591947794,-111.570668221],
      [40.592029452,-111.570754051],
      [40.592078447,-111.570904255],
      [40.592160106,-111.571011543],
      [40.592241764,-111.571140289],
      [40.592339754,-111.571247578],
      [40.592421412,-111.571333408],
      [40.592486739,-111.571440697],
      [40.592568398,-111.571547985],
      [40.592633724,-111.571655273],
      [40.592650056,-111.571784019],
      [40.592748046,-111.571891308],
      [40.592846036,-111.571955681],
      [40.592960358,-111.571998596],
      [40.593074679,-111.572041512],
      [40.593172669,-111.572041512],
      [40.593254328,-111.572127342],
      [40.593335986,-111.572213173],
      [40.593433976,-111.572256088],
      [40.593531966,-111.572320461],
      [40.593613625,-111.572406292],
      [40.593711615,-111.572513580],
      [40.593776941,-111.572642326],
      [40.593858600,-111.572728157],
      [40.593940258,-111.572835445],
      [40.594005585,-111.572964191],
      [40.594087243,-111.573092937],
      [40.594152570,-111.573200226],
      [40.594266891,-111.573307514],
      [40.594348550,-111.573414803],
      [40.594413877,-111.573522091],
      [40.594479203,-111.573629379],
      [40.594560862,-111.573736668],
      [40.594626188,-111.573843956],
      [40.594707847,-111.573929787],
      [40.594789505,-111.574015617],
      [40.594854832,-111.574144363],
      [40.594871163,-111.574273109],
      [40.594887495,-111.574401855],
      [40.594887495,-111.574552059],
      [40.594936490,-111.574702263],
      [40.594985485,-111.574831009],
      [40.595018148,-111.574959755],
      [40.595034480,-111.575088501],
      [40.595050812,-111.575217247],
      [40.595099807,-111.575345993],
      [40.595181465,-111.575431824],
      [40.595263124,-111.575517654],
      [40.595361114,-111.575582027],
      [40.595426440,-111.575710773],
      [40.595475435,-111.575839520],
      [40.595524430,-111.575968266],
      [40.595573425,-111.576097012],
      [40.595589757,-111.576225758],
      [40.595622420,-111.576354504],
      [40.595687747,-111.576483250],
      [40.595753074,-111.576633453],
      [40.595818400,-111.576762199],
      [40.595883727,-111.576869488],
      [40.595949054,-111.576998234],
      [40.596047044,-111.577126980],
      [40.596030712,-111.577255726],
      [40.596030712,-111.577384472],
      [40.596030712,-111.577513218],
      [40.596030712,-111.577663422],
      [40.596047044,-111.577792168],
      [40.596047044,-111.577920914],
      [40.596063375,-111.578049660],
      [40.596096039,-111.578199863],
      [40.596112370,-111.578328609],
      [40.596145034,-111.578521729],
      [40.596243024,-111.578586102],
      [40.596308351,-111.578714848],
      [40.596373677,-111.578843594],
      [40.596439004,-111.578950882],
      [40.596504331,-111.579079628],
      [40.596520662,-111.579208374],
      [40.596520662,-111.579337120],
      [40.596520662,-111.579465866],
      [40.596520662,-111.579616070],
      [40.596520662,-111.579766273],
      [40.596471667,-111.579895020],
      [40.596439004,-111.580023766],
      [40.596439004,-111.580173969],
      [40.596439004,-111.580324173],
      [40.596422672,-111.580474377],
      [40.596406341,-111.580624580],
      [40.596406341,-111.580774784],
      [40.596373677,-111.580903530],
      [40.596373677,-111.581032276],
      [40.596341014,-111.581182480],
      [40.596308351,-111.581311226],
      [40.596275687,-111.581461430],
      [40.596210361,-111.581590176],
      [40.596161366,-111.581718922],
      [40.596161366,-111.581869125],
      [40.596161366,-111.582019329],
      [40.596177697,-111.582169533],
      [40.596194029,-111.582319736],
      [40.596194029,-111.582469940],
      [40.596194029,-111.582598686],
      [40.596194029,-111.582727432],
      [40.596194029,-111.582899094],
      [40.596194029,-111.583027840],
      [40.596177697,-111.583178043],
      [40.596177697,-111.583306789],
      [40.596177697,-111.583435535],
      [40.596177697,-111.583585739],
      [40.596161366,-111.583714485],
      [40.596161366,-111.583843231],
      [40.596161366,-111.583971977],
      [40.596161366,-111.584100723],
      [40.596161366,-111.584229469],
      [40.596161366,-111.584358215],
      [40.596161366,-111.584508419],
      [40.596177697,-111.584637165],
      [40.596210361,-111.584765911],
      [40.596259356,-111.584894657],
      [40.596341014,-111.584980488],
      [40.596439004,-111.585066319],
      [40.596536994,-111.585130692],
      [40.596651316,-111.585195065],
      [40.596749306,-111.585237980],
      [40.596847296,-111.585237980],
      [40.596928954,-111.585323811],
      [40.597026944,-111.585409641],
      [40.597092271,-111.585516930],
      [40.597173929,-111.585602760],
      [40.597304583,-111.585667133],
      [40.597418904,-111.585710049],
      [40.597565889,-111.585752964],
      [40.597680211,-111.585752964],
      [40.597794533,-111.585752964],
      [40.597908854,-111.585752964],
      [40.598006845,-111.585710049],
      [40.598104835,-111.585667133],
      [40.598202825,-111.585667133],
      [40.598300815,-111.585645676],
      [40.598398805,-111.585624218],
      [40.598496795,-111.585581303],
      [40.598594785,-111.585581303],
      [40.598709106,-111.585559845],
      [40.598807096,-111.585538387],
      [40.598905087,-111.585538387],
      [40.599003077,-111.585516930],
      [40.599101067,-111.585495472],
      [40.599199057,-111.585495472],
      [40.599297047,-111.585538387],
      [40.599395037,-111.585645676],
      [40.599460363,-111.585752964],
      [40.599574685,-111.585752964],
      [40.599672675,-111.585795879],
   ];

    var track_15 = [
      [40.595949054,-111.581397057],
      [40.595949054,-111.581268311],
      [40.595949054,-111.581118107],
      [40.595965385,-111.580989361],
      [40.595965385,-111.580860615],
      [40.596014380,-111.580710411],
      [40.596047044,-111.580581665],
      [40.596079707,-111.580452919],
      [40.596145034,-111.580302715],
      [40.596177697,-111.580173969],
      [40.596243024,-111.580066681],
      [40.596292019,-111.579937935],
      [40.596308351,-111.579809189],
      [40.596308351,-111.579680443],
      [40.596324682,-111.579551697],
      [40.596324682,-111.579422951],
      [40.596324682,-111.579294205],
      [40.596373677,-111.579165459],
      [40.596393347,-111.579128504],
      [40.596197844,-111.578743696],
      [40.595904589,-111.578551292],
      [40.595855713,-111.578166485],
      [40.595757961,-111.577781677],
      [40.595709085,-111.577332735],
      [40.595464706,-111.577076197],
      [40.595366955,-111.576691389],
      [40.595318079,-111.576242447],
      [40.595122576,-111.575857639],
      [40.594829321,-111.575601101],
      [40.594536066,-111.575344563],
      [40.594487190,-111.574959755],
      [40.594438314,-111.574574947],
      [40.594389439,-111.574190140],
      [40.594145060,-111.573869467],
      [40.593851805,-111.573677063],
      [40.593656301,-111.573356390],
      [40.593558550,-111.572971582],
      [40.593450308,-111.573007107],
      [40.593335986,-111.572985649],
      [40.593270659,-111.572878361],
      [40.593189001,-111.572792530],
      [40.593091011,-111.572749615],
      [40.593009353,-111.572663784],
      [40.592911363,-111.572577953],
      [40.592813373,-111.572535038],
      [40.592715383,-111.572449207],
      [40.592633724,-111.572363377],
      [40.592519403,-111.572256088],
      [40.592421412,-111.572191715],
      [40.592339754,-111.572105885],
      [40.592241764,-111.572041512],
      [40.592160106,-111.571955681],
      [40.592094779,-111.571848392],
      [40.592013121,-111.571741104],
      [40.591964126,-111.571612358],
      [40.591882467,-111.571483612],
      [40.591817141,-111.571376324],
      [40.591784477,-111.571247578],
      [40.591735482,-111.571118832],
      [40.591670156,-111.570990086],
      [40.591604829,-111.570882797],
      [40.591523170,-111.570796967],
      [40.591457844,-111.570689678],
      [40.591376185,-111.570560932],
      [40.591294527,-111.570453644],
      [40.591196537,-111.570324898],
      [40.591114879,-111.570217609],
      [40.591033220,-111.570110321],
      [40.590951562,-111.570003033],
      [40.590853572,-111.569874287],
      [40.590755582,-111.569788456],
      [40.590690255,-111.569681168],
      [40.590592265,-111.569616795],
      [40.590477943,-111.569488049],
      [40.590379953,-111.569423676],
      [40.590281963,-111.569316387],
      [40.590200305,-111.569230556],
      [40.590134978,-111.569123268],
      [40.590085983,-111.568994522],
      [40.590036988,-111.568844318],
      [40.589971662,-111.568737030],
      [40.589890003,-111.568608284],
      [40.589824677,-111.568500996],
      [40.589743018,-111.568350792],
      [40.589694023,-111.568222046],
      [40.589661360,-111.568071842],
      [40.589645028,-111.567921638],
      [40.589628696,-111.567771435],
      [40.589628696,-111.567642689],
      [40.589628696,-111.567492485],
      [40.589596033,-111.567342281],
      [40.589465380,-111.567170620],
      [40.589383721,-111.567084789],
      [40.589236736,-111.566977501],
      [40.589106083,-111.566870213],
      [40.589024425,-111.566784382],
      [40.588942766,-111.566677094],
      [40.588861108,-111.566569805],
      [40.588779449,-111.566483974],
      [40.588681459,-111.566398144],
      [40.588648796,-111.566247940],
      [40.588550806,-111.566119194],
      [40.588436484,-111.566076279],
      [40.588322163,-111.566011906],
      [40.588191509,-111.565926075],
      [40.588060856,-111.565840244],
      [40.587930202,-111.565775871],
      [40.587832212,-111.565711498],
      [40.587734222,-111.565690041],
      [40.587636232,-111.565690041],
      [40.587538242,-111.565690041],
      [40.587734222,-111.565754414],
      [40.587636232,-111.565754414],
      [40.587505579,-111.565775871],
      [40.587407589,-111.565797329],
      [40.587309599,-111.565797329],
      [40.587211609,-111.565754414],
      [40.587113619,-111.565754414],
      [40.587015629,-111.565754414],
      [40.586917639,-111.565754414],
      [40.586819649,-111.565754414],
      [40.586721659,-111.565754414],
      [40.586640000,-111.565840244],
      [40.586542010,-111.565840244],
      [40.586444020,-111.565840244],
      [40.586346030,-111.565840244],
      [40.586248040,-111.565840244],
      [40.586150050,-111.565883160],
      [40.586035728,-111.565926075],
      [40.585937738,-111.565990448],
      [40.585839748,-111.566033363],
      [40.585741758,-111.566076279],
      [40.585643768,-111.566097736],
      [40.585545778,-111.566076279],
      [40.585480452,-111.565968990],
      [40.585382462,-111.565904617],
      [40.585317135,-111.565775871],
      [40.585235476,-111.565690041],
      [40.585005283,-111.565467834],
      [40.584809780,-111.565147161],
      [40.584834218,-111.565179229],
      [40.584834218,-111.564986825],
      [40.584907532,-111.564762354],
      [40.585005283,-111.564602017],
      [40.585103035,-111.564441681],
      [40.585249662,-111.564345479],
      [40.585371852,-111.564217210],
      [40.585494041,-111.564088941],
      [40.585640669,-111.563992739],
      [40.585787296,-111.563896537],
      [40.585958362,-111.563832402],
      [40.586104989,-111.563736200],
      [40.586202741,-111.563575864],
      [40.586300492,-111.563415527],
      [40.586422682,-111.563287258],
      [40.586569309,-111.563126922],
      [40.586715937,-111.562998652],
      [40.586862564,-111.562966585],
      [40.587009192,-111.562902451],
      [40.587106943,-111.562742114],
      [40.587253571,-111.562581778],
      [40.587400198,-111.562485576],
      [40.587546825,-111.562453508],
      [40.587693453,-111.562357306],
      [40.587815642,-111.562229037],
      [40.587962270,-111.562164903],
      [40.588108897,-111.562100768],
   ];

    var track_16 = [
      [40.572931051,-111.602586031],
      [40.574365973,-111.602712989],
      [40.575674057,-111.602040052],
      [40.577208042,-111.600000024],
      [40.577780962,-111.598579049],
      [40.579648972,-111.599051952],
      [40.581347942,-111.598610997],
   ];

    var track_17 = [
      [40.591966033,-111.627325058],
      [40.592319012,-111.628898025],
      [40.592393994,-111.630506039],
      [40.591799974,-111.632143974],
      [40.591354012,-111.632176995],
      [40.590741992,-111.632061005],
      [40.590684056,-111.632498980],
      [40.590239048,-111.632421970],
      [40.590037942,-111.633625031],
      [40.590703011,-111.634178996],
      [40.590361953,-111.635491014],
      [40.589360952,-111.635189056],
      [40.589105964,-111.635954022],
      [40.588961959,-111.636829019],
      [40.589323044,-111.637087941],
      [40.590047956,-111.636839032],
      [40.589990020,-111.637277007],
      [40.588650942,-111.637629986],
      [40.588479996,-111.638394952],
      [40.588979959,-111.638692021],
      [40.589619994,-111.638733983],
      [40.589532018,-111.639500976],
      [40.589349985,-111.641216040],
      [40.587512970,-111.641160965],
      [40.586071014,-111.644981980],
      [40.587152958,-111.645686984],
      [40.587010026,-111.646342993],
      [40.586009026,-111.646224022],
      [40.585695982,-111.646366954],
      [40.585059047,-111.645702958],
      [40.584728003,-111.645262003],
      [40.583814025,-111.644376040],
      [40.582203984,-111.643411040],
      [40.578358054,-111.642169952],
      [40.577299953,-111.642086029],
      [40.575909972,-111.640663981],
      [40.574409962,-111.640064955],
      [40.573771954,-111.639693975],
      [40.573662043,-111.639328003],
      [40.572464943,-111.639279962],
      [40.571045041,-111.639338970],
      [40.569512963,-111.639544010],
      [40.568902016,-111.639209032],
      [40.568460941,-111.638365030],
      [40.567543030,-111.638174057],
      [40.567785025,-111.634781003],
      [40.567585945,-111.632375956],
      [40.567620039,-111.631317973],
      [40.567597032,-111.630324960],
      [40.566987991,-111.629734993],
      [40.566246986,-111.627756000],
      [40.565526962,-111.621907949],
      [40.565317035,-111.619568944],
      [40.565410972,-111.617671967],
      [40.565590024,-111.615337014],
      [40.565626979,-111.613620996],
      [40.565745950,-111.612161994],
      [40.566002011,-111.611075997],
      [40.565152049,-111.608657956],
      [40.564777017,-111.605770946],
      [40.565394044,-111.605010033],
      [40.566905975,-111.603417039],
      [40.569280028,-111.602013946],
      [40.571339965,-111.601995945],
      [40.572924018,-111.602630973],
   ];

    var track_18 = [
      [40.581347942,-111.598608971],
      [40.581347942,-111.598696947],
      [40.581393003,-111.598580003],
      [40.581387997,-111.598626971],
      [40.581608057,-111.600849032],
      [40.581603050,-111.601923943],
      [40.581575990,-111.603700042],
      [40.581617951,-111.604732037],
      [40.581697941,-111.605720043],
      [40.581892014,-111.606832027],
      [40.582155943,-111.607535958],
      [40.585983038,-111.615085006],
      [40.586403966,-111.615468979],
      [40.587864041,-111.617323041],
      [40.589038968,-111.618473053],
      [40.589841962,-111.619825006],
      [40.590726018,-111.621165037],
      [40.592092991,-111.622066021],
      [40.593083024,-111.623641968],
      [40.593554020,-111.625375986],
      [40.592674017,-111.626747012],
      [40.591904044,-111.627418041]
   ];

    var track_19 = [
        [40.591847897,-111.587530136],
        [40.591799021,-111.587337732],
        [40.591652393,-111.587209463],
        [40.591530204,-111.587081194],
        [40.591432452,-111.586888790],
        [40.591359138,-111.586696386],
        [40.591359138,-111.586503983],
        [40.591359138,-111.586311579],
        [40.591285825,-111.586119175],
        [40.591163635,-111.585958838],
        [40.591017008,-111.585830569],
        [40.590821505,-111.585734367],
        [40.590674877,-111.585670233],
        [40.590528250,-111.585670233],
        [40.590381622,-111.585670233],
        [40.590234995,-111.585670233],
        [40.590088367,-111.585606098],
        [40.589941740,-111.585606098],
        [40.589770675,-111.585606098],
        [40.589624047,-111.585606098],
        [40.589477420,-111.585606098],
        [40.589330792,-111.585606098],
        [40.589184165,-111.585606098],
        [40.589013100,-111.585606098],
        [40.588866472,-111.585606098],
        [40.588719845,-111.585638165],
        [40.588573217,-111.585702300],
        [40.588426590,-111.585734367],
        [40.588279963,-111.585766435],
        [40.588084459,-111.585894704],
        [40.587937832,-111.585990906],
        [40.587791204,-111.586022973],
        [40.587620139,-111.586055040],
        [40.587473512,-111.586087108],
        [40.587326884,-111.586183310],
        [40.587180257,-111.586279511],
        [40.587058067,-111.586439848],
        [40.586911440,-111.586536050],
        [40.586764812,-111.586632252],
        [40.586715937,-111.586824656],
        [40.586715937,-111.587017059],
        [40.586691499,-111.587209463],
        [40.586642623,-111.587401867],
        [40.586495996,-111.587466002],
        [40.586398244,-111.587626338],
        [40.586324930,-111.587850809],
        [40.586227179,-111.588107347],
        [40.586129427,-111.588267684],
        [40.585982800,-111.588460088],
        [40.585885048,-111.588620424],
        [40.585960984,-111.588799953],
        [40.585450053,-111.588659048],
        [40.585412979,-111.588500023],
        [40.585432053,-111.588580012],
        [40.585098982,-111.588585019],
        [40.584849954,-111.588495970],
        [40.584673047,-111.588786960],
        [40.584347010,-111.588397026],
        [40.584255576,-111.588499546],
        [40.584157586,-111.588521004],
        [40.584059596,-111.588563919],
        [40.583994269,-111.588671207],
        [40.583896279,-111.588692665],
        [40.583925962,-111.588701010],
        [40.582543969,-111.588067055],
        [40.582475424,-111.587984562],
        [40.582393765,-111.587855816],
        [40.582328439,-111.587748528],
        [40.582263112,-111.587619781],
        [40.582214117,-111.587491035],
        [40.582132459,-111.587405205],
        [40.582034469,-111.587405205],
        [40.581936479,-111.587405205],
        [40.581838489,-111.587405205],
        [40.581773162,-111.587297916],
        [40.581691504,-111.587212086],
        [40.581593513,-111.587147713],
        [40.581544518,-111.586997509],
        [40.581544518,-111.586868763],
        [40.581511855,-111.586740017],
        [40.581511855,-111.586589813],
        [40.581479192,-111.586439610],
        [40.581462860,-111.586289406],
        [40.581446528,-111.586139202],
        [40.581430197,-111.586010456],
        [40.581430197,-111.585881710],
        [40.581430197,-111.585752964],
        [40.581381202,-111.585602760],
        [40.581364870,-111.585474014],
        [40.581348538,-111.585323811],
        [40.581348538,-111.585173607],
        [40.581348538,-111.584980488],
        [40.581332207,-111.584851742],
        [40.581315875,-111.584680080],
        [40.581315875,-111.584551334],
        [40.581283212,-111.584422588],
        [40.581201553,-111.584336758],
        [40.581136227,-111.584186554],
        [40.581070900,-111.584079266],
        [40.581021905,-111.583950520],
        [40.581005573,-111.583800316],
        [40.581005573,-111.583650112],
        [40.581005573,-111.583521366],
        [40.581038237,-111.583392620],
        [40.581054568,-111.583263874],
        [40.581103563,-111.583135128],
        [40.581103563,-111.583006382],
        [40.581152558,-111.582877636]
      ];

      // -----------------

    var sat_track_1 = [
      [40.591226697,-111.561720371],
      [40.591263533,-111.561816931],
      [40.591176987,-111.561683059],
      [40.591416001,-111.561884999],
      [40.591209054,-111.562085986],
      [40.591492057,-111.561756015],
      [40.591369987,-111.562065959],
      [40.591387033,-111.562047958],
      [40.591346025,-111.562021971],
      [40.591380000,-111.562013030],
      [40.591264009,-111.562180042],
      [40.591426969,-111.561866045],
      [40.591395974,-111.562034011],
      [40.591601968,-111.562412977],
      [40.591598034,-111.562616944],
      [40.592003942,-111.563011050],
      [40.592247963,-111.563235998],
      [40.592789054,-111.563537955],
      [40.592924953,-111.563784003],
      [40.593415022,-111.564082026],
      [40.593636990,-111.564445972],
      [40.594127059,-111.564766049],
      [40.594514966,-111.565111041],
      [40.594864011,-111.565402031],
      [40.595129013,-111.565852046],
      [40.595214963,-111.566248059],
      [40.595531940,-111.566773057],
      [40.595927954,-111.567288995],
      [40.596137047,-111.567813039],
      [40.596526980,-111.568546057],
      [40.596436024,-111.569187045],
      [40.596328020,-111.569833994],
      [40.595994949,-111.570073009],
      [40.595793962,-111.570327997],
      [40.595731020,-111.570687056],
      [40.595981956,-111.571164966],
      [40.596156001,-111.571346045],
      [40.595898986,-111.571542025],
      [40.595904946,-111.571653008],
      [40.595939994,-111.571763039],
      [40.595823050,-111.571998954],
      [40.595741987,-111.572363019],
      [40.595837951,-111.572901964],
      [40.595510006,-111.573454976],
      [40.595286965,-111.574074030],
      [40.595147967,-111.574893951],
      [40.594866991,-111.575086951],
      [40.595036030,-111.575721025],
      [40.595020056,-111.575903058],
      [40.595147014,-111.576760054],
      [40.595643997,-111.577486038],
      [40.595850945,-111.578024983],
      [40.596017957,-111.578948975],
      [40.596647024,-111.579208970],
      [40.596899033,-111.579745054],
      [40.597149014,-111.580093026],
      [40.597331047,-111.580732942],
      [40.597283006,-111.580788016],
      [40.597138047,-111.581258059],
      [40.597152948,-111.582249999],
      [40.597118974,-111.583232045],
      [40.596932054,-111.584146023],
      [40.596699953,-111.585170984],
      [40.597231984,-111.585540056],
      [40.598114014,-111.585307956],
      [40.598885059,-111.585438013],
      [40.598959327,-111.585509896],
      [40.599081516,-111.585638165],
      [40.599228144,-111.585670233],
      [40.599374771,-111.585702300],
      [40.599521399,-111.585734367],
      [40.599668026,-111.585702300],
    ];
    var sat_track_2 = [
      [40.584940076,-111.565341353],
      [40.585001469,-111.565276980],
      [40.584913969,-111.565317988],
      [40.588765979,-111.562451005],
      [40.591423988,-111.562049985],
      [40.591400981,-111.561975956],
    ];
    var sat_track_3 = [
      [40.584913969,-111.565317988],
      [40.584604979,-111.566903949],
      [40.584635973,-111.566920042],
      [40.584730029,-111.566952944],
      [40.584735036,-111.567155957],
      [40.584457040,-111.567381978],
      [40.584298015,-111.568124056],
      [40.583981991,-111.568598032],
      [40.583520055,-111.569360971],
      [40.582978964,-111.569936991],
      [40.582491994,-111.570382953],
      [40.582290053,-111.570912957],
      [40.582388997,-111.571396947],
      [40.582221031,-111.571846962],
      [40.582151055,-111.572209001],
      [40.582155943,-111.572206020],
    ];
    var sat_track_4 = [
      [40.582155943,-111.572206020],
      [40.582239985,-111.572234988],
      [40.582193971,-111.572173953],
      [40.582241058,-111.572190046],
      [40.582149029,-111.572168946],
      [40.581980944,-111.572206020],
      [40.582326055,-111.572175980],
      [40.582115054,-111.572147965],
      [40.582187057,-111.571730018],
      [40.580652952,-111.570289969],
      [40.579522967,-111.569885969],
      [40.579681993,-111.569844961],
      [40.578956008,-111.570250034],
      [40.578500032,-111.570132017],
      [40.575981975,-111.569679022],
      [40.575817943,-111.569776058],
      [40.575595021,-111.569841981],
      [40.574851990,-111.569785953],
      [40.574823976,-111.570476055],
      [40.574090004,-111.571429968],
      [40.573791027,-111.571488023],
      [40.573827028,-111.571509957],
      [40.573802948,-111.571499944],
      [40.573482990,-111.571406960],
    ];
    var sat_track_5 = [
      [40.573482990,-111.571406960],
      [40.573788047,-111.571478963],
      [40.573665023,-111.571650028],
      [40.573747993,-111.571602941],
      [40.573833942,-111.571480036],
      [40.574040055,-111.571702003],
      [40.574169993,-111.572159052],
      [40.574445963,-111.572330952],
      [40.574589968,-111.572610974],
      [40.574735999,-111.573003054],
      [40.574790955,-111.573462963],
      [40.574949980,-111.573956966],
      [40.575201035,-111.574270964],
      [40.575530052,-111.574414015],
      [40.575592995,-111.574609995],
      [40.575765014,-111.574872971],
      [40.576169968,-111.574928999],
      [40.576514006,-111.575029969],
      [40.576635003,-111.575389028],
      [40.576838970,-111.575600028],
      [40.577046037,-111.575896978],
      [40.576993942,-111.575940967],
      [40.577062011,-111.575935960],
      [40.577046037,-111.575896025],
      [40.576959968,-111.575875044],
      [40.577244997,-111.576223016],
      [40.577455997,-111.576712012],
      [40.577502966,-111.576887965],
      [40.577669024,-111.576959968],
      [40.577723980,-111.576967955],
      [40.577973962,-111.576727986],
      [40.578166008,-111.576815009],
      [40.578338027,-111.576766014],
      [40.578541040,-111.577005029],
      [40.578709006,-111.576949954],
      [40.578907013,-111.576792002],
      [40.578945041,-111.576612949],
      [40.579107046,-111.576446056],
      [40.579262018,-111.576220036],
      [40.579453945,-111.575909972],
      [40.579592943,-111.575984001],
      [40.579512954,-111.575845003],
      [40.579632044,-111.575865030],
      [40.579771996,-111.575559974],
      [40.579957962,-111.575438023],
      [40.580106974,-111.575248003],
      [40.580229998,-111.575217962],
      [40.580626965,-111.575109005],
      [40.580914021,-111.575044990],
      [40.581141949,-111.575183988],
      [40.581395984,-111.575409055],
      [40.581500053,-111.575767994],
      [40.581853032,-111.575881958],
      [40.582329035,-111.575642943],
      [40.582370043,-111.575896025],
      [40.582568049,-111.575845957],
      [40.582890987,-111.575904012],
      [40.583127022,-111.576114058],
      [40.583361983,-111.576411963],
      [40.583408952,-111.576935053],
      [40.583454013,-111.577404022],
      [40.583346009,-111.577626944],
      [40.583407998,-111.577898026],
      [40.583400965,-111.578022003],
      [40.583377957,-111.578135014],
      [40.583451033,-111.578102946],
      [40.583348036,-111.578264952],
    ];
    var sat_track_6 = [
      [40.583348036,-111.578264952],
      [40.583323002,-111.578119040],
      [40.583461046,-111.578243971],
      [40.583451986,-111.578086019],
      [40.583430052,-111.578058004],
      [40.583781958,-111.577765942],
      [40.584102988,-111.577101946],
      [40.584925056,-111.577101946],
      [40.585232973,-111.577857971],
      [40.585351944,-111.578091979],
      [40.585275054,-111.578235984],
      [40.587008953,-111.581398010],
      [40.589684010,-111.583122015],
      [40.590705991,-111.582255960],
      [40.591017008,-111.582206964],
      [40.591310263,-111.582271099],
      [40.591652393,-111.582527637],
      [40.591994524,-111.582655907],
      [40.592287779,-111.582655907],
      [40.592581034,-111.582784176],
      [40.592874289,-111.582784176],
      [40.593167543,-111.582912445],
      [40.593460798,-111.583168983],
      [40.593754053,-111.583168983],
      [40.593998432,-111.583489656],
      [40.594193935,-111.583810329],
      [40.594487190,-111.584002733],
      [40.594780445,-111.584259272],
      [40.595073700,-111.584387541],
      [40.595269203,-111.584836483],
      [40.595513582,-111.585093021],
      [40.595757961,-111.585349560],
      [40.596051216,-111.585413694],
      [40.596344471,-111.585541964],
      [40.596539974,-111.585862637],
    ];
    var sat_track_7 = [
      [40.591176987,-111.561683059],
      [40.590883017,-111.561625004],
      [40.590842962,-111.561478972],
      [40.591007948,-111.561305046],
      [40.591070056,-111.561131954],
      [40.591107965,-111.560933948],
      [40.591094971,-111.560539961],
      [40.591068029,-111.560516000],
      [40.591145992,-111.560439944],
      [40.591078997,-111.560091019],
      [40.591066003,-111.560204029],
      [40.591045976,-111.560158968],
      [40.591114998,-111.560057998],
      [40.591092944,-111.559983015],
      [40.591109037,-111.560021996],
      [40.591092944,-111.560009003],
      [40.591416955,-111.560323000],
      [40.592090964,-111.560718060],
    ];
    var sat_track_8 = [
      [40.591484547,-111.562074423],
      [40.591554642,-111.562068701],
      [40.591701269,-111.562068701],
      [40.591823459,-111.562196970],
      [40.591921210,-111.562357306],
      [40.592043400,-111.562485576],
      [40.592165589,-111.562613845],
      [40.592263341,-111.562806249],
      [40.592409968,-111.562870383],
      [40.592548966,-111.562960029],
      [40.592828035,-111.563261986],
      [40.593400002,-111.563552976],
      [40.593703032,-111.563586950],
      [40.593734980,-111.563691020],
      [40.593904972,-111.564015031],
      [40.594128966,-111.564414024],
      [40.594459057,-111.564869046],
      [40.594882011,-111.564767957],
      [40.594823003,-111.564622045],
      [40.594766021,-111.564551950],
      [40.594974041,-111.564813972],
      [40.595309019,-111.565256953],
      [40.595514059,-111.565639973],
      [40.595718980,-111.565899968],
      [40.595636010,-111.565543056],
      [40.595520973,-111.565565944],
      [40.595638037,-111.565585971],
      [40.595801950,-111.565796018],
      [40.595769048,-111.565577984],
      [40.596037984,-111.565776944],
      [40.596518993,-111.565945983],
      [40.596878052,-111.566501021],
      [40.597203016,-111.567152023],
      [40.597390056,-111.567715049],
      [40.597344041,-111.567783952],
      [40.597432971,-111.567862988],
      [40.597499013,-111.568289995],
      [40.597795963,-111.568645954],
      [40.598284006,-111.569095016],
      [40.598708034,-111.569700956],
      [40.599131942,-111.570230961],
      [40.599660993,-111.570978999],
      [40.600139022,-111.571746945],
      [40.600211024,-111.572255969],
      [40.600211978,-111.572245002],
      [40.600474000,-111.572705030],
      [40.601479292,-111.573565006],
    ];
    var sat_track_9 = [
      [40.596778035,-111.586055994],
      [40.596734047,-111.586617947],
      [40.596601009,-111.587329030],
      [40.596387982,-111.587849021],
      [40.596366048,-111.588467956],
      [40.596045017,-111.589143991],
      [40.595973969,-111.589738965],
      [40.595808029,-111.590332031],
      [40.595880032,-111.590302944],
      [40.595631003,-111.590404034],
      [40.595281005,-111.590659976],
      [40.594992042,-111.591191053],
      [40.594660997,-111.591452003],
      [40.594570994,-111.591699004],
      [40.594362974,-111.592046976],
      [40.594171047,-111.592121959],
      [40.593719959,-111.592370987],
      [40.593664050,-111.592329025],
      [40.593670964,-111.592380047],
      [40.593580961,-111.592460990],
      [40.593538046,-111.592429042],
      [40.593230963,-111.592453957],
      [40.593158960,-111.592548013],
      [40.592775941,-111.592296004],
      [40.592630029,-111.592738032],
      [40.592844963,-111.593060017],
    ];
    var sat_track_10 = [
      [40.592043400,-111.595931768],
      [40.591921210,-111.595803499],
      [40.591945648,-111.595611095],
      [40.591970086,-111.595418692],
      [40.592067838,-111.595258355],
      [40.592056990,-111.595039964],
      [40.592147946,-111.595057964],
      [40.592035055,-111.594957948],
      [40.592424035,-111.594859958],
      [40.592290998,-111.594560027],
      [40.592442036,-111.594452024],
    ];
    var sat_track_11 = [
      [40.592442036,-111.594452024],
      [40.592582941,-111.594275951],
      [40.592743039,-111.593973994],
      [40.592522979,-111.594040990],
      [40.592751980,-111.593765020],
      [40.592826009,-111.593734026],
      [40.592808008,-111.593667030],
      [40.592843056,-111.593580961],
      [40.592743993,-111.593301058],
      [40.592640042,-111.593319058],
      [40.592962980,-111.593278050],
      [40.592844963,-111.593060017],
    ];
    var sat_track_12 = [
      [40.601626635,-111.573790312],
      [40.601700306,-111.573774219],
      [40.601773977,-111.573725939],
      [40.601823092,-111.573645473],
      [40.601786256,-111.573532820],
      [40.601698995,-111.573595047],
      [40.601616979,-111.573528051],
      [40.601639032,-111.573552012],
      [40.601590037,-111.573531032],
      [40.601806998,-111.573426008],
      [40.601637959,-111.573390007],
      [40.600507021,-111.571285009],
      [40.597725987,-111.568349957],
      [40.596727967,-111.566213965],
      [40.595335960,-111.563161969],
      [40.595054030,-111.562358975],
      [40.595128059,-111.562116981],
      [40.595152974,-111.562147975],
      [40.595337987,-111.562157989],
      [40.593834996,-111.561849952],
      [40.593315005,-111.561066985],
      [40.593235970,-111.560935020],
      [40.592818975,-111.560868025],
      [40.592473030,-111.560832977],
      [40.592301965,-111.560776949],
      [40.592090964,-111.560718060],
    ];
    var sat_track_13 = [
      [40.592043400,-111.595931768],
      [40.592190027,-111.595963836],
      [40.592287779,-111.595803499],
      [40.592409968,-111.595675230],
      [40.592532158,-111.595546961],
      [40.592678785,-111.595450759],
      [40.592769027,-111.595325947],
      [40.593832016,-111.595000029],
      [40.594095945,-111.594449997],
      [40.595159054,-111.592758060],
      [40.595195889,-111.592596769],
      [40.595342517,-111.592500567],
      [40.595440269,-111.592340231],
      [40.595586896,-111.592179894],
      [40.595733523,-111.592083693],
      [40.595855713,-111.591955423],
      [40.596002340,-111.591923356],
      [40.596148968,-111.591859221],
      [40.596295595,-111.591795087],
      [40.596442223,-111.591730952],
      [40.596588850,-111.591730952],
      [40.596735477,-111.591795087],
      [40.596906543,-111.591730952],
      [40.597077608,-111.591795087],
      [40.597224236,-111.591763020],
      [40.597370863,-111.591763020],
      [40.597517490,-111.591763020],
      [40.597615242,-111.591570616],
      [40.597590804,-111.591378212],
      [40.597566366,-111.591153741],
      [40.597541928,-111.590929270],
      [40.597590804,-111.590736866],
      [40.597664118,-111.590512395],
      [40.597810745,-111.590512395],
      [40.597981811,-111.590576530],
      [40.598128438,-111.590608597],
      [40.598226190,-111.590384126],
      [40.598372817,-111.590352058],
      [40.598519444,-111.590352058],
      [40.598641634,-111.590512395],
      [40.598788261,-111.590608597],
      [40.598934889,-111.590768933],
      [40.599081516,-111.590833068],
      [40.599228144,-111.590833068],
      [40.599350333,-111.590672731],
      [40.599350333,-111.590480328],
      [40.599374771,-111.590287924],
      [40.599374771,-111.590095520],
      [40.599399209,-111.589871049],
      [40.599399209,-111.589678645],
      [40.599399209,-111.589486241],
      [40.599399209,-111.589293838],
      [40.599399209,-111.589069366],
      [40.599399209,-111.588876963],
      [40.599399209,-111.588684559],
      [40.599399209,-111.588492155],
      [40.599423647,-111.588299751],
      [40.599448085,-111.588107347],
      [40.599448085,-111.587914944],
      [40.599496961,-111.587722540],
      [40.599521399,-111.587530136],
      [40.599570274,-111.587305665],
      [40.599668026,-111.587081194],
      [40.599716902,-111.586888790],
      [40.599790215,-111.586696386],
      [40.599839091,-111.586471915],
      [40.599887967,-111.586279511],
      [40.599985719,-111.586119175],
      [40.599985719,-111.585926771],
      [40.599839091,-111.585862637],
      [40.599692464,-111.585958838],
    ];

      //$scope.course = "sunday";
      $scope.course = "saturday";

      var weight = 2;
      var opacity = .8;

      var sunday = [];
      sunday.push(L.polyline(track_1, { opacity: opacity, weight: weight, color: "#000080" }));
      sunday.push(L.polyline(track_2, { opacity: opacity, weight: weight, color: "#000080" }));
      sunday.push(L.polyline(track_3, { opacity: opacity, weight: weight, color: "#000080" }));
      sunday.push(L.polyline(track_4, { opacity: opacity, weight: weight, color: "#ffcc00" }));
      sunday.push(L.polyline(track_5, { opacity: opacity, weight: weight, color: "#000080" }));
      sunday.push(L.polyline(track_6, { opacity: opacity, weight: weight, color: "#ff0000" }));
      sunday.push(L.polyline(track_7, { opacity: opacity, weight: weight, color: "#ffcc00" }));
      sunday.push(L.polyline(track_8, { opacity: opacity, weight: weight, color: "#ffcc00" }));
      sunday.push(L.polyline(track_9, { opacity: opacity, weight: weight, color: "#000080" }));
      sunday.push(L.polyline(track_10, { opacity: opacity, weight: weight, color: "#ff0000" }));
      sunday.push(L.polyline(track_11, { opacity: opacity, weight: weight, color: "#ff0000" }));
      sunday.push(L.polyline(track_12, { opacity: opacity, weight: weight, color: "#ff0000" }));
      sunday.push(L.polyline(track_13, { opacity: opacity, weight: weight, color: "#ff0000" }));
      sunday.push(L.polyline(track_14, { opacity: opacity, weight: weight, color: "#ff0000" }));
      sunday.push(L.polyline(track_15, { opacity: opacity, weight: weight, color: "#000080" }));
      sunday.push(L.polyline(track_19, { opacity: opacity, weight: weight, color: "#000080" }));

      var saturday = [];
      saturday.push(L.polyline(sat_track_1, { opacity: opacity, weight: weight, color: "#000080" }));
      saturday.push(L.polyline(sat_track_2, { opacity: opacity, weight: weight, color: "#ff0000" }));
      saturday.push(L.polyline(sat_track_3, { opacity: opacity, weight: weight, color: "#000080" }));
      saturday.push(L.polyline(sat_track_4, { opacity: opacity, weight: weight, color: "#ff0000" }));
      saturday.push(L.polyline(sat_track_5, { opacity: opacity, weight: weight, color: "#000080" }));
      saturday.push(L.polyline(sat_track_6, { opacity: opacity, weight: weight, color: "#ff0000" }));
      saturday.push(L.polyline(sat_track_7, { opacity: opacity, weight: weight, color: "#ffcc00" }));
      saturday.push(L.polyline(sat_track_8, { opacity: opacity, weight: weight, color: "#000080" }));
      saturday.push(L.polyline(sat_track_9, { opacity: opacity, weight: weight, color: "#000080" }));
      saturday.push(L.polyline(sat_track_10, { opacity: opacity, weight: weight, color: "#000080" }));
      saturday.push(L.polyline(sat_track_11, { opacity: opacity, weight: weight, color: "#ffcc00" }));
      saturday.push(L.polyline(sat_track_12, { opacity: opacity, weight: weight, color: "#ff0000" }));
      saturday.push(L.polyline(sat_track_13, { opacity: opacity, weight: weight, color: "#ff0000" }));
          

      $scope.isPowderKeg = function(){
        for (var i = 0; i < $scope.global.orgs.length; i++) {
            if ($scope.global.orgs[i]._id == "54ecc1d99d2100d2e64f2a5a") { return true; break; }
        }
        return false;
      }

      $scope.selectedRoute; 
      $scope.showRoute = function(route) {
        $scope.selectedRoute = route;
        angular.forEach(sunday, function(section){ $scope.map.removeLayer(section); });
        angular.forEach(saturday, function(section){ $scope.map.removeLayer(section);  });

        if (route == "saturday") {
            angular.forEach(saturday, function(section){ $scope.map.addLayer(section); });
        }
        else if (route == "sunday") {
            angular.forEach(sunday, function(section){ $scope.map.addLayer(section); });
        }
      }
      $scope.$watch('global.orgs', function(){
          if (!$scope.selectedRoute && $scope.isPowderKeg()) $scope.showRoute('saturday');
      }, true);

}]);