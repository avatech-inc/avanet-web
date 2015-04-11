
angular.module('avatech').directive('imageUpload', ['$http','$timeout', function($http, $timeout) {
  return {
    restrict: 'A',
    scope: { 
      onadd: '&',
      onload: '&',
      onprogress: '&',
      onupload: '&'
    },
    //template: "<div class='upload-area'><input type='file' multiple/><div class='drop-area'><div class='big'>Drop photos here</div><div class='small'>or click to select files</div></div></div>",
    link: function(scope, element) {

      var label = document.createElement("label");

      var filesUpload = document.createElement("input");
      filesUpload.type = 'file';
      console.log(element);
      label.appendChild(filesUpload);
      element[0].appendChild(label);

      // CSS
      if (element[0].style.position != "relative" && element[0].style.position != "absolute") {
        element[0].style.position = "relative";
      }
      label.setAttribute("style", "background: red; position: absolute; top: 0; left: 0; width: 100%; bottom: 0; opacity: 0; cursor: pointer !important; margin: 0 !important; padding: 0 !important;");
      filesUpload.setAttribute("style", "position: fixed; top: -1000000px;");

      //var filesUpload = element[0].querySelector("input");
      //var dropArea = element[0].querySelector(".upload-area");

      function uploadFile (file) {

            var ext = file.name.substr(file.name.lastIndexOf(".") + 1).toLowerCase();
            console.log(ext);
            if (['jpg','png','gif','bmp'].indexOf(ext) == -1) return;

            setTimeout(function(){
              var fileObject = { name: file.name };
              if (scope.onadd) scope.onadd({ file: fileObject });

              var img = new Image();
              var reader = new FileReader();
              reader.onload = (function (_img, fileName, _file) {
                fileObject.progress = 20; if (scope.onprogress) scope.onprogress({ file: fileObject });
                return function (evt) {
                  _img.onload = function () { uploadImage(_img, fileName, _file); };
                  _img.src = evt.target.result;
                };
              }(img, file.name, fileObject));
              reader.readAsDataURL(file);
            },100);
        }

        function uploadImage(img, fileName, fileObject) {

          fileObject.progress = 30; if (scope.onprogress) scope.onprogress({ file: fileObject });

          // downsample image
          var max = 600;
          if (img.width > max) {
            img.width = max;
            img.height = img.height * (img.width / img.naturalWidth);
          }
          else if (img.height > max) {
            img.height = max;
            img.width = img.width * (img.height / img.naturalHeight);
          }

          fileObject.progress = 40; if (scope.onprogress) scope.onprogress({ file: fileObject });

          var canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          // hide canvas
          canvas.style.opacity = "0";
          canvas.style.position = "absolute";
          canvas.style.zIndex = "-1";
          canvas.style.left = "-999999px";
          document.body.appendChild(canvas);

          // draw white background
          var context = canvas.getContext('2d');
          context.fillStyle = '#fff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          // load into canvas
          context.drawImage(img, 0, 0, img.width, img.height);

          fileObject.progress = 50; if (scope.onprogress) scope.onprogress({ file: fileObject });
          
          console.log(canvas.width + "," + canvas.height);

          // get data url of canvas
          var dataUrl = canvas.toDataURL("image/jpeg", 1);

          //scope.file = { url: dataUrl, name: fileName };

          if (scope.onload) scope.onload({ file: fileObject });

          // data url to blob
          var b64 = dataUrl.slice(dataUrl.indexOf(',')+1);
          var arr = atob(b64).split('').map(function (e) {return e.charCodeAt(0);});
          var blob = new Blob([new Uint8Array(arr)],{ type: "image/jpeg"});
          console.log(blob);

          //setTimeout(function(){
          fileObject.progress = 60; if (scope.onprogress) scope.onprogress({ file: fileObject });
          //},10);

          var xhr = new XMLHttpRequest();
          
          // Update progress bar
          xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
              console.log((evt.loaded / evt.total) * 100 + "%"); 
              var progress = (evt.loaded / evt.total) * 100;
              console.log(progress + "," + fileObject.progress);
              if (progress > fileObject.progress) fileObject.progress = progress;
              if (scope.onprogress) scope.onprogress({ file: fileObject });
            }
            else {
              // No data to calculate on
            }
          }, false);
          
          xhr.addEventListener("load", function () {

          }, false);

          xhr.onreadystatechange = function() {
            var status;
            var data;
            if (xhr.readyState == 4) {
              status = xhr.status;
              if (status == 200) {
                data = JSON.parse(xhr.responseText);
                fileObject.url = data.url;
                if (scope.onupload) scope.onupload({ file: fileObject });
                document.body.removeChild(canvas);
              } else {
                //errorHandler && errorHandler(status);
              }
            }
          };

          xhr.open("POST", "/upload", true);

          var formData = new FormData();
          formData.append("fileData", blob);
          xhr.send(formData);
        }
        
        function traverseFiles (files) {
          if (typeof files !== "undefined") {
            for (var i=0, l=files.length; i<l; i++) {
              uploadFile(files[i]);
            }
          }
          else {
           // fileList.innerHTML = "No support for the File API in this web browser";
          } 
        }
        
        filesUpload.addEventListener("change", function () {
          traverseFiles(this.files);
        }, false);
        
        // dropArea.addEventListener("dragleave", function (evt) {
        //   var target = evt.target;
          
        //     angular.element(dropArea).removeClass("over");
        //   if (target && target === dropArea) {
        //     angular.element(dropArea).removeClass("over");
        //   }
        //   evt.preventDefault();
        //   evt.stopPropagation();
        // }, false);
        
        // dropArea.addEventListener("dragenter", function (evt) {
        //   angular.element(this).addClass("over");
        //   evt.preventDefault();
        //   evt.stopPropagation();
        // }, false);
        
        // dropArea.addEventListener("dragover", function (evt) {
        //   angular.element(this).addClass("over");
        //   evt.preventDefault();
        //   evt.stopPropagation();
        // }, false);
        
        // dropArea.addEventListener("drop", function (evt) {
        //   traverseFiles(evt.dataTransfer.files);
        //   angular.element(this).removeClass("over");
        //   evt.preventDefault();
        //   evt.stopPropagation();
        // }, false);
    }
  };
}]);