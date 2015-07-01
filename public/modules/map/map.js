angular.module('avatech.system').controller('MapController', function ($rootScope, $q, $scope, $state, $location, $modal, $http, $timeout, $compile, Profiles, Observations, Global, Restangular, mapLayers, PublishModal) {
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

        // marker.on('mouseover', function(e) {
        //     e.layer.openPopup();
        // });
        // marker.on('mouseout', function(e) {
        //     e.layer.closePopup();
        // });

        // marker.on('click', function (e) {
        //         var linkFunction = $compile(angular.element(html));
        //         var newScope = $scope.$new();
        //         newScope.profile =  profile;
        //         var str = linkFunction(newScope)[0];

        //         this.bindPopup(str, {
        //             className: 'popup-' + profile.type,
        //             minWidth: 180,
        //         });
        // });

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

            //$timeout(function() { $scope.$apply(); });
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

    //$scope.highLevelMap = false;
    $scope.map.on('zoomend', function() {
        $timeout.cancel($scope.loadProfilesTimer);
        $scope.loadProfilesTimer = $timeout(function(){
            $scope.loadProfiles();
        }, 2000);
        mixpanel.track("zoom", $scope.map.getZoom());

        console.log("ZOOM: " + $scope.map.getZoom());

        // if ($scope.map.getZoom() < 8) {
        //     $scope.highLevelMap = true;
        // }

        
        // here's where you decided what zoom levels the layer should and should
        // not be available for: use javascript comparisons like < and > if
        // you want something other than just one zoom level, like
        // (map.getZoom > 10)

        //console.log(zoom);
        // if (zoom < 9) {

        //     //$scope.mapLayer.setFilter(function() { return false; });
        //     //console.log($scope.mapLayer);
        //     //$scope.mapLayer.setOpacity(0);
        //     $scope.mapLayer.eachLayer(function(marker) {
        //         //if(allProfileIds.indexOf(marker.profile._id) == - 1) {
        //             //$scope.mapLayer.removeLayer(marker);
        //             //marker.setOpacity(.2);
        //             console.log(marker);
        //             //marker._icon.className += " tiny";
        //             //marker._icon.iconSize = [10, 10];
        //             marker.options.icon.options.iconSize = [10, 10];
        //         //}
        //         // // open popup automatically if new_id is specified (from querystring)
        //         // if ($scope.new_id && marker.profile._id == $scope.new_id) {
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

    $scope.href = function (path) {
      $location.path(path);
    };

    // -------------------------------------------------------------------------

    L.TileLayer.prototype._getTileSize = function () {
        var map = this._map,
            options = this.options,
            zoom = map.getZoom() + options.zoomOffset,
            zoomN = options.maxNativeZoom;

        // increase tile size when overscaling
        return zoomN !== null && zoom > zoomN ?
                Math.round(options.tileSize / map.getZoomScale(zoomN, zoom)) : 
                options.tileSize;
    };

    var maxNativeZoom = 13;
    var terrainLayer = L.tileLayer.canvas({
        zIndex: 999,
        opacity: .4,
        maxNativeZoom: maxNativeZoom
    });
    var altitude, azimuth, shadows, highlights;
    var zFactor = .12;

    terrainLayer.redrawQueue = [];

    var uniqueId = (function () {
        var lastId = 0;
        return function () {
            return ++lastId;
        };
    })();

    //var workers = [];
    var workers = {};

    var elevationData = {}

    function updateTile(e) {
        if (e.data.terrainData) {
            var terrainData = {
                elevation: e.data.terrainData[0],
                slope: e.data.terrainData[1],
                aspect: e.data.terrainData[2]
            }
            console.log(terrainData);
            return;
        }

        var ctx = contexts[e.data.id];
        var tileSize = ctx.canvas.width;

        //elevationData[e.data.id] = e.data.dem;

        // regular tile
        if (tileSize == 256) {
            var imgData = ctx.createImageData(256, 256);
            imgData.data.set(new Uint8ClampedArray(e.data.pixels));
            ctx.putImageData(imgData, 0, 0);
        }
        // overzoom
        else {
            var temp_canvas = document.createElement('canvas');
            temp_canvas.width = temp_canvas.height = 256;
            var temp_context = temp_canvas.getContext('2d');
            var imgData = temp_context.createImageData(256, 256);
            imgData.data.set(new Uint8ClampedArray(e.data.pixels));
            temp_context.putImageData(imgData, 0, 0);

            var imageObject=new Image();
            imageObject.onload=function(){
                ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
                ctx.drawImage(imageObject,0,0, 256, 256, 0, 0, tileSize, tileSize);
            }
            imageObject.src=temp_canvas.toDataURL();
        }
    }

    // for (var i = 0; i < 20; i++) {
    //     workers[i] = new Worker('/modules/map/terrain-worker.js');
    //     workers[i].onmessage = updateTile;
    // }

    $scope.map.on('viewreset', function () {
        terrainLayer.redrawQueue = [];
        // workers.forEach(function (worker) {
        //     worker.postMessage('clear');
        // });
    });


    var contexts = {};
    terrainLayer.drawTile = function(canvas, tilePoint, zoom) {
        var tileSize = terrainLayer._getTileSize();
        canvas.width = canvas.height = tileSize;

        var renderedZFactor;
        //var context_id = uniqueId();

        var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + zoom;

        var PNG_data;

         if (zoom > maxNativeZoom) zoom = maxNativeZoom;
        contexts[tile_id] = canvas.getContext('2d');

        function redraw() {
            // if no terrain overlay specified, clear canvas
            if (!$scope.terrainOverlay) {
                var context = canvas.getContext('2d');
                context.clearRect ( 0 , 0 , canvas.width, canvas.height );
                return;
            }


            var transferable = [];
            var data = { id: tile_id };

            if (renderedZFactor !== zFactor) {
                data.raster = PNG_data;
                data.zFactor = zFactor;
                data.url = url;
                transferable.push(data.raster);
            }
            data.processType = $scope.terrainOverlay;

            // sun location
            if ($scope.terrainOverlay == "sun") {
                var mapCenter = $scope.map.getCenter();
                var _date = new Date($scope.sunDate);
                _date.setHours(_date.getHours() - 1 - 1); // adjust for 0-23, adjust to match CalTopo
                var pos = SunCalc.getPosition(_date, mapCenter.lat, mapCenter.lng);
                data.altitude = pos.altitude * (180 / Math.PI);
                data.azimuth = pos.azimuth * (180 / Math.PI);
            }


    //     workers[i] = new Worker('/modules/map/terrain-worker.js');
    //     workers[i].onmessage = updateTile;


            if (!workers[tile_id]) {
                workers[tile_id] = new Worker('/modules/map/terrain-worker.js');
                workers[tile_id].onmessage = updateTile;
            }

            //var workerIndex = (tilePoint.x + tilePoint.y) % workers.length;
            // workers[workerIndex].context_id = context_id;
            // workers[workerIndex].postMessage(data, transferable);

            //workers[context_id].context_id = context_id;
            workers[tile_id].postMessage(data, transferable);

            renderedZFactor = zFactor;
        }

       
        // invert for TMS
        //tilePoint.y = (1 << zoom) - tilePoint.y - 1; 
        var url = L.Util.template('https://s3.amazonaws.com/avatech-tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
       
        //var url = L.Util.template('/tiles/{z}/{x}/{y}.png', L.extend({ z: zoom }, tilePoint));
        
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            if (xhr.status != 200) return;
            var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);

            var png = new PNG(data);
            if (png) {
                var pixels = png.decodePixels();
                PNG_data = new Uint8ClampedArray(pixels).buffer;

                redraw();
                terrainLayer.redrawQueue.push(redraw);
            }
        };
        return xhr.send(null);
    }

    terrainLayer.redrawTiles = function () {
        terrainLayer.redrawQueue.forEach(function(redraw) { redraw(); });
    };
    setTimeout(function(){
        terrainLayer.addTo($scope.map);
    }, 100);

    // --------

    $scope.sunHours = 17;
    var _debounce;
    $scope.$watch('sunHours', function() {
        if (_debounce) $timeout.cancel(_debounce);
        _debounce = $timeout(function(){
            needsRedraw = true;

            $scope.sunDate = new Date(); 
            $scope.sunDate.setTime(Date.parse("2015 01 01"));
            $scope.sunDate.setHours($scope.sunHours);
            if ($scope.sunHours % 1 == .5) $scope.sunDate.setMinutes(30);
        }, 50);

    },true);

    var needsRedraw = false;
    function redraw() {
        if (needsRedraw) terrainLayer.redrawTiles();
        needsRedraw = false;
        window.requestAnimationFrame(redraw);
    }
    redraw();

    $scope.terrainOverlay = "";
    $scope.changeTerrainOverlay = function(overlay) {
        $scope.terrainOverlay = overlay;
        needsRedraw = true;
        //redraw();
    }

    // ----- MAP CLICK -----

    function latLngToTilePoint(lat, lng, zoom) {
        lat *= (Math.PI/180);
        return {
            x: parseInt(Math.floor( (lng + 180) / 360 * (1<<zoom) )),
            y: parseInt(Math.floor( (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * (1<<zoom) ))
        }
    }
    function tilePointToLatLng(x, y, zoom) {
        var n = Math.PI-2*Math.PI*y/Math.pow(2,zoom);
        return {
            lng: (x/Math.pow(2,zoom)*360-180),
            lat: (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))))
        }
    }

    $scope.map.on('click', function(e) {
        // adjust zoom level for overzoom
        var zoom = Math.min(maxNativeZoom, $scope.map.getZoom());
        // get xyz of clicked tile based on clicked lat/lng
        var tilePoint = latLngToTilePoint(
            e.latlng.lat,
            e.latlng.lng,
            zoom
        );
        // get nw lat/lng of tile
        var backToLatLng = tilePointToLatLng(tilePoint.x, tilePoint.y, zoom);
        // get nw container point of tile
        var containerPoint = $scope.map.latLngToContainerPoint(backToLatLng);
        // subtract clicked container point from nw container point to get point within tile
        var pointInTile = {
            x: e.containerPoint.x - containerPoint.x,
            y: e.containerPoint.y - containerPoint.y
        }
        // adjust points for overzoom
        if ($scope.map.getZoom() > maxNativeZoom) {
            var zoomDifference = $scope.map.getZoom() - maxNativeZoom;
            var zoomDivide = Math.pow(2, zoomDifference)

            pointInTile.x = Math.floor(pointInTile.x / zoomDivide);
            pointInTile.y = Math.floor(pointInTile.y / zoomDivide);
        }

        // send point to tile worker
        var tile_id = tilePoint.x + "_" + tilePoint.y + "_" + $scope.map.getZoom();
        var worker = workers[tile_id];
        if (worker != null) worker.postMessage({ id: tile_id, pointInTile: pointInTile });

    });



    // ---------------------------------------------------
    // --------------------- DRAWING ---------------------
    // ---------------------------------------------------


    var featureGroup = L.featureGroup().addTo($scope.map);
     var drawControl = new L.Control.Draw({
        // edit: {
        //     featureGroup: featureGroup,
        //     polyline: {
        //         shapeOptions: {
        //             color: '#0000ff',
        //             weight: 4
        //         },
        //         metric: false
        //     }
        // },
        draw: {
            featureGroup: featureGroup,
            polyline: {
                shapeOptions: {
                    color: '#0000ff',
                    weight: 3
                },
                metric: false
            },
            polygon: false,
            marker: false,
            rectangle: false,
            circle: false,
            repeatMode: true
        }
      }).addTo($scope.map);

     //L.drawLocal.draw.toolbar.buttons.polyline = 'Draw a new route';

     var geoJSON = {
        "name":"NewFeatureType",
        "type":"FeatureCollection",
        "features":[
        {
            "type":"Feature",
            "geometry": {
                "type":"LineString",
                "coordinates":[]
            },
            "properties": null
        }
        ]}

        function interpolate(_points) {
            var new_points = [];
           for (var i = 0; i < _points.length; i++) {
                new_points[i*2] = _points[i];
          }

           for (var i = 0; i < new_points.length; i++) {
                if (!new_points[i]) {
                    var startPoint =  new google.maps.LatLng(new_points[i-1].lat, new_points[i-1].lng); 
                    var endPoint = new google.maps.LatLng(new_points[i+1].lat, new_points[i+1].lng); 
                    var percentage = 0.5; 
                    var middlePoint = new google.maps.geometry.spherical.interpolate(startPoint, endPoint, percentage); 
                    new_points[i] = { lat: middlePoint.A, lng: middlePoint.F }
                }
          }

            return new_points;
        }

      var lastLine;
      var lastLayer;
      $scope.map.on('draw:created', function(e) {
          if (lastLayer) featureGroup.removeLayer(lastLayer);
          if (lastLine) $scope.map.removeLayer(lastLine);

          lastLayer = e.layer;
          featureGroup.addLayer(e.layer);

          if (el) el.clear();
          createElevationProfile();

          var points = [];



          var point_string = "";
           for (var i = 0; i < e.layer._latlngs.length; i++) {
               points.push(e.layer._latlngs[i]);
               //point_string += point.lng + "," + point.lat + ";";
               //point_string += ";"
          }


          while ((points.length * 2) -1 <= 200) {
            points = interpolate(points);
          }


           for (var i = 0; i < points.length; i++) {
                point_string += points[i].lng + "," + points[i].lat + ";";
          }

          point_string = point_string.substring(0,point_string.length-1);
          console.log(point_string);

          $.getJSON("http://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points=" +
            //"-112.084004,36.05322;-112.083914,36.053573;-112.083965,36.053845"
            point_string 
            + "&access_token=pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg", function(data) {
                console.log(data.results);

                geoJSON.features[0].geometry.coordinates = [];
                for (var i=0; i< data.results.length; i++) {
                    geoJSON.features[0].geometry.coordinates.push([
                        data.results[i].latlng.lng,
                        data.results[i].latlng.lat,
                        data.results[i].ele
                    ]);
                }

                lastLine = L.geoJson(geoJSON,{
                    onEachFeature: el.addData.bind(el) //working on a better solution
                }).addTo($scope.map);
            })
          //console.log(e.layer);

          // for (var i = 0; i < e.layer._latlngs.length; i++) {
          //   var point = e.layer._latlngs[i];

          // }

          //el.addData(e.layer);

            // L.geoJson(e.layer,{
            //     onEachFeature: el.addData.bind(el) //working on a better solution
            // }).addTo($scope.map);
      });
    
        var el;
        function createElevationProfile() {

            if (el) el.removeFrom($scope.map);
            el = L.control.elevation({
                position: "topright",
                theme: "steelblue-theme", //default: lime-theme
                imperial: true,
                width: 600,
                height: 125,
                margins: {
                    top: 10,
                    right: 20,
                    bottom: 30,
                    left: 50
                },
                useHeightIndicator: true, //if false a marker is drawn at map position
                interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
                hoverNumber: {
                    decimalsX: 3, //decimals on distance (always in km)
                    decimalsY: 0, //deciamls on height (always in m)
                    formatter: undefined //custom formatter function may be injected
                },
                xTicks: undefined, //number of ticks in x axis, calculated by default according to width
                yTicks: undefined, //number of ticks on y axis, calculated by default according to height
                collapsed: false    //collapsed mode, show chart on click or mouseover
            });
            el.addTo($scope.map);
        }

});