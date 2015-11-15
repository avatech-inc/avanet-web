angular.module('avatech.system').controller('MapController', function ($scope, $q, $state, $location, $modal, $http, $timeout, $compile, Observations, Routes, Global, mapLayers, PublishModal, snowpitExport, $templateRequest, Restangular, ObSearch) {
    $scope.global = Global;

    mixpanel.track("home");

    $scope.map;
    $scope.terrainLayer;
    $scope.obSearch;

    $scope.profiles;
    $scope.detailMode = true;
    $scope.loadingNew = false;
    $scope.loadingProfiles = true;

    $scope.myProfiles = Observations.observations;
    $scope.myRoutes = Routes.observations;

    $scope.showPreviewPane = function() { return $state.current.data.showPreviewPane; }
    $scope.isFullScreen = function() { return $state.current.data.fullScreen; }
    $scope.showBottomPane = function() { return $state.current.name == "index.route"; }
    $scope.showRoutePane = function() { return $state.current.name == "index.route"; }

    $scope.hoverProfile = function(id) { $scope.hoverOb = id; }

    // which list to show in side bar
    $scope.selectedTab = 'obs';
    $scope.selectTab = function(tabName, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.selectedTab = tabName;
        
        // reset scrollbars (todo: hacky! but only way for now)
        $timeout(function(){ $(".nano").nanoScroller(); });
        return false;
    }

    $scope.selectedList = 'published';
    $scope.selectList = function(listName, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.selectedList = listName;

        // clear selected profiles
        $scope.selectedProfiles = [];

        // reset scrollbars (todo: hacky! but only way for now)
        $timeout(function(){ $(".nano").nanoScroller(); });
        return false;
    }


    // ======= SEARCH =======

    //$scope.obSearch = new ObSearch();

    // var searchObs = function() {
    //     // hide all markers
    //     angular.forEach(obsOnMap, function(marker) {
    //         marker.filtered = true;
    //         marker.data.filtered = true;
    //     });
    //     // iterate through obs and filter
    //     angular.forEach($scope.profiles,function(ob) {
    //         ob.filtered = true;
    //         if ($scope.obSearch.doSearch(ob)) {
    //             ob.filtered = false;
    //             obsOnMap[ob._id].filtered = false;
    //             obsOnMap[ob._id].data.filtered = false;
    //         }
    //     });
    //     //pruneCluster.ProcessView();
    // }
    // // debounce search
    // var _searchTimeout;
    // $scope.$watch('obSearch',function() {
    //     if (_searchTimeout) $timeout.cancel(_searchTimeout);
    //     _searchTimeout = $timeout(function() {
    //         searchObs();
    //     }, 120);
    // }, true);
    
    // // filters for my observations (published / unpublished)

    // $scope.my_unpublished = function(profile) {
    //     var ok = (profile.published === false && profile.user._id == $scope.global.user._id);

    //     if ($scope.obSearch.search_type(profile) === false) ok = false;
    //     if ($scope.obSearch.search_text(profile) === false) ok = false;
    //     if ($scope.obSearch.search_elevation(profile) === false) ok = false;
    //     if ($scope.obSearch.search_aspect(profile) === false) ok = false;
    //     if ($scope.obSearch.search_slope(profile) === false) ok = false;

    //     return ok;
    // }
    // $scope.my_published = function(profile) {
    //     var ok = (profile.published === true && profile.user._id == $scope.global.user._id);

    //     if ($scope.obSearch.search_type(profile) === false) ok = false;
    //     if ($scope.obSearch.search_text(profile) === false) ok = false;
    //     if ($scope.obSearch.search_elevation(profile) === false) ok = false;
    //     if ($scope.obSearch.search_aspect(profile) === false) ok = false;
    //     if ($scope.obSearch.search_slope(profile) === false) ok = false;

    //     return ok;
    // }

    // // formatters

    // $scope.formatElev = function(val) {
    //     if (!Global.user.settings) return;
    //     // meters
    //     if (Global.user.settings.elevation == 0)
    //         return val + " m";
    //     // feet
    //     else {
    //         return Math.round(val * 3.28084).toFixed(0) + " ft";
    //     }
    // }
    // $scope.formatTempRange = function(val1,val2) {
    //     if (!Global.user.settings) return;
    //     // meters
    //     if (Global.user.settings.elevation == 0)
    //         return val1 + "-" + val2 + " m";
    //     // feet
    //     else {
    //         return Math.round(val1 * 3.28084).toFixed(0) + "-" + Math.round(val2 * 3.28084).toFixed(0) + " ft";
    //     }
    // }
    // $scope.formatDegSlider = function(val) {
    //     return val + "°"
    // }

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

    $scope.$on('goToUnpublished', function() { 
        $scope.selectedList = 'my_unpublished';
    });

    $scope.$on('profileLoaded', function(e, profile) {
        if (!profile || !profile.location) return;
        $timeout(function() {
            // close open popup
            var closebtn = $(".leaflet-popup-close-button");
            if (closebtn.length) closebtn[0].click();
            // pan to location
            $scope.map.panTo({ lat: profile.location[1], lng: profile.location[0] });
        });
    });

    // show routes on map
    // var paths = [];
    // $scope.$watch('myRoutes',function() {
    //     angular.forEach(paths,function(path) {
    //         path.removeFrom($scope.map);
    //     });

    //     angular.forEach($scope.myRoutes,function(route) {
    //         paths.push(L.geoJson(route.path).addTo($scope.map));
    //     });
    // }, true);

});