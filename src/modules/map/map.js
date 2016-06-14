
import './map.html'

const MapController = [
    '$scope',
    '$state',
    '$timeout',
    'Observations',
    'Routes',
    'Global',
    'PublishModal',

    (
        $scope,
        $state,
        $timeout,
        Observations,
        Routes,
        Global,
        PublishModal
    ) => {
        $scope.global = Global

        let firstTime = true

        let init = () => {
            firstTime = false

            // when an observation preview is loaded, go to location on map
            $scope.$on('observationLoaded', (e, ob) => {
                if (!ob || !ob.location) return

                $timeout(() => {
                    let point = new L.LatLng(
                        ob.location[1],
                        ob.location[0]
                    )

                    // close any open popups
                    let closebtn = $('.leaflet-popup-close-button')

                    if (closebtn.length) closebtn[0].click()

                    // if location is outside current map, pan to location
                    if ($scope.map && !$scope.map.getBounds().contains(point)) {
                        $scope.map.setView(point, 13, { animate: false })
                    }
                })
            })

            $scope.loadMap = true
        }

        $scope.loadMap = false
        $scope.$on('$stateChangeSuccess', (event, toState) => {
            if (toState.name.indexOf('index') === 0 && firstTime) {
                init()
            }
        })

        $scope.detailMode = true
        $scope.loadingNew = false
        $scope.loadingProfiles = true

        $scope.myProfiles = Observations.observations
        $scope.myRoutes = Routes.routes

        $scope.showPreviewPane = () => !!$state.current.data.showPreviewPane
        $scope.isFullScreen = () => !!$state.current.data.fullScreen
        $scope.showBottomPane = () => $state.current.name === 'index.route'
        $scope.showRoutePane = () => $state.current.name === 'index.route'

        $scope.hoverProfile = id => { $scope.hoverOb = id }

        // which list to show in side bar
        $scope.selectedTab = 'obs'

        $scope.selectTab = (tabName, $event) => {
            $event.preventDefault()
            $event.stopPropagation()
            $scope.selectedTab = tabName

            // reset scrollbars (todo: hacky! but only way for now)
            $timeout(() => $('.nano').nanoScroller())
            return false
        }

        $scope.selectedList = 'published'
        $scope.selectList = (listName, $event) => {
            $event.preventDefault()
            $event.stopPropagation()
            $scope.selectedList = listName

            // clear selected profiles
            $scope.selectedProfiles = []

            // reset scrollbars (todo: hacky! but only way for now)
            $timeout(() => $('.nano').nanoScroller())
            return false
        }

        // filters for my observations (published / unpublished)

        $scope.my_unpublished = profile => {
            if (!$scope.obSearch) return false

            let ok = (
                profile.published === false &&
                profile.user._id === $scope.global.user._id
            )

            if ($scope.obSearch.search_type(profile) === false) ok = false
            if ($scope.obSearch.search_text(profile) === false) ok = false
            if ($scope.obSearch.search_elevation(profile) === false) ok = false
            if ($scope.obSearch.search_aspect(profile) === false) ok = false
            if ($scope.obSearch.search_slope(profile) === false) ok = false

            return ok
        }

        $scope.my_published = profile => {
            if (!$scope.obSearch) return false

            let ok = (
                profile.published === true &&
                profile.user._id === $scope.global.user._id
            )

            if ($scope.obSearch.search_type(profile) === false) ok = false
            if ($scope.obSearch.search_text(profile) === false) ok = false
            if ($scope.obSearch.search_elevation(profile) === false) ok = false
            if ($scope.obSearch.search_aspect(profile) === false) ok = false
            if ($scope.obSearch.search_slope(profile) === false) ok = false

            return ok
        }

        // DRAFTS

        $scope.selectedProfiles = []

        $scope.selectProfile = profile => {
            let index = $scope.getProfileSelectedIndex(profile)

            if (index > -1) {
                $scope.selectedProfiles.splice(index, 1)
                return false
            }

            $scope.selectedProfiles.push(profile)

            return false
        }

        $scope.getProfileSelectedIndex = profile => {
            for (let i = 0; i < $scope.selectedProfiles.length; i++) {
                if ($scope.selectedProfiles[i]._id === profile._id) {
                    return i
                }
            }

            return -1
        }

        $scope.isProfileSelected = profile => ($scope.getProfileSelectedIndex(profile) !== -1)

        $scope.publishProfiles = () => {
            PublishModal
                .open({ initialSharing: null })
                .then(sharing => {
                    // update profiles with new sharing settings
                    angular.forEach($scope.selectedProfiles, profile => {
                        angular.extend(profile, sharing)
                        Observations.save(profile)
                    })

                    // clear selected profiles
                    $scope.selectedProfiles = []
                })
        }

        $scope.$on('goToUnpublished', () => {
            $scope.selectedTab = 'obs'
            $scope.selectedList = 'my_unpublished'
        })
    }
]

export default MapController
