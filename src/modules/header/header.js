
import './header.html'

const HeaderController = [
    '$scope',
    '$location',
    'RegisterDeviceModal',
    'DeviceUploadModal',
    'Global',
    '$http',
    '$uibModal',

    (
        $scope,
        $location,
        RegisterDeviceModal,
        DeviceUploadModal,
        Global,
        $http,
        $uibModal
    ) => {
        $scope.global = Global

        $scope.registerSP1 = () => RegisterDeviceModal.open()
        $scope.deviceUpload = () => DeviceUploadModal.open()
        $scope.isActive = viewLocation => (viewLocation === $location.path())

        $scope.newOb = type => $uibModal.open({
            templateUrl: '/modules/observations/new.html',
            controller: 'NewObservationModalController',
            backdrop: 'static',
            windowClass: 'width-480',
            resolve: { ob: () => ({ type: type }) }
        }).result.finally(() => {})

        $scope.downloadData = () => {
            $scope.downloading = true

            $http
                .get(window.apiBaseUrl + 'sp/bulkDownload')
                .success(data => {
                    window.location.href = data.url
                    $scope.downloading = false
                })
                .error(() => {
                    $scope.downloading = false
                })
        }
    }
]

export default HeaderController
