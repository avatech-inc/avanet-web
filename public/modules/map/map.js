angular.module('avatech.system').controller('MapController', function ($rootScope, $q, $scope, $state, $location, $modal, $http, $timeout, $compile, Profiles, Observations, Global, Restangular, mapLayers, PublishModal) {
    $scope.global = Global;

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

    // filtering
    $scope.filteredProfiles = [];
    $scope.filterProfiles = function() {
        $scope.filteredProfiles = [];
        angular.forEach($scope.profiles, function(profile) {
            if ($scope.doSearch(profile)) $scope.filteredProfiles.push(profile);
        });
    }
    
    // debounce search
    var _searchTimeout;
    $scope.$watch('searchQuery',function(){
        if (_searchTimeout) $timeout.cancel(_searchTimeout);
        _searchTimeout = $timeout(function(){
            $scope._searchQuery = angular.copy($scope.searchQuery);
            $scope.filterProfiles();
        },100);
    }, true);

    $scope.doSearch = function(profile){
        var ok = true;

        // only search through published profiles 
        if (profile.type == 'profile' && !profile.published) return false;

        if ($scope.search_type(profile) === false) ok = false;
        if ($scope.search_date(profile) === false) ok = false;
        if ($scope.search_text(profile) === false) ok = false;
        if ($scope.search_publisher(profile) === false) ok = false;
        if ($scope.search_elevation(profile) === false) ok = false;
        if ($scope.search_aspect(profile) === false) ok = false;
        if ($scope.search_slope(profile) === false) ok = false;

        return ok;
    }


    // debounce plotting of filteredProfiles on map
    var _mapTimeout;
    $scope.$watch('filteredProfiles',function(){
        if (_mapTimeout) $timeout.cancel(_mapTimeout);
        _mapTimeout = $timeout(function() {

            var allMarkers = {};
            $scope.mapLayer.eachLayer(function(marker) { 
                allMarkers[marker.profile._id] = marker;
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
                if(allProfileIds.indexOf(marker.profile._id) == - 1 && marker.options && marker.options.icon && marker.options.icon.options &&
                    marker.options.icon.options.className) {

                    marker.setOpacity(0);
                    marker._icon.style.pointerEvents = "none";
                }
            });

        }, 300);

    },true);
    
    // filters

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
        if (val.user && val.user.student) {
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
    $scope.setAspect = function(deg) {
        if ($scope._searchQuery.aspect_high < deg) $scope._searchQuery.aspect_high = deg;
        else if ($scope._searchQuery.aspect_low > deg) $scope._searchQuery.aspect_low = deg;
        else if (deg > $scope._searchQuery.aspect_low) $scope._searchQuery.aspect_low = deg;
        else if (deg < $scope._searchQuery.aspect_high) $scope._searchQuery.aspect_high = deg;
    }

    // ======= END SEARCH =======


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


    $scope.setBaseLayer = function(layer, clicked) {

        if (clicked) mixpanel.track("set base layer", { alias: layer.alias, name: layer.name });

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
            //newBaseLayer.bringToFront();
        }

        if ($scope.baseLayer) $scope.map.removeLayer($scope.baseLayer);
        $scope.baseLayer = newBaseLayer;

        // save to user settings
        $scope.global.setUserSetting("defaultMap", layer.alias);
    }

    // init mapbox
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

    // pre-compile map popup
    // todo: move this into a standalone template file
    $scope.compiledPopup;
    (function(){

        var html = '<div bindonce="profile">';

        html += '<div class="popup-title">';
        html += "<span bo-if='profile.type==\"profile\"'>Snowpit</span>";
        html += "<span bo-if='profile.type==\"test\"'>SP1 Profile</span>";
        html += "<span bo-if='profile.type==\"avy\"'>Avalanche</span>";

        html += "<div class='expand'><i class='fa fa-search-plus'></i></div>";
        html += '</div>';

        html += '<a href=\'/{{ profile.type.substr(0,1) }}/{{ profile._id }}\' style="color:#222;">'

        html += "<div class='expand'><i class='fa fa-search-plus'></i></div>";

        // profile
        html += '<canvas bo-if="profile.type==\'profile\'" profile="profile" width="200" height="200" class="thumb"></canvas>';
        // test
        html += '<canvas bo-if="profile.type==\'test\'" graph="profile.rows_micro" width="200" height="200" class="thumb"></canvas>';
        // avy
        html += "<div bo-if='profile.type==\"avy\"' bo-show='profile.photos.length' class='thumb' style='background-image:url(\"{{ ::profile.photos[0].url }}\")'></div>";

        html += '<div class="popup-content">';

        html += "<div><i style='margin-right:3px;' class='fa fa-user'></i>  {{ ::profile.user.fullName}} <span bo-show='profile.user.student' style='color: #888;'>&nbsp;&nbsp;<i class='fa fa-graduation-cap'></i>&nbsp;<span style='font-size:8px;position: relative;bottom:1px;'>STUDENT</span></span></div>";

        html += "<div bo-show='profile.organization'><i style='margin-right:3px;' class='fa fa-group'></i>  {{ ::profile.organization.name }}</div>";

        html += "<div><i style='margin-right:3px;' class='fa fa-clock-o'></i>  {{ ::profile.date | date:'M/d/yy'}} {{ ::profile.time | date:'h:mm a'}}</div>";

        // profile or test
        html += "<div bo-if='profile.type==\"profile\" || profile.type==\"test\"' ><i style='margin-right:3px;' class='fa fa-location-arrow'></i>  {{ ::profile.metaData.location }}</div>";
        // avy
        html += "<div bo-if='profile.type==\"avy\"' ><i style='margin-right:3px;' class='fa fa-location-arrow'></i>  {{ ::profile.locationName }}</div>";
        
        html += "</div>";
        html += "</a>";
        html += "</div>";

        $scope.compiledPopup = $compile(angular.element(html));

    })();

    $scope.addToMap = function(profile) {
        if (!profile.location) return;

        var point = [profile.location[1],profile.location[0]];

        // todo: check if point is within map bounds

        var marker = L.marker(point, {
            icon: L.divIcon({
                className: 'count-icon-' + profile.type,
                html: "",
                iconSize: [14, 14]
            })
        });

        // associate profile with marker
        marker.profile = profile;

        // create scope for popup (true indicates isolate scope)
        var newScope = $scope.$new(true);
        newScope.profile = profile;

        // bind scope to pre-compiled popup template
        $scope.compiledPopup(newScope, function(clonedElement) {

            marker.bindPopup(clonedElement[0], {
                className: 'popup-' + profile.type,
                //minWidth: 180,
            });
        });

        marker.addTo($scope.mapLayer);
    }

    $scope.closeThis = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        var el = $($event.target).closest(".open");
        el.data().$dropdownController.toggle()
    };

    var hoverDelay;
    $scope.hoverProfile = function(profile) {
        // debounce
        if (hoverDelay) $timeout.cancel(hoverDelay);
        hoverDelay = $timeout(function(){
            $scope.hideMapButtons = !!profile;

            $scope.mapLayer.eachLayer(function(marker) {

                var className = "count-icon-" + marker.profile.type;
                if (profile) className += ' inactive';

                if (marker.options.icon.options.className.indexOf("selected") == -1) {
                    marker.setIcon(L.divIcon({
                        className: className,
                        html: "",
                        iconSize: [14, 14]
                    }));
                    marker.setZIndexOffset(-1000);
                }

                if(profile && marker.profile.type == profile.type && marker.profile._id == profile._id && 

                    marker.options.icon && 
                    marker.options.icon.options &&
                    marker.options.icon.options.className && 
                    marker.options.icon.options.className.indexOf("selected") == -1) {

                    marker.setIcon(L.divIcon({
                        className: "count-icon-" + marker.profile.type + ' active',
                        html: "",
                        iconSize: [14, 14]
                    }));
                    marker.setZIndexOffset(1000);
                }

            });
        }, 120);
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


    var defaultZoom = 12;
    if (!$scope.global.user.location) $scope.map.setView([40.633052,-111.7111795], defaultZoom); //8
    else $scope.map.setView([$scope.global.user.location[1],$scope.global.user.location[0]], defaultZoom); //8


    $scope.loadMyProfiles = function() {
        $scope.myProfiles = Observations.observations;
    }

    // on map search select
    $scope.mapSearchSelect = function(location) {
        if (location.lat && location.lng)
            $scope.map.setView([location.lat,location.lng], 12,{ animate: true});
    }

    // load profiles
    $scope.loadingNew = false;
    $scope.loadProfiles = function(showLoader) {
        var bounds = $scope.map.getBounds();
        if (showLoader !== false) $scope.loadingNew = true;

        // abort previous profile requests
        if ($scope.canceler) $scope.canceler.resolve();
        $scope.canceler = $q.defer();

        // zoom level
        var verbose = ($scope.map.getZoom() > 7); 

        // padding in pixels (so we don't get cut-off map points)
        var padding = 5;

        var point_ne = $scope.map.latLngToContainerPoint(bounds._northEast);
        point_ne.y += padding; point_ne.x -= padding;
        point_ne = $scope.map.containerPointToLatLng(point_ne);

        var point_sw = $scope.map.latLngToContainerPoint(bounds._southWest);
        point_sw.y -= padding; point_sw.x += padding;
        point_sw = $scope.map.containerPointToLatLng(point_sw);

        // get obs from server
        $http.get('/v1/all-observations', 
        { params: { 
            nelat: point_ne.lat, nelng: point_ne.lng, 
            swlat: point_sw.lat, swlng: point_sw.lng, 
            verbose: verbose
          }, 
          timeout: $scope.canceler.promise
        }).success(function(profiles) {

            var d = new Date().getTime();
            console.log("LOADED!");
            // todo: make this like the "observations" service? (i.e. addorreplace)
            $scope.profiles = profiles;
            $scope.filterProfiles();

            console.log("LOADED 2! " + (new Date().getTime() - d) + " ms");

            $scope.loadingProfiles = false;
            $scope.loadingNew = false;
        });
    }
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
        }, 2000);
    });

    $scope.map.on('zoomend', function() {
        $timeout.cancel($scope.loadProfilesTimer);
        $scope.loadProfilesTimer = $timeout(function(){
            $scope.loadProfiles();
        }, 2000);
        mixpanel.track("zoom", $scope.map.getZoom());
    });

    $scope.href = function (path) {
      $location.path(path);
    };

    // ---------------------------------------------------
    // --------------------- TERRAIN ---------------------
    // ---------------------------------------------------

    // init terrain layer
    var terrainLayer = $scope.terrainLayer = L.tileLayer.terrain({
        zIndex: 999,
        opacity: .5,
        maxNativeZoom: 13
    });
    setTimeout(function(){
        terrainLayer.addTo($scope.map);
    }, 100);

    $scope.map.on('viewreset', function () {
        terrainLayer.redrawQueue = [];
        // workers.forEach(function (worker) {
        //     worker.postMessage('clear');
        // });
    });

    // set terrain overlay
    $scope.terrainOverlay;
    $scope.changeTerrainOverlay = function(overlay) {
        $scope.terrainOverlay = overlay;
        terrainLayer.overlayType = overlay;
        terrainLayer.needsRedraw = true;
    }

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

    // 

    // ---------------------------------------------------
    // --------------------- DRAWING ---------------------
    // ---------------------------------------------------

    $scope._hoverOnLeg = function(index) {
        $scope.hoverOnLeg = index;
    }
    $scope._hoverOnPoint = function(index) {
        $scope.hoverOnPoint = index;
    }

    $scope.formatTime = function(minutes) {
        var str = "";
        if (minutes >= 60) {
            var hours = minutes / 60;
            var mins = Math.floor(minutes % 60);
            str = Math.floor(hours) + " hr";
            if (mins > 0) str += " " + mins + " min";
        }
        else str = Math.floor(minutes) + " min";
        return str;
    }

    $scope.munterRate = {
        up: 4,
        down: 10
    }

});