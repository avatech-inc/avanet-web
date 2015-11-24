angular.module('avatech').controller('ObservationsController',
function ($scope, $q, $log, $location, $stateParams, $location, $modal, $timeout, Global, Restangular, LocationSelectModal, Confirm, Lightbox) {
    $scope.global = Global;

    $scope.obs = {}; 
    if ($scope.global.orgs.length) $scope.obs.organization = $scope.global.orgs[0]._id;

    $scope.loaded = false;

    $scope.go = function(url) {
        $location.path(url);
    }

    $scope.observationId = $stateParams.observationId;
    if ($stateParams.observationId == "new") {
        $scope.loaded = true;
    } else {
        Restangular.one('observations',$stateParams.observationId).get().then(function(obs) {

            if (obs.organization) obs.organization = obs.organization._id;

            $scope.obs = obs;
            $scope.loaded = true;
        });
    }

    // set date picker
    setTimeout(function(){
        var picker = new Pikaday({
            field: document.getElementById('datepicker')
            , maxDate: new Date()
            //, format: 'YYYY-MM-DD'
            , onSelect: function() {
                //console.log(picker.toString());
                //console.log(this.getMoment().format('Do MMMM YYYY'));
            }
        });
        // todo:find a more elegant way to make sure the picker loads the date
        setTimeout(function(){
            picker.setMoment(moment(document.getElementById('datepicker').value));
        },500);
    },1);


    $scope.remove = function() {
      Confirm.open("Are you sure you want to delete?").then(function (yes) {
            // user pressed yes
            $scope.obs.remove().then(function(profile) {
                $log.debug("removed!");
            });
            $location.path('/');
        }, function () {
            // user pressed no
        });
    }



    // PHOTO UPLOAD

    $scope.deletePhoto = function(index) {
        if (index == 0) $scope.obs.photos.shift();
        else $scope.obs.photos.splice(index,1);
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
        if ($scope.obs.photos == null) $scope.obs.photos = [];
        file.uploading = false;
        file.caption = file.name;
        $scope.obs.photos.unshift(file);
        $scope.$apply();

        console.log($scope.obs);
    };


    $scope.showPhoto = function(index) {
        Lightbox.openModal($scope.obs.photos, index);
    }


    $scope.artificialTriggers = {
        "Explosive": [
            { code: "AA", name: "Artillery" },
            { code: "AE", name: "Explosive thrown or placed on or under snow surface by hand" },
            { code: "AL", name: "Avalauncher" },
            { code: "AB", name: "Explosive detonated above snow surface (air blast)" },
            { code: "AC", name: "Cornice fall triggered by human or explosive action" },
            { code: "AX", name: "Gas exploder" },
            { code: "AH", name: "Explosives placed via helicopter" },
            { code: "AP", name: "Pre-placed, remotely detonated explosive charge" }
        ],
        "Vehicle": [
            { code: "AM", name: "Snowmobile" },
            { code: "AK", name: "Snowcat" },
            { code: "AV", name: "Other Vehicle" } //specify
        ],
        "Human": [
            { code: "AS", name: "Skier" },
            { code: "AR", name: "Snowboarder" },
            { code: "AI", name: "Snowshoer" },
            { code: "AF", name: "Foot penetration" },
            //{ code: "AC", name: "Cornice fall produced by human or explosive action" }
        ],
        "Miscellaneous": [
            { code: "AW", name: "Wildlife" },
            { code: "AU", name: "Unknown artificial trigger" },
            { code: "AO", name: "Unclassified artificial trigger" } //specify
        ]
    };
    $scope.naturalTriggers = [
        { code: "N", name: "Natural trigger" },
        { code: "NC", name: "Cornice fall" },
        { code: "NE", name: "Earthquake" },
        { code: "NI", name: "Ice fall" },
        { code: "NL", name: "Avalanche triggered by loose snow avalanche" },
        { code: "NS", name: "Avalanche triggered by slab avalanche" },
        { code: "NR", name: "Rock fall" },
        { code: "NO", name: "Unclassified natural trigger" } // specify
    ];

    // SUBMIT

    $scope.submit = function() {
        //if ($scope.obsForm.$valid)
        if (!$scope.obs.location) {
            alert("Please select a location");
            return;
        }
        else if (!$scope.obs.date) {
            alert("Please specify a date");
            return;
        }
        else if (!$scope.obs.time) {
            alert("Please specify a time");
            return;
        }
        else if (!$scope.obs.avalancheType) {
            alert("Please specify avalanche type");
            return;
        }
        else if ($scope.obs.slabThickness && $scope.obs.slabThickness != "" && isNaN($scope.obs.slabThickness)) {
            alert("Slab thickness must be a valid number");
            return;
        }
        else if ($scope.obs.slabWidth && $scope.obs.slabWidth != "" && isNaN($scope.obs.slabWidth)) {
            alert("Slab width must be a valid number");
            return;
        }
        else if ($scope.obs.slabVertical && $scope.obs.slabVertical != "" && isNaN($scope.obs.slabVertical)) {
            alert("Vertical fall must be a valid number");
            return;
        }

         // todo: abstract this into controller
            // var modalInstance = $modal.open({
            //     templateUrl: '/modules/snowpit-editor/snowpit-publish-modal.html',
            //     controller: 'SnowpitPublishModalController',
            //     windowClass: 'width-480',
            //     resolve: {
            //         objectName: function() { return 'observation' },
            //         initialSharing: function () {
            //           return {
            //             level: $scope.obs.sharingLevel,
            //             orgs: $scope.obs.sharedOrganizations,
            //             avyCenter: $scope.obs.shareWithAvyCenter,
            //             students: $scope.obs.shareWithStudents,
            //           };
            //         }
            //     }
            // });

            modalInstance.result.then(function (sharing) {
                
                $scope.obs.published = true;
                $scope.obs.sharingLevel = sharing.level;
                $scope.obs.shareWithAvyCenter = sharing.avyCenter;
                $scope.obs.sharedOrganizations = sharing.selectedOrgs;
                $scope.obs.shareWithStudents = sharing.students;
                $scope.obs.type = "avalanche";

                $log.debug($scope.obs);

                if ($scope.observationId == "new") {
                    Restangular.all('observations').post($scope.obs).then(function(newOrg) {
                        //console.log(newOrg);
                        // if (newOrg.success && newOrg.success == false) {
                        //     // handle error
                        // }
                        // else $location.path('orgs/' + newOrg._id);

                        // if (!Global.orgs.length) Global.orgs = [];
                        // Global.orgs.push({ name: newOrg.name, _id: newOrg._id });

                        $location.path('/')
                            .search('lat', $scope.obs.location[1])
                            .search('lng', $scope.obs.location[0]);
                    // error
                    }, function() {

                    });
                }
                else {
                    $scope.obs.save().then(function() {
                         $location.path('/')
                            .search('lat', $scope.obs.location[1])
                            .search('lng', $scope.obs.location[0]);
                    });
                }

            }, function () {
                // on dismiss
            });
    }

    // SECONDARY TRIGGERS
    $scope.addTrigger = function(trigger) {
        if (!$scope.obs.secondaryTriggers) $scope.obs.secondaryTriggers = [];
        if (!$scope.hasTrigger(trigger)) $scope.obs.secondaryTriggers.push(trigger.code);
    }

    $scope.hasTrigger = function(trigger) {
        if (!$scope.obs.secondaryTriggers) return false;
        var hasTrigger = false;
        angular.forEach($scope.obs.secondaryTriggers,function(triggerCode){
            if (triggerCode == trigger.code) hasTrigger = true;
        })
        return hasTrigger;
    }

    $scope.getTriggerName = function(triggerCode) {
        if (!$scope.obs.trigger) return "";
        var name = "";
        if ($scope.obs.trigger == 'A') {
            angular.forEach($scope.artificialTriggers,function(triggers, triggerCategory){
                angular.forEach(triggers, function(trigger){
                    if (trigger.code == triggerCode) return name = triggerCategory + ": " + trigger.name;
                });
            });
        }
        else if ($scope.obs.trigger == 'N') {
            angular.forEach($scope.naturalTriggers,function(trigger){
                if (trigger.code == triggerCode) return name = trigger.name;
            });
        }
        return name;
    }

    // clear secondary triggers when trigger changes
    $scope.$watch("obs.trigger", function(newVal, oldVal){
        if (oldVal != undefined)
            $scope.obs.secondaryTriggers = [];
    }, true);

    // LOCATION LAT/LNG INPUT

        $scope.$watch('obs.location', function(newLocation){
            if (!$scope.obs) return;
            if (!newLocation) return;
            if (newLocation.length) {
                $scope.obs._lat = newLocation[1];
                $scope.obs._lng = newLocation[0];
            }
        });
        $scope.$watch('obs._lat', function(newLat){
            if (!$scope.obs) return;
            if (!newLat) return;
            newLat = parseFloat(newLat);
            if (isNaN(newLat)) newLat = 0;
            if (newLat > 90) newLat = 90;
            else if (newLat < -90) newLat = -90;
            if (!$scope.obs.location) $scope.obs.location = [0,0];
            $scope.obs.location[1] = newLat;
        });
        $scope.$watch('obs._lng', function(newLng){
            if (!$scope.obs) return;
            if (!newLng) return;
            newLng = parseFloat(newLng);
            if (isNaN(newLng)) newLng = 0;
            if (newLng > 180) newLng = 180;
            else if (newLng < -180) newLng = -180;
            if (!$scope.obs.location) $scope.obs.location = [0,0];
            $scope.obs.location[0] = newLng;
        });

    // SELECT LOCATION MODAL

        $scope.selectLocation = function() {

            LocationSelectModal.open({
                initialLocation: $scope.obs.location
            }).then(function (location) {
                if (location && location.length == 2) {
                    location[0] = location[0].toFixed(7); 
                    location[1] = location[1].toFixed(7); 

                    $scope.obs.location = location;

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

                            $scope.obs.locationName = name;
                            //if (place.countryCode) $scope.obs.country = place.countryCode;

                            $scope.$apply();
                        }
                    });
                    $.getJSON("https://ba-secure.geonames.net/srtm3JSON?lat=" + location[1] + "&lng=" + location[0] + "&username=avatech")
                    .success(function(data, status, headers, config) {
                        if (data.srtm3) {
                            var elevation = data.srtm3.toFixed(0);
                            // check for 'empty' value of -32768 (http://glcfapp.glcf.umd.edu/data/srtm/questions.shtml#negative)
                            if (elevation != -32768) {
                                $scope.obs.elevation = elevation; // meters
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
                                            $scope.obs.elevation = elevation;
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

});