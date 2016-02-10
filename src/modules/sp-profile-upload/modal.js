
import './modal.html'
import './button.html'

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
            scope.$watch('cancel', () => {
                // alert(scope.cancel === true);
            }, true)

            let filesUpload = element[0].querySelector('input')
            let deviceSerial
            let hashes = []
            let _files = {}

            let uploadFile = (fileBytes, callback) => {
                if (scope.cancel === true) return

                let xhr = new XMLHttpRequest()

                // Update progress bar
                xhr.upload.addEventListener('progress', evt => {
                    if (evt.lengthComputable) {
                        $log.debug((evt.loaded / evt.total) * 100 + '%');
                    }
                }, false)

                xhr.addEventListener('load', () => {}, false)

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            let data = JSON.parse(xhr.responseText)
                            callback(data)
                        }
                    }
                }

                setTimeout(() => {
                    xhr.open('POST', window.apiBaseUrl + 'sp/upload', true)

                    // set token
                    xhr.setRequestHeader('Auth-Token', $http.defaults.headers.common['Auth-Token'])

                    // var formData = new FormData();
                    // formData.append("fileData", file);
                    // xhr.send(formData);

                    xhr.send(fileBytes)
                }, 50)
            }

            let uploadFiles = files => {
                if (scope.cancel === true) return
                if (scope.oncheck) scope.oncheck()

                for (let file of files) {
                    if (file.name.length === 8 && file.name.toLowerCase().indexOf('p') === 0) {
                        let fileNumber = parseInt(file.name.substr(1), 10)
                        let hash = md5(deviceSerial + (fileNumber + ''))

                        _files[hash] = file
                        hashes.push(hash)
                    }
                }

                $log.debug('FILES: ' + hashes.length)

                // ask server which should be uploaded
                $http.post(window.apiBaseUrl + 'sp/checkIfExists', { hashes: hashes })
                    .success(newHashes => {
                        if (newHashes.length === 0) {
                            if (scope.oncomplete) {
                                scope.oncomplete({ uploaded: [] })
                            }

                            return
                        }

                        if (scope.onupload) scope.onupload()

                        let uploadCount = 0
                        let uploaded = []

                        angular.forEach(newHashes, hash => {
                            let file = _files[hash]
                            let reader = new FileReader()

                            reader.onload = e => {
                                let fileBytes = e.target.result

                                uploadFile(fileBytes, (data) => {
                                    if (data.hash && uploaded.indexOf(data.hash) === -1) {
                                        uploaded.push(data.hash)
                                    } else if (data.hash) {
                                        $log.debug('DUPLICATE!')
                                    }

                                    uploadCount++

                                    setTimeout(() => {
                                        let progress = (
                                            (uploadCount / newHashes.length) * 100
                                        ).toFixed(0)

                                        if (scope.onprogress) {
                                            scope.onprogress({ percent: progress })
                                        }
                                    }, 1)

                                    // complete
                                    if (uploadCount === newHashes.length) {
                                        if (scope.oncomplete) {
                                            scope.oncomplete({ uploaded: uploaded })
                                        }

                                        $log.debug('UPLOADED: ' + uploaded.length)
                                    }
                                })
                            }

                            reader.readAsArrayBuffer(file)
                        })
                    })
            }

            let traverseFiles = files => {
                if (typeof files !== 'undefined') {
                    // first check if valid SP1
                    let isSP1 = false

                    let uploadFile = e => {
                        // keep track of serial number
                        deviceSerial = e.target.result.replace(/(\r\n|\n|\r)/gm, '').trim()

                        // valid SP1, continue...
                        uploadFiles(files)
                    }

                    for (let file in files) {
                        if (file.name.toLowerCase() === 'serial.txt') {
                            // get serial number
                            let reader = new FileReader()

                            reader.onload = uploadFile
                            reader.readAsText(file)

                            isSP1 = true
                            break
                        }
                    }

                    // invalid SP1
                    if (!isSP1 && scope.oninvaliddevice) {
                        scope.oninvaliddevice()
                        return
                    }
                } else {
                    // No support for the File API in this web browser
                }
            }

            // var checkInput = function() {
            //     document.body.onfocus = null;
            //     $log.debug(filesUpload.value == null);
            //     // check if uplpading
            //     setTimeout(function(){
            //         if (filesUpload.value == "") {
            //             $log.debug("cancelled!");
            //             scope.oncancel();
            //         }
            //     }, 20 * 1000); // wait 20 seconds
            // }

            filesUpload.addEventListener('click', () => {
                if (scope.onstart) scope.onstart()

                $log.debug(filesUpload.test)

                // document.body.onfocus = function () { setTimeout(checkInput, 200); };
            })

            filesUpload.addEventListener('change', () => traverseFiles(this.files), false)
        }
    })
]
