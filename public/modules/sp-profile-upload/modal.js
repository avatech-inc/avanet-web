angular.module('avatech').factory('DeviceUploadModal', function ($uibModal) {
    return { open: function(options) {
        var modalInstance = $uibModal.open({
            templateUrl: '/modules/device-upload-modal/modal.html',
            controller: 'DeviceUploadModalController',
            backdrop: 'static',
            windowClass: 'width-400'
        });
        return modalInstance.result;
    }
}});

angular.module('avatech').controller('DeviceUploadModalController',
    function ($scope, $location, $rootScope, $uibModalInstance, $timeout, $http, Global, Observations) {

        $scope.global = Global;

        $scope.isMac = window.navigator.platform.toLowerCase().indexOf("mac") > -1;
        $scope.isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

        $scope.close = function() {
            $scope.cancelled = true;
            $uibModalInstance.dismiss();
        };
        $scope.closeAfterUpload = function() { 
            $rootScope.$broadcast('goToUnpublished');
            $scope.close();
        }

        if ($scope.isChrome) $scope.screen = "isConnected";
        else $scope.screen = "notChrome";

        $scope.screenOK = function() {
            $scope.screen = "selectDevice";
        }
        $scope.starting = function() {
            $scope.screen = "starting";
            $scope.selecting = true;
            setTimeout(function(){
                if (!$scope.checking) $scope.processing = true;
                $scope.$apply();
            }, 12000);
            $timeout(function() { $scope.$apply(); });
        }
        $scope.checking = function() {
            $scope.processing = true;
            $scope.selecting = false;
            $scope.checking = true;
            $timeout(function() { $scope.$apply(); });
        }
        $scope.uploading = function() {
            $scope.screen = "uploading";
            $timeout(function() { $scope.$apply(); });
        }
        $scope.invalidDevice = function() {
            alert("The device you selected is not an Avatech SP.")
            $scope.screen = "selectDevice";
            $timeout(function() { $scope.$apply(); });
        }
        $scope.complete = function(uploaded) {
            Observations.sync(function() {
                $scope.uploaded = uploaded;
                $scope.screen = "complete";
                $timeout(function() { $scope.$apply(); });
            });
        }
        $scope.cancel = function() {
            $scope.cancelled = true;
            $scope.screen = "selectDevice";
            $timeout(function() { $scope.$apply(); });
        }

        $scope.progressPercent = 0;
        $scope.progress = function(percent) {
            var dif = percent - $scope.progressPercent;
            $scope.progressPercent += dif;
            $timeout(function() { $scope.$apply(); });
        }
    }
);


// upload button directive

angular.module('avatech').directive('sp1Upload', function($q, $http, $timeout) {
  return {
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
    template: "<button class='upload-area btn btn-primary btn-lg'>Select SP<input name='fileUpload' type='file' webkitdirectory directory mozdirectory></button>",
    link: function(scope, element) {

      scope.$watch("cancel",function(){
        //alert(scope.cancel === true);
      }, true);

      var filesUpload = element[0].querySelector("input");

      var deviceSerial;

      var hashes = [];
      var _files = {};

      function uploadFiles(files) {

            if (scope.cancel === true) return;

            if (scope.oncheck) scope.oncheck();

            for (var i=0, l=files.length; i<l; i++) {

                var file = files[i];

                if (file.name.length == 8 && file.name.toLowerCase().indexOf("p") == 0) {
                    var fileNumber = parseInt(file.name.substr(1));
                    var hash = md5(deviceSerial + (fileNumber + ''));

                    _files[hash] = file;
                    hashes.push(hash);
                }
            }
            console.log("FILES: " + hashes.length);

            // ask server which should be uploaded
            $http.post(window.apiBaseUrl + 'sp/checkIfExists', { hashes: hashes }).
              success(function(newHashes) {

                if (newHashes.length == 0) {
                    if (scope.oncomplete) scope.oncomplete({ uploaded: [] });
                    return;
                }

                if (scope.onupload) scope.onupload();

                var uploadCount = 0;

                // uploaded files
                var uploaded = [];

                angular.forEach(newHashes, function(hash) {

                    var file = _files[hash];
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var fileBytes = e.target.result;
                        uploadFile(fileBytes, function(data) {

                            if (data.hash && uploaded.indexOf(data.hash) == -1) uploaded.push(data.hash);
                            else if (data.hash) console.log("DUPLICATE!");

                            uploadCount++;
                            setTimeout(function(){
                                var progress = ((uploadCount / newHashes.length) * 100).toFixed(0);
                                if (scope.onprogress) scope.onprogress({ percent: progress });
                            },1);

                            // complete
                            if(uploadCount == newHashes.length) {
                                if (scope.oncomplete) scope.oncomplete({ uploaded: uploaded });
                                console.log("UPLOADED: " + uploaded.length);
                            }
                        });
                    }
                    reader.readAsArrayBuffer(file);
                });
                //}

              });
        }

        function uploadFile(fileBytes, callback) {

          if (scope.cancel === true) return;

          var xhr = new XMLHttpRequest();
          
          // Update progress bar
          xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
              console.log((evt.loaded / evt.total) * 100 + "%"); 
            }
          }, false);
          
          xhr.addEventListener("load", function () {

          }, false);

          xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
              if (xhr.status == 200) {
                data = JSON.parse(xhr.responseText);
                callback(data);
              }
            }
          };


            setTimeout(function() {

              xhr.open("POST", window.apiBaseUrl + "sp/upload", true);

              // set token
              xhr.setRequestHeader('Auth-Token', $http.defaults.headers.common['Auth-Token']);

              //var formData = new FormData();
              //formData.append("fileData", file);
              //xhr.send(formData);
              xhr.send(fileBytes);

            }, 50)
        }

        
        function traverseFiles (files) {
          if (typeof files !== "undefined") {

            // first check if valid SP1
            var isSP1 = false;
            for (var i=0, l=files.length; i<l; i++) {
                if (files[i].name.toLowerCase() == "serial.txt") { 
                    // get serial number
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        // keep track of serial number
                        deviceSerial = e.target.result.replace(/(\r\n|\n|\r)/gm,"").trim();

                        // valid SP1, continue...
                        uploadFiles(files);
                    }
                    reader.readAsText(files[i]);

                    isSP1 = true; 
                    break; 
                }
            }
            // invalid SP1
            if (!isSP1 && scope.oninvaliddevice) {
                scope.oninvaliddevice(); 
                return;
            }
          }
          else {
           // No support for the File API in this web browser
          } 
        }

        // var checkInput = function() {
        //     document.body.onfocus = null;
        //     console.log(filesUpload.value == null);
        //     // check if uplpading
        //     setTimeout(function(){
        //         if (filesUpload.value == "") {
        //             console.log("cancelled!");
        //             scope.oncancel();
        //         }
        //     }, 20 * 1000); // wait 20 seconds
        // }

        filesUpload.addEventListener("click", function() {
            if (scope.onstart) scope.onstart();
            console.log(filesUpload.test);
            //document.body.onfocus = function () { setTimeout(checkInput, 200); };
        });
        
        filesUpload.addEventListener("change", function() {
            traverseFiles(this.files);
        }, false);
    }
  };
});