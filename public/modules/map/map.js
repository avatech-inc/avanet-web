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

        //if ($scope.search_date(profile) === false) ok = false;
        if ($scope.search_text(profile) === false) ok = false;
        if ($scope.search_elevation(profile) === false) ok = false;
        if ($scope.search_aspect(profile) === false) ok = false;
        if ($scope.search_slope(profile) === false) ok = false;

        return ok;
    }
    $scope.my_published = function(profile) {
        var ok = (profile.published === true && profile.user._id == $scope.global.user._id);

        if ($scope.search_type(profile) === false) ok = false;
        //if ($scope.search_date(profile) === false) ok = false;
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
            html += '<canvas graph="profile.rows_tiny" width="360" height="320" style="margin-top:5px;margin-bottom:-4px;width:180px;height:160px;background:#eee;"></canvas>';
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
        }, 500);
    });

    $scope.map.on('zoomstart', function() {
        $timeout.cancel($scope.loadProfilesTimer);
        $scope.loadProfilesTimer = $timeout(function(){
            $scope.loadProfiles();
        }, 500);
        
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

}]);