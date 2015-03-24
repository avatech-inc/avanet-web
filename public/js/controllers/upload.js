angular.module('avatech.upload', ['blueimp.fileupload'])
    .config([ '$httpProvider', 'fileUploadProvider',
        function ($httpProvider, fileUploadProvider) {
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            fileUploadProvider.defaults.redirect = window.location.href.replace(
                /\/[^\/]*$/,
                '/cors/result.html?%s'
            );
            // plugin options:
            angular.extend(fileUploadProvider.defaults, {
                // Enable image resizing, except for Android and Opera,
                // which actually support image resizing, but fail to
                // send Blob objects via XHR requests:
                //disableImageResize: /Android(?!.*Chrome)|Opera/
                //    .test(window.navigator.userAgent),
                //maxFileSize: 5000000,
                // change: function (e, data) {
                //     $.each(data.files, function (index, file) {
                //         console.log('Selected file: ' + file.name);
                //     });
                // },
                url: '/v1/tests/upload'
            });
        }
    ])

    .controller('UploadModalController', [ '$scope','$modalInstance',
        function ($scope, $modalInstance) {
            $scope.closeModal = function (uploaded) {
                $modalInstance.close(uploaded);
            };
        }
    ])

    .controller('UploadController', [ '$scope', '$http', '$timeout', 'Global', 
        function ($scope, $http, $timeout, Global) {

            $scope.closeModal = function() {
                $scope.$parent.$parent.closeModal($scope.uploaded > 0);
            }

            $scope.uploaded = 0;
            $scope.totalUpload = null;
            
            $scope.beginAdd = function() {
                console.log("begin add!");
                //setTimeout(function(){
                    $scope.badFolder = false;
                    $scope.changeStatus("Loading...");
                    $scope.uploading = true;
                    //$scope.$apply();
                //},1);
            }

            $scope.changeStatus = function(status, callback) {
                //setTimeout(function(){
                    $scope.uploadStatus = status;
                    //$scope.$apply();
                    if (callback) $timeout(callback, 300);
                //},1);
            }

            var timeout;
            $scope.onAdd = function() {
                if (timeout) $timeout.cancel(timeout);
                timeout = $timeout(function(){
                    // todo: in the future, differentiate between empty avatech folder and bad folder
                    if ($scope.queue.length == 0) {
                        $scope.uploading = false;
                        $scope.badFolder = true;
                    }
                    else {
                        $scope.changeStatus("Verifying device data...", $scope.startUpload);
                    }
                }, 100);
            }

            $scope.startUpload = function() {
                console.log("uploading!");
                var total = 0;
                $scope.hashed = [];
                angular.forEach($scope.queue, function (file) {

                    file.fileNumber = file.name.substr(file.name.length-9, 5);

                    if (file.name.toLowerCase().indexOf("processed") == 0) {
                        total++;
                        var r = new FileReader();
                        r.onload = (function(file) {
                            return function(e) {
                                var contents = e.target.result;
                                // create unique file hash
                                var fileHash = md5(Global.user._id + file.fileNumber + contents);
                                console.log(fileHash);

                                file.fileHash = fileHash;
                                $scope.hashed.push(file);

                                if ($scope.hashed.length == total) {
                                    //$scope.changeStatus("Verifying data", $scope.checkServer);
                                    $scope.checkServer();
                                }
                            };
                        })(file);
                        r.readAsText(file);
                    }
                });
            };

            $scope.checkServer = function() {
                var authToken = $http.defaults.headers.common['Auth-Token'];

                var hashes = [];
                for (var i = 0; i < $scope.hashed.length; i++) hashes.push($scope.hashed[i].fileHash);
                $http.post("/v1/tests/checkUpload", { hashes: hashes }).success(function(newHashes) {

                    if (newHashes.length == 0) {
                        $scope.upToDate = true;
                    }
                    else {
                        $scope.uploadStatus = "Uploading";
                        $scope.totalUpload = newHashes.length;

                        // tally total files to upload
                        angular.forEach($scope.hashed, function(file) {
                            if (newHashes.indexOf(file.fileHash) > -1)
                                if (findMatchingRaw(file.fileNumber)) $scope.totalUpload++;
                        });

                        angular.forEach($scope.hashed, function(file) {
                            // if the file doesn't already exist, upload it
                            if (newHashes.indexOf(file.fileHash) > -1) {
                                file.formData = { hash: file.fileHash, authToken: authToken };
                                file.$submit();

                                // upload raw data file
                                var rawFile = findMatchingRaw(file.fileNumber);
                                if (rawFile) {
                                    rawFile.formData = { hash: file.fileHash, authToken: authToken };
                                    rawFile.$submit();
                                }
                            }
                        });
                    }
                });
            }

            var findMatchingRaw = function(fileNumber) {
                for (var i = 0; i < $scope.queue.length; i++) {
                    var file = $scope.queue[i];
                    if (file.name.toLowerCase().indexOf("raw") == 0) {
                        if (file.fileNumber == fileNumber) return file;
                    }
                }
                return null;
            }

        }
    ])

    .controller('FileDestroyController', [ '$scope','$http',
        function ($scope, $http) {


            var file = $scope.file,
                state;
            if (file.url) {
                file.$state = function () {
                    return state;
                };
                file.$destroy = function () {
                    state = 'pending';
                    return $http({
                        url: file.deleteUrl,
                        method: file.deleteType
                    }).then(
                        function () {
                            state = 'resolved';
                            $scope.clear(file);
                        },
                        function () {
                            state = 'rejected';
                        }
                    );
                };
            } else if (!file.$cancel && !file._index) {
                file.$cancel = function () {
                    $scope.clear(file);
                };
            }
        }
    ]);