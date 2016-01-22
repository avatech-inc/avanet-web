angular.module('avatech')
.controller('SnowpitController', 
    function ($scope, $state, $stateParams, $location, $log, $http, $timeout, snowpitConstants, snowpitViews, snowpitExport, Global, Confirm, LocationSelectModal, Lightbox, PublishModal, Observations) {

        $scope.global = Global;

        $scope.loading = true;

        // constants
        $scope.grainSizes = snowpitConstants.grainSizes;
        $scope.hardness = snowpitConstants.hardness;
        $scope.hardnessCount = Object.keys($scope.hardness).length;
        $scope.today = new Date().toISOString();

        // config
        $scope.graphWidth = 320;

        // define canvas columns
        $scope.columns = [
            { width: 140 },
            { width: 27 },
            { width: $scope.graphWidth },
            { width: 240 }
        ];

        $scope.snowpitWidth = $scope.columns.reduce(function(a,b){ return { width: a.width + b.width}; }).width;
        $scope.snowpitHeight = 600;

        $scope.columnsPrint = [
            { width: 150 },
            { width: 27 },
            { width: 353 },
            { width: 240 }
        ];
        // canvas options
        $scope.canvasOptions = { labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: false, showDensity: false };
        $scope.canvasOptionsPrint = { labelColor: "#000", commentLineColor: "#000", background: "#fff", dashedLineColor: "#aaa", print: true, showDepth: true, showDensity: true };

        $scope.settings = {
            selectedLayer: null,
            dragging: null,
            hoverDragLayer: null,
            view: null,
            depthDescending: true,
            tempMode: false,
            tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
        }

        $scope._isNew = true;
        $scope.rightPaneMode = 'snowpit';

        $scope.profile = null;

        $scope.tooltips = ($state.params.profileId == "new");
        $scope.disableTooltips = function() {
            $scope.tooltips = false;
        }
        // show guidance tooltips if new (wait a second or two after page load)
        setTimeout(function(){ 
            if ($scope.tooltips) { $("#addLayerButton").tooltip('show'); }
        },2000);

        // show other tooltips
        $('.tooltip-trigger').tooltip();

        $scope.getThumbnailURL = function(media) {
            if (media.type == "photo") {
                url = media.URL;
                if (url.indexOf("cloudinary.com") > -1) {
                    var filename = media.URL.substr(media.URL.indexOf("upload/") + 7);
                    filename = filename.substring(filename.indexOf("/") + 1, filename.indexOf("."));
                    url = "http://res.cloudinary.com/avatech/image/upload/w_300/" + filename + ".jpg";
                }
                return url;
            }
        }

        // beacuse of the ui.router hack to allow url transition without loading new state,
        // we have to manually keep track of when to reload state (when they release 'dyanmic
        // params' this can be changed) https://github.com/angular-ui/ui-router/issues/64
        $scope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
            if (fromState.name == toState.name) {
                var isUrlUpdate = (fromParams.profileId == "new" && toParams.profileId == $scope.profile._id);
                if (!isUrlUpdate) {
                    $log.debug("reload!");
                    var go = $scope.$on('$stateChangeSuccess', function () { 
                        $log.debug("success!");
                        $state.go(toState.name, toParams, { reload: true }); 
                        go();
                    });
                }
            }
        });

        $scope.init = function(){
            if ($stateParams.profileId == "new") {
                var profile = { 
                    depth: 150,
                    layers: [],
                    temps: [],
                    tests: [],
                    media: [],
                    density: [],
                    metaData: { },
                    user: { fullName: Global.user.fullName, _id: Global.user._id },
                    type: "snowpit"
                };

                // if location param is specified, set initial location
                if ($stateParams.location) {
                    profile.location = $stateParams.location;
                }

                if ($scope.global.orgs.length) profile.organization = $scope.global.orgs[0]._id;

                $scope.profile = angular.copy(profile);
                $scope.loading = false;
            } else {
                $scope.findOne();
            }
        }


        // PROFILE CRUD

        $scope.findOne = function() {
            $http.get(window.apiBaseUrl + "observations/" + $stateParams.profileId)
            .then(function(res) {
                if (res.status != 200) return;

                var profile = res.data;

                // convert populated org to org _id
                if (profile.organization) profile.organization = profile.organization._id;

                $scope.profile = angular.copy(profile);
                $timeout(function(){
                    $scope.loading = false;
                },400);
                
                $scope._isNew = false;
            });
        };

        // delete profile
        $scope.delete = function() {
            Confirm.open("Are you sure you want to delete this snowpit?").then(function() {
                Observations.remove($scope.profile);
                $location.path('/');
            });
        }

        // create new profile
        $scope.create = function() {
            var profile = $scope.getSanitizedProfileCopy();

            // if no changes have been made, don't create 
            if ((profile.layers && profile.layers.length == 0) &&
                (profile.temps && profile.temps.length == 0) &&
                (profile.tests && profile.tests.length == 0) &&
                (profile.media && profile.media.length == 0) &&
                (profile.density && profile.density.length == 0) &&
                (profile.metaData && Object.keys(profile.metaData).length == 0)) return;

            $http.post(window.apiBaseUrl + "observations/", profile)
            .then(function(res) {

                var _profile = res.data;

                $scope._isNew = false;
                $scope.profile._id = _profile._id;
                $scope.loading = false;
                $location.path('profiles/' + _profile._id).replace();
            });
        };
        // update current profile
        $scope.update = function() {
            var profile = $scope.getSanitizedProfileCopy();
            Observations.save($scope.getSanitizedProfileCopy());
        };

        $scope.getSanitizedProfileCopy = function() {
            // make temp copy of profile
            var profile = angular.copy($scope.profile);

            // make sure observation type is always set
            profile.type = 'snowpit';

            return profile;
        }

        // save profile on changes

        $scope.timer = null;
        $scope.$watch("profile",function(newProfile, oldProfile){
            if (!newProfile) return;

            // calculate layer depth (and keep track of index)
            var runningDepth = $scope.profile.depth;
            angular.forEach($scope.profile.layers,function(layer, index){
                runningDepth -= layer.height;
                layer.depth = runningDepth;
                layer.index = index;
            });
            // calculate views
            $scope.calculateViews();

            if ($scope.timer) $timeout.cancel($scope.timer);
            $scope.timer = $timeout(function(){
                // if new, create
                if ($scope._isNew) $scope.create();
                // otherwise, save
                else if ($scope.profile._id) $scope.update();
            }, 500);
        }, true);


        // DENSITY

        $scope.addDensity = function() {
            if (!$scope.newDensity) return;
            if (!$scope.newDensity.density) return;
            if (!$scope.newDensity.depth) return;

            if ($scope.newDensity.depth > $scope.profile.depth) $scope.newDensity.depth = $scope.profile.depth;
            if ($scope.newDensity.depth < 0) $scope.newDensity.depth = 0;

            if ($scope.settings.depthDescending) $scope.newDensity.depth = $scope.profile.depth - $scope.newDensity.depth;

            $scope.profile.density.push($scope.newDensity);
            $scope.newDensity = null;
        }

        $scope.saveDensity = function(density, newDensity) {
            if (!newDensity) return;
            if (!newDensity.density) return;
            if (!newDensity.depth) return;

            if (newDensity.depth > $scope.profile.depth) newDensity.depth = $scope.profile.depth;
            if (newDensity.depth < 0) newDensity.depth = 0;

            if ($scope.settings.depthDescending) newDensity.depth = $scope.profile.depth - newDensity.depth;

            density.depth = newDensity.depth;
            density.density = newDensity.density;
        }
        $scope.deleteDensity = function(index) {
            if (index == 0) $scope.profile.density.shift();
            else $scope.profile.density.splice(index, 1);
        };

        // PROFILE DEPTH INPUT

        $scope.$watch('settings.selectedLayer.height', function(height){
            if (!$scope.settings.selectedLayer) return;

            var maxHeight = 0;
            for (var i = 0; i < $scope.profile.layers.length ; i++) { 
            if ($scope.profile.layers[i] != $scope.settings.selectedLayer) maxHeight+= $scope.profile.layers[i].height; 
            };
            maxHeight = $scope.profile.depth - maxHeight;
            if (height > maxHeight) $scope.settings.selectedLayer.height = maxHeight;
            if (height < 1 || isNaN(height)) $scope.settings.selectedLayer.height = 1;
        });

        $scope.$watch('profile.depth', function(newSnowpitDepth){
            if (!$scope.profile) return;
            // todo: shouldnt be 150, it should be total layer height (if bigger than 150, could potentially clip)
            if (isNaN(newSnowpitDepth)) newSnowpitDepth = 150;
            $scope.profile._depth = newSnowpitDepth;
        });
        $scope.$watch('profile._depth', function(newSnowpitDepth){
            if (!$scope.profile) return;
            if (newSnowpitDepth != "") {

                newSnowpitDepth = parseInt(newSnowpitDepth);

                // get total height of all layers
                var totalHeight = 0;
                if ($scope.profile.layers) {
                    for (var i = 0; i < $scope.profile.layers.length ; i++) { 
                        totalHeight+= $scope.profile.layers[i].height; 
                    };
                }

                if (newSnowpitDepth < totalHeight) $scope.profile.depth = totalHeight;
                else if (newSnowpitDepth < 10) $scope.profile.depth = 10;
                else if (newSnowpitDepth > 400) $scope.profile.depth = 400;
                else $scope.profile.depth = newSnowpitDepth;

                $scope.profile._depth = $scope.profile.depth;
            }
            else {
                $scope.profile._depth = $scope.profile.depth;
            }
        });

        // PROFILE LOCATION LAT/LNG INPUT

        $scope.$watch('profile.location', function(newLocation){
            if (!$scope.profile) return;
            if (!newLocation) return;
            if (newLocation.length) {
                $scope.profile._lat = newLocation[1];
                $scope.profile._lng = newLocation[0];
            }
        });
        $scope.$watch('profile._lat', function(newLat){
            if (!$scope.profile) return;
            if (!newLat) return;
            newLat = parseFloat(newLat);
            if (isNaN(newLat)) newLat = 0;
            if (newLat > 90) newLat = 90;
            else if (newLat < -90) newLat = -90;
            if (!$scope.profile.location) $scope.profile.location = [0,0];
            $scope.profile.location[1] = newLat;
        });
        $scope.$watch('profile._lng', function(newLng){
            if (!$scope.profile) return;
            if (!newLng) return;
            newLng = parseFloat(newLng);
            if (isNaN(newLng)) newLng = 0;
            if (newLng > 180) newLng = 180;
            else if (newLng < -180) newLng = -180;
            if (!$scope.profile.location) $scope.profile.location = [0,0];
            $scope.profile.location[0] = newLng;
        });

        // TEMPERATURE
            
        $scope.toggleTempMode = function() {
            if($scope.settings.tempMode) {
                $scope.settings.tempMode = false;
            }
            else {
                $scope.settings.tempMode = true;
                $scope.settings.selectedLayer = null; 
                if ($scope.rightPaneMode == 'layer') $scope.rightPaneMode = 'snowpit';
            }
            
        }
        $scope.translateTemp = function(temp) {
            temp = parseFloat(temp);
            if (Global.user.settings.tempUnits == 1) {
                var newTemp = (temp * 1.8 + 32).toFixed(1);
                return (Math.round(newTemp * 1) / 1).toFixed(0) + "°F";
            }
            else return temp.toFixed(1) + "°C";
        }
        $scope.selectTemp = function(temp){
            $scope.selectedTemp = temp;
        }
        $scope.settings.tempInterval = 10;
        $scope.addTemp = function() {
            if (!$scope.profile.temps) $scope.profile.temps = [];
            var newTemp = null;
            if ($scope.profile.temps.length == 0) {
                newTemp = { depth: 0, temp: 0 };
            }
            else {
                var bottomDepth = $scope.profile.temps[$scope.profile.temps.length-1].depth;
                var spacing = $scope.settings.tempInterval;
                if (spacing === null || isNaN(spacing)) {
                    if ($scope.profile.temps.length > 2) spacing = bottomDepth - $scope.profile.temps[$scope.profile.temps.length-2].depth;
                    else spacing = 10;
                }

                if (spacing < 0) spacing = 10;
                if (bottomDepth + spacing > $scope.profile.depth) spacing = $scope.profile.depth - bottomDepth;
                var newDepth = bottomDepth + spacing;
                if (newDepth <= $scope.profile.depth)
                    newTemp = { depth: newDepth, temp: $scope.profile.temps[$scope.profile.temps.length-1].temp };
            }
            if (newTemp) {
                $scope.profile.temps.push(newTemp);
                $scope.selectTemp(newTemp);
            }
        }
        $scope.saveTemp = function(temp, $event, index) {
            var depthInput = $($event.target.parentNode).children(".depth");
            var newDepth = parseInt(depthInput.val());
            if (isNaN(newDepth)) newDepth = temp.depth;
            if (newDepth < 0) newDepth = 0;
            if (newDepth > $scope.profile.depth) newDepth = $scope.profile.depth;

            if ($scope.settings.depthDescending) newDepth = $scope.profile.depth - newDepth;
            temp.depth = newDepth;

            // interesting hack here: this allows the value attribute to stay bound
            $scope.profile.temps = angular.copy($scope.profile.temps);
            // select by index, since the entire array has technically been swapped above
            $scope.selectTemp($scope.profile.temps[index]);
        }
        $scope.deleteTemp = function(temp) {
            $log.debug("delete!");
            var index = null;
            for (var i = 0; i < $scope.profile.temps.length; i++) {
                if ($scope.profile.temps[i] == temp) index = i;
            }
            // todo: why doesn't splice work when index is 0?
            if (index == 0) $scope.profile.temps.shift();
            else if (index) $scope.profile.temps.splice(index, 1);
        }

        // LAYERS

        $scope.$watch('settings.selectedLayer', function(newLayer){
            if (newLayer) {
                // show layer pane
                $scope.rightPaneMode = 'layer';
            }
        });

        $scope.addLayer = function(index) {
            var state = $state.params.profileId;

            // calculate max possible layer height
            var maxHeight = 0;
            for (var i = 0; i < $scope.profile.layers.length ; i++) { 
                maxHeight+= $scope.profile.layers[i].height; 
            };
            maxHeight = $scope.profile.depth - maxHeight;

            if(maxHeight == 0) {
                alert("There isn't room for a new layer.");
                return;
            }

            // if default layer height doesn't fit, use max height
            var newHeight = Math.floor($scope.profile.depth / 5) //30;
            if (maxHeight < newHeight) newHeight = maxHeight;

            var newLayer = { height: newHeight, hardness: 'F', hardness2: null };

            // if index is specified, insert, otherwise, add at bottom
            if (index == null) $scope.profile.layers.push(newLayer);
            else $scope.profile.layers.splice(index + 1, 0, newLayer);

            // hide 'add layer' tooltip
            $timeout(function(){ $(".tooltip").remove() });
            // show tooltip
            if ($scope.tooltips) {
                $timeout(function(){ 
                    $(".layerDrag").tooltip('show');
                    $(".layerHeight").tooltip('show');
                });
            }

            $scope.selectLayer(newLayer);
        }
        $scope.deleteLayer = function() {
            // first get layer index
            var index = null;
            angular.forEach($scope.profile.layers,function(layer, i) {
                if (layer == $scope.settings.selectedLayer) index = i;
            });
            if (index == null) return;

            // splice it out of the array
            $scope.profile.layers.splice(index, 1);
            $scope.settings.selectedLayer = null;
            $scope.rightPaneMode = "snowpit";
        }
        $scope.selectLayer = function(layer){
            $scope.settings.selectedLayer = layer;
        }
        $scope.selectLayerByIndex = function(index) {
            $scope.selectLayer($scope.profile.layers[index]);
        }
        $scope.hoverDragArea = function(layer) {
            $scope.settings.hoverDragLayer = layer;
        }
        $scope.getWidth = function(hardness) {
            return Math.round($scope.graphWidth * $scope.hardness[hardness].width);
        }
        $scope.hardDif = function(layer){
            if (!layer.hardness2) return 0;
            return $scope.getWidth(layer.hardness) - $scope.getWidth(layer.hardness2);
        }
        $scope.hoverComment = function(comment) {
            $scope.settings.hoverComment = comment;
        }

        // if primary grain type is deleted, make secondary grain type primary
        $scope.$watch('settings.selectedLayer.grainType', function(){
            if ($scope.settings && $scope.settings.selectedLayer &&
                $scope.settings.selectedLayer.grainType == null) {
                if ($scope.settings.selectedLayer.grainType2) {
                    $scope.settings.selectedLayer.grainType = $scope.settings.selectedLayer.grainType2;
                    $scope.settings.selectedLayer.grainType2 = null;
                }
            }
        });
        $scope.$watch('profile.surfaceGrainType', function(){
            if ($scope.profile && $scope.profile.surfaceGrainType == null) {
                if ($scope.profile.surfaceGrainType2) {
                    $scope.profile.surfaceGrainType = $scope.profile.surfaceGrainType2;
                    $scope.profile.surfaceGrainType2 = null;
                }
            }
        });

        // VIEWS

        $scope.views = snowpitViews;
        $scope.setView = function(view) {
            $scope.settings.view = view;
        }
        $scope.calculateViews = function() {
            angular.forEach($scope.views,function(view){ if (view.func) view.func($scope.profile); });
        }

        // TOGGLE DEPTH

        $scope.toggleDepthDirection = function() {
            $scope.settings.depthDescending = !$scope.settings.depthDescending;
        }

        // SELECT LOCATION MODAL

        $scope.selectLocation = function() {

            LocationSelectModal.open({
                initialLocation: $scope.profile.location
            }).then(function (location) {
                if (location && location.length == 2) {
                    location[0] = location[0].toFixed(6); 
                    location[1] = location[1].toFixed(6); 

                    $scope.profile.location = location;

                    var featureCodes = 
                        "&featureCode=MT" +
                        "&featureCode=BUTE" +
                        "&featureCode=CNYN" +
                        "&featureCode=CONE" +
                        "&featureCode=CRQ" +
                        "&featureCode=CRQS" +
                        "&featureCode=DVD" +
                        "&featureCode=GAP" +
                        "&featureCode=GRGE" +
                        "&featureCode=HLL" +
                        "&featureCode=HLLS" +
                        "&featureCode=MESA" +
                        "&featureCode=MND" +
                        "&featureCode=MRN" +
                        "&featureCode=MT" +
                        "&featureCode=MTS" +
                        "&featureCode=NTK" +
                        "&featureCode=NTKS" +
                        "&featureCode=PASS" +
                        "&featureCode=PK" +
                        "&featureCode=PKS" +
                        "&featureCode=RDGE" +
                        "&featureCode=RK" +
                        "&featureCode=RKS" +
                        "&featureCode=SLP" +
                        "&featureCode=SPUR" +
                        "&featureCode=VAL" +
                        "&featureCode=VALG" +
                        "&featureCode=VALS" +
                        "&featureCode=VALX" +
                        "&featureCode=VLC";


                    $.getJSON("https://ba-secure.geonames.net/findNearbyJSON?lat=" + location[1] + "&lng=" + location[0] + "" + featureCodes + "&username=avatech")
                    .success(function(data, status, headers, config) {
                        if (data.geonames && data.geonames.length == 1) {
                            var place = data.geonames[0];
                            var name = "";
                            if (place.name) name += place.name;
                            // if US, append admin area code, otherwise append admin area name
                            if (place.countryCode && place.countryCode == "US" && place.adminCode1) name += ", " + place.adminCode1;
                            else if (place.adminName1) name += ", " + place.adminName1;

                            // if metadata is null, initialize
                            if (!$scope.profile.metaData) $scope.profile.metaData = {};

                            if ($scope.profile.locationName == "" || !$scope.profile.locationName)
                                $scope.profile.locationName = name;
                           
                            $scope.$apply();
                        }
                    });
                    $.getJSON("https://ba-secure.geonames.net/srtm3JSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
                    .success(function(data, status, headers, config) {
                        if (data.srtm3) {
                            if (!$scope.profile.metaData) $scope.profile.metaData = {};
                            var elevation = data.srtm3.toFixed(0);
                            // check for 'empty' value of -32768 (http://glcfapp.glcf.umd.edu/data/srtm/questions.shtml#negative)
                            if (elevation != -32768) {
                                $scope.profile.elevation = elevation; // meters
                                $scope.$apply();
                            }
                            // if no data found, check astergdem
                            else {
                                $.getJSON("https://ba-secure.geonames.net/astergdemJSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
                                .success(function(data, status, headers, config) {
                                    if (data.astergdem) {
                                        var elevation = data.astergdem.toFixed(0);
                                        // check for 'empty' value of -9999 
                                        if (elevation != -9999){
                                            $scope.profile.elevation = elevation;
                                            $scope.$apply();
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }, function () {
                // on dismiss
            });
        }

        // EXPORT

        var getProfileForExport = function() {
            var _profile = angular.copy($scope.profile);

            // populate with org details
            if (_profile.organization && !_profile.organization._id) {
                var org;
                for(var i = 0; i < $scope.global.orgs.length; i++) {
                    if ($scope.global.orgs[i]._id == _profile.organization) org = $scope.global.orgs[i];
                }
                if (org) _profile.organization = org;
            }
            return _profile;
        }

        $scope.exportPDF = function() { 
            snowpitExport.PDF(getProfileForExport(), $scope.settings); 
        };
        $scope.exportJPEG = function() { 
            snowpitExport.JPEG(getProfileForExport(), $scope.settings); 
        };
        $scope.exportCSV = function() { 
            snowpitExport.CSV(getProfileForExport()); 
        };

        // PUBLISH

        $scope.publish = function() {

            // get total height of all layers
            var totalHeight = 0;
            for (var i = 0; i < $scope.profile.layers.length ; i++) { 
                totalHeight+= $scope.profile.layers[i].height; 
            };

            // basic validation before publishing

            if (totalHeight != $scope.profile.depth) {
                alert("There is empty space in your snowpit. Please complete this snowpit, or adjust 'Snowpit Depth' as needed.");
                return;
            }
            else if (!$scope.profile.date) {
                alert("Before publishing, you must enter the date and time of this snowpit.");
                return;
            }
            else if (!$scope.profile.location) {
                alert("Before publishing, you must select the location of this profile.");
                $scope.selectLocation();
                return;
            }

            PublishModal.open({ 
                initialSharing: angular.copy($scope.profile)
            })
            .then(function (sharing) {
                angular.extend($scope.profile, sharing);
                $scope.profile.published = true;
                $scope.update();
                $location.path('/obs/' + $scope.profile._id);
            });
        }

        // PHOTO UPLOAD

        $scope.deletePhoto = function(index) {
            if (index == 0) $scope.profile.media.shift();
            else $scope.profile.media.splice(index,1);
        }

        $scope.onFileAdd = function(file) {
            if ($scope.uploading == null) $scope.uploading = [];
            file.uploading = true;
            $scope.uploading.unshift(file);
            $scope.$apply();
        }
        $scope.onFileProgress = function(file) {
            $scope.$apply();
        }

        $scope.onFileUpload = function(file) {
            if ($scope.profile.media == null) $scope.profile.media = [];
            file.uploading = false;
            file.caption = file.name;
            file.type = "photo";
            file.URL = file.url;
            delete file.url;
            $scope.profile.media.unshift(file);
            $scope.$apply();
        };


        $scope.showPhoto = function(index) {
            Lightbox.openModal($scope.profile.media, index);
        }

        // UTILITIES

        $scope.round = function(num) {
            //return parseInt(num.toFixed(0));
            return Math.round(num);
        }

        // set date picker
        // setTimeout(function(){
        //     var picker = new Pikaday({
        //         field: document.getElementById('datepicker')
        //         , maxDate: new Date()
        //         //, format: 'YYYY-MM-DD'
        //         , onSelect: function() {
        //             //$log.debug(picker.toString());
        //             //$log.debug(this.getMoment().format('Do MMMM YYYY'));
        //         }
        //     });
        //     // todo:find a more elegant way to make sure the picker loads the date
        //     setTimeout(function(){
        //         picker.setMoment(moment(document.getElementById('datepicker').value));
        //     },500);
        // },1);
    })

.directive('draggable', function($document, $timeout, $log) {
    return {
      restrict: 'A',
      scope: { layer: '=draggable' },
      link: function(scope, elm, attrs) {

        var startY, initialMouseY, initialHeight;

        var ControlScope = scope.$parent.$parent;
 
        elm.bind('mousedown', function($event) {
            // turn off layer drag tooltip
            $timeout(function(){ $(".tooltip").remove() });

          ControlScope.selectLayer(scope.layer);
          ControlScope.settings.dragging = scope.layer;
          $event.preventDefault();
          initialHeight = scope.layer.height;
          startY = elm.prop('offsetTop');
          initialMouseY = $event.clientY;
          $document.bind('mousemove', mousemove);
          $document.bind('mouseup', mouseup);
          return false;
        });
 
        function mousemove($event) {
          ControlScope.settings.dragging = scope.layer;
          var dy = $event.clientY - initialMouseY;

          var newHeight = initialHeight + (dy / (ControlScope.snowpitHeight / ControlScope.profile.depth));
          if (newHeight < 1) newHeight = 1;
                
          scope.layer.height = Math.round(newHeight);
          scope.$apply();
          return false;
        }
 
        function mouseup() {
            // remove existing tooltips
            $timeout(function(){ $(".tooltip").remove() });
            // show hardness drag tooltip
            $log.debug(ControlScope.tooltips);
            if (ControlScope.tooltips) { $timeout(function(){ $(".hardnessBar").tooltip('show') }); }

          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
          ControlScope.settings.dragging = null;
          scope.$apply();
        }
      }
    };
  })

.directive('draggableHardness', function($document, $timeout, $log) {
    return {
      restrict: 'A',
      scope: { layer: '=draggableHardness' },
      link: function(scope, elm, attrs) {

        var initialMouseX, initialWidth, initialHardness, initialHardness;

        var ControlScope = scope.$parent.$parent;
 
        elm.bind('mousedown', function($event) {
            ControlScope.selectLayer(scope.layer);

            // turn off hardness drag tooltips
            $timeout(function(){ $(".tooltip").remove() });
            // turn off tooltips (if more are added, add to "final" tooltip)
            //ControlScope.disableTooltips();
            //scope.$apply();


            // ControlScope.settings.dragging = scope.layer;
            $event.preventDefault();

            initialHardness = scope.layer.hardness;
            initialHardness2 = scope.layer.hardness2;
            if (!initialHardness2) initialHardness2 = scope.layer.hardness;

            initialMouseX = $event.clientX;

            if (attrs.draggableType == "bottom")
                initialWidth = ControlScope.hardness[initialHardness2].width * ControlScope.graphWidth;
            else
                initialWidth = ControlScope.hardness[initialHardness].width * ControlScope.graphWidth;

            $document.bind('mousemove', mousemove);
            $document.bind('mouseup', mouseup);
            return false;
        });
 
        function mousemove($event) {
            //ControlScope.settings.dragging = scope.layer;
            var dx = $event.clientX - initialMouseX;

            var newPos = Math.round(initialWidth - dx);

            // make sure within mix/max allowed ranges
            var min, max;
            var index = 0;
            for (key in ControlScope.hardness) {
                var hardness = ControlScope.hardness[key]
                var width = hardness.width * ControlScope.graphWidth;
                if (index == 0) min = width;
                else if (index == ControlScope.hardnessCount - 1) max = width;
                index++;
            }
            if (newPos < min) newPos = min;
            if (newPos > max) newPos = max;

            // snap to nearest hardness level
            for (key in ControlScope.hardness) {
                var hardness = ControlScope.hardness[key]
                var width = hardness.width * ControlScope.graphWidth;
                if (newPos > width - 6 && newPos < width + 6) {
                    if (attrs.draggableType == "both") {
                        ControlScope.settings.selectedLayer.hardness = key;
                        ControlScope.settings.selectedLayer.hardness2 = key;
                    }
                    else if (attrs.draggableType == "bottom") {
                        ControlScope.settings.selectedLayer.hardness2 = key;
                    }
                    else if (attrs.draggableType == "top") {
                        $log.debug("top!");
                        ControlScope.settings.selectedLayer.hardness2 = initialHardness2;
                        ControlScope.settings.selectedLayer.hardness = key;
                    }
                    scope.$apply();
                    return;
                }
            }
            return false;
        }
 
        function mouseup() {
            // show top/bottom hardness tooltips
            if (ControlScope.tooltips) $timeout(function(){ 
                $(".hardnessDragTop").tooltip("show") 
                $(".hardnessDragBottom").tooltip("show") 
            });
            // turn off tooltips (if more are added, add to "final" tooltip)
            ControlScope.disableTooltips();
            scope.$apply();


          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
          //ControlScope.settings.dragging = null;
          scope.$apply();
        }
      }
    };
  });