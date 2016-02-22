
import find from 'lodash.find'
import { readSerial, hashFilenames, uploadFiles } from './upload'

import './modal.html'
import './button.html'

const _ = { find: find }

export const DeviceUpload = [
    '$uibModal',

    $uibModal => ({
        open: options => {
            let modalInstance = $uibModal.open({
                templateUrl: '/modules/sp-profile-upload/modal.html',
                controller: 'DeviceUploadModalController',
                backdrop: 'static',
                windowClass: 'width-400'
            })

            return modalInstance.result
        }
    })
]

export const DeviceUploadController = [
    '$scope',
    '$rootScope',
    '$uibModalInstance',
    '$timeout',
    'Global',
    'Observations',

    (
        $scope,
        $rootScope,
        $uibModalInstance,
        $timeout,
        Global,
        Observations
    ) => {
        $scope.global = Global
        $scope.isMac = window.navigator.platform.toLowerCase().indexOf('mac') > -1
        $scope.isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1

        $scope.close = () => {
            $scope.cancelled = true
            $uibModalInstance.dismiss()
        }

        $scope.closeAfterUpload = () => {
            $rootScope.$broadcast('goToUnpublished')
            $scope.close()
        }

        if ($scope.isChrome) {
            $scope.screen = 'isConnected'
        } else {
            $scope.screen = 'notChrome'
        }

        $scope.screenOK = () => {
            $scope.screen = 'selectDevice'
        }

        $scope.starting = () => {
            $scope.screen = 'starting'
            $scope.selecting = true

            setTimeout(() => {
                if (!$scope.checking) $scope.processing = true
                $scope.$apply()
            }, 12000)

            $timeout(() => $scope.$apply())
        }

        $scope.checking = () => {
            $scope.processing = true
            $scope.selecting = false
            $scope.checking = true
            $timeout(() => $scope.$apply())
        }

        $scope.uploading = () => {
            $scope.screen = 'uploading'
            $timeout(() => $scope.$apply())
        }

        $scope.invalidDevice = () => {
            alert('The device you selected is not an Avatech SP.')
            $scope.screen = 'selectDevice'
            $timeout(() => $scope.$apply())
        }

        $scope.complete = uploaded => {
            Observations.sync(() => {
                $scope.uploaded = uploaded
                $scope.screen = 'complete'
                $timeout(() => $scope.$apply())
            })
        }

        $scope.cancel = () => {
            $scope.cancelled = true
            $scope.screen = 'selectDevice'
            $timeout(() => $scope.$apply())
        }

        $scope.progressPercent = 0

        $scope.progress = percent => {
            let dif = percent - $scope.progressPercent
            $scope.progressPercent += dif
            $timeout(() => $scope.$apply())
        }
    }
]

// upload button directive

export const SP1Upload = [
    '$q',
    '$http',
    '$timeout',
    '$log',

    (
        $q,
        $http,
        $timeout,
        $log
    ) => ({
        restrict: 'E',
        scope: {
            oncancel: '&',
            oncheck: '&',
            onupload: '&',
            oninvaliddevice: '&',
            oncomplete: '&',
            onstart: '&',
            onadd: '&',
            onload: '&',
            onprogress: '&',
            cancel: '=',
        },
        templateUrl: '/modules/sp-profile-upload/button.html',
        link: (scope, element) => {
            let filesUpload = element[0].querySelector('input')

            filesUpload.addEventListener('click', () => {
                if (scope.onstart) scope.onstart()
            })

            filesUpload.addEventListener('change', e => {
                let endpoint = window.apiBaseUrl + 'sp/bulkUpload'
                let token = $http.defaults.headers.common['Auth-Token']
                let serial = _.find(e.target.files, file => {
                    return file.name.toLowerCase() === 'serial.txt'
                })

                if (typeof serial === 'undefined') {
                    if (scope.oninvaliddevice) scope.oninvaliddevice()

                    return
                }

                readSerial(serial, deviceSerial => {
                    let hashes = hashFilenames(e.target.files, deviceSerial)

                    $http
                        .post(window.apiBaseUrl + 'sp/checkIfExists', {
                            hashes: Object.keys(hashes)
                        })
                        .success(newHashes => {
                            if (scope.oncheck) scope.oncheck()

                            uploadFiles(
                                hashes,
                                newHashes,
                                endpoint,
                                token,
                                () => (scope.cancel === true),
                                percent => {
                                    scope.onprogress({ percent: percent })
                                }, hashes => {
                                    scope.oncomplete({ uploaded: hashes })
                                }
                            )
                        })
                })
            }, false)
        }
    })
]
