angular.module('avatech').controller('MapController', function ($scope, $state, $location, $timeout, Observations, Routes, Global, PublishModal) {
    $scope.global = Global;

    if (__PROD__) {
        mixpanel.track("home");
    }

    var firstTime = true;

    $scope.loadMap = false;
    $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        if (toState.name.indexOf("index") === 0 && firstTime) init();
    });

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

    // filters for my observations (published / unpublished)

    $scope.my_unpublished = function(profile) {
        if (!$scope.obSearch) return false;

        var ok = (profile.published === false && profile.user._id == $scope.global.user._id);

        if ($scope.obSearch.search_type(profile) === false) ok = false;
        if ($scope.obSearch.search_text(profile) === false) ok = false;
        if ($scope.obSearch.search_elevation(profile) === false) ok = false;
        if ($scope.obSearch.search_aspect(profile) === false) ok = false;
        if ($scope.obSearch.search_slope(profile) === false) ok = false;

        return ok;
    }
    $scope.my_published = function(profile) {
        if (!$scope.obSearch) return false;

        var ok = (profile.published === true && profile.user._id == $scope.global.user._id);

        if ($scope.obSearch.search_type(profile) === false) ok = false;
        if ($scope.obSearch.search_text(profile) === false) ok = false;
        if ($scope.obSearch.search_elevation(profile) === false) ok = false;
        if ($scope.obSearch.search_aspect(profile) === false) ok = false;
        if ($scope.obSearch.search_slope(profile) === false) ok = false;

        return ok;
    }

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
            // update profiles with new sharing settings
            angular.forEach($scope.selectedProfiles, function(profile) {
                angular.extend(profile, sharing);
                Observations.save(profile);
            });
            // clear selected profiles
            $scope.selectedProfiles = [];
        });
    }

    $scope.$on('goToUnpublished', function() { 
        $scope.selectedTab = 'obs';
        $scope.selectedList = 'my_unpublished';
    });

    function init() {
        firstTime = false;

        // when an observation preview is loaded, go to location on map
        $scope.$on('observationLoaded', function(e, ob) {
            if (!ob || !ob.location) return;
            $timeout(function() {
                var point = new L.LatLng(ob.location[1], ob.location[0]);
                // close any open popups
                var closebtn = $(".leaflet-popup-close-button");
                if (closebtn.length) closebtn[0].click();

                // if location is outside current map, pan to location
                if ($scope.map && !$scope.map.getBounds().contains(point)) {
                    $scope.map.setView(point, 13, { animate: false });
                }
            });
        });

        $scope.loadMap = true;
    }
});