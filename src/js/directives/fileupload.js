
// file upload

angular.module('avatech').directive('uploader', function($http, $timeout, $log) {
  return {
    restrict: 'E',
    scope: { 
      onadd: '&',
      onload: '&',
      onprogress: '&',
      onupload: '&'
    },
    template: "<div class='upload-area'><input type='file' multiple/><div class='drop-area'><div class='big'>Drop photos here</div><div class='small'>or click to select files</div></div></div>",
    link: function(scope, element) {

      var filesUpload = element[0].querySelector("input");
      var dropArea = element[0].querySelector(".upload-area");

      function uploadFile (file) {

            var ext = file.name.substr(file.name.lastIndexOf(".") + 1).toLowerCase();
            $log.debug(ext);
            if (['jpg','png','gif','bmp'].indexOf(ext) == -1) return;

            var fileObject = { 
              name: file.name.replace(/\.[^/.]+$/, ""), 
              progress: 0
            };

            if (scope.onadd) scope.onadd({ file: fileObject });
            if (scope.onprogress) scope.onprogress({ file: fileObject });

            var xhr = new XMLHttpRequest();
            
            // Update progress bar
            xhr.upload.addEventListener("progress", function (evt) {
              if (evt.lengthComputable) {
                var progress = (evt.loaded / evt.total) * 100;
                if (progress > fileObject.progress) fileObject.progress = progress;
                progress = parseInt(progress);
                if (scope.onprogress) scope.onprogress({ file: fileObject });
              }
            }, false);
            
            // xhr.addEventListener("load", function () { }, false);

            xhr.onreadystatechange = function() {
              var status;
              var data;
              if (xhr.readyState == 4) {
                status = xhr.status;
                if (status == 200) {
                  data = JSON.parse(xhr.responseText);
                  fileObject.url = data.secure_url;
                  fileObject.cloudinary_format = data.format;
                  fileObject.cloudinary_id = data.public_id;

                  delete fileObject.progress;
                  delete fileObject.uploading;

                  if (scope.onupload) scope.onupload({ file: fileObject });
                } else {
                  //errorHandler && errorHandler(status);
                }
              }
            };

            xhr.open("POST", "https://api.cloudinary.com/v1_1/avatech/upload", true);

            var formData = new FormData();
            formData.append("upload_preset", "mqemm6fd");
            formData.append("file", file);
            xhr.send(formData);

            // setTimeout(function(){

            //   $log.debug(file);

            //   // var fileObject = { name: file.name };
            //   // if (scope.onadd) scope.onadd({ file: fileObject });

            //   // var img = new Image();
            //   // var reader = new FileReader();
            //   // reader.onload = (function (_img, fileName, _file) {
            //   //   fileObject.progress = 20; if (scope.onprogress) scope.onprogress({ file: fileObject });
            //   //   return function (evt) {
            //   //     _img.onload = function () { uploadImage(_img, fileName, _file); };
            //   //     _img.src = evt.target.result;
            //   //   };
            //   // }(img, file.name, fileObject));
            //   // reader.readAsDataURL(file);
            // },100);
        }

        // function uploadImage(img, fileName, fileObject) {

        //   fileObject.progress = 30; if (scope.onprogress) scope.onprogress({ file: fileObject });

        //   // downsample image
        //   var max = 2400;
        //   if (img.width > max) {
        //     img.width = max;
        //     img.height = img.height * (img.width / img.naturalWidth);
        //   }
        //   else if (img.height > max) {
        //     img.height = max;
        //     img.width = img.width * (img.height / img.naturalHeight);
        //   }

        //   fileObject.progress = 40; if (scope.onprogress) scope.onprogress({ file: fileObject });

        //   var canvas = document.createElement('canvas');
        //   canvas.width = img.width;
        //   canvas.height = img.height;

        //   // hide canvas
        //   canvas.style.opacity = "0";
        //   canvas.style.position = "absolute";
        //   canvas.style.zIndex = "-1";
        //   canvas.style.left = "-999999px";
        //   document.body.appendChild(canvas);

        //   // load into canvas
        //   var context = canvas.getContext('2d');
        //   context.drawImage(img, 0, 0, img.width, img.height);

        //   fileObject.progress = 50; if (scope.onprogress) scope.onprogress({ file: fileObject });
        //   // // resize
        //   // function resize_image( src, dst, type, quality ) {
        //   //    var tmp = new Image(),
        //   //        _canvas, _context, cW, cH;
           
        //   //    type = type || 'image/jpeg';
        //   //    quality = quality || 0.92;
           
        //   //    cW = src.naturalWidth;
        //   //    cH = src.naturalHeight;
           
        //   //    tmp.src = src.src;
        //   //    tmp.onload = function() {
           
        //   //       _canvas = document.createElement( 'canvas' );
           
        //   //       cW /= 2;
        //   //       cH /= 2;
           
        //   //       if ( cW < src.width ) cW = src.width;
        //   //       if ( cH < src.height ) cH = src.height;
           
        //   //       _canvas.width = cW;
        //   //       _canvas.height = cH;
        //   //       _context = canvas.getContext( '2d' );
        //   //       _context.drawImage( tmp, 0, 0, cW, cH );
           
        //   //       //dst.src = _canvas.toDataURL( type, quality );
           
        //   //       if ( cW <= src.width || cH <= src.height )
        //   //          return _canvas;
           
        //   //       // tmp.src = dst.src;
        //   //       // return _canvas;
        //   //    }
        //   // }
        //   // var dst = new Image();
        //   // img.width = img.width / 4;
        //   // img.height = img.height / 4;

        //   // var newCanvas = resize_image(img,dst,"image/jpeg", 1);
        //   // $log.debug(newCanvas.width + "," + newCanvas.height);
        //   $log.debug(canvas.width + "," + canvas.height);
        //   //return;

        //   // get data url of canvas
        //   var dataUrl = canvas.toDataURL("image/jpeg", .8);

        //   //scope.file = { url: dataUrl, name: fileName };

        //   if (scope.onload) scope.onload({ file: fileObject });

        //   // data url to blob
        //   var b64 = dataUrl.slice(dataUrl.indexOf(',')+1);
        //   var arr = atob(b64).split('').map(function (e) {return e.charCodeAt(0);});
        //   var blob = new Blob([new Uint8Array(arr)],{ type: "image/jpeg"});
        //   $log.debug(blob);

        //   //setTimeout(function(){
        //   fileObject.progress = 60; if (scope.onprogress) scope.onprogress({ file: fileObject });
        //   //},10);

        //   var xhr = new XMLHttpRequest();
          
        //   // Update progress bar
        //   xhr.upload.addEventListener("progress", function (evt) {
        //     if (evt.lengthComputable) {
        //       $log.debug((evt.loaded / evt.total) * 100 + "%"); 
        //       var progress = (evt.loaded / evt.total) * 100;
        //       $log.debug(progress + "," + fileObject.progress);
        //       if (progress > fileObject.progress) fileObject.progress = progress;
        //       if (scope.onprogress) scope.onprogress({ file: fileObject });
        //     }
        //     else {
        //       // No data to calculate on
        //     }
        //   }, false);
          
        //   xhr.addEventListener("load", function () {

        //   }, false);

        //   xhr.onreadystatechange = function() {
        //     var status;
        //     var data;
        //     if (xhr.readyState == 4) {
        //       status = xhr.status;
        //       if (status == 200) {
        //         data = JSON.parse(xhr.responseText);
        //         fileObject.url = data.url;
        //         if (scope.onupload) scope.onupload({ file: fileObject });
        //         document.body.removeChild(canvas);
        //       } else {
        //         //errorHandler && errorHandler(status);
        //       }
        //     }
        //   };

        //   xhr.open("POST", "/upload", true);

        //   var formData = new FormData();
        //   formData.append("fileData", blob);
        //   xhr.send(formData);
        // }
        
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
        
        dropArea.addEventListener("dragleave", function (evt) {
          var target = evt.target;
          
            angular.element(dropArea).removeClass("over");
          if (target && target === dropArea) {
            angular.element(dropArea).removeClass("over");
          }
          evt.preventDefault();
          evt.stopPropagation();
        }, false);
        
        dropArea.addEventListener("dragenter", function (evt) {
          angular.element(this).addClass("over");
          evt.preventDefault();
          evt.stopPropagation();
        }, false);
        
        dropArea.addEventListener("dragover", function (evt) {
          angular.element(this).addClass("over");
          evt.preventDefault();
          evt.stopPropagation();
        }, false);
        
        dropArea.addEventListener("drop", function (evt) {
          traverseFiles(evt.dataTransfer.files);
          angular.element(this).removeClass("over");
          evt.preventDefault();
          evt.stopPropagation();
        }, false);
    }
  };
});