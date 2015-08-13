angular.module('avatech').directive('time', function($compile) {
  return {
    restrict: 'A', //attribute or element
    scope: {
      model: '=time',
     //bindAttr: '='
    },
    //template: '<div class="some">' +
    //  '<input ng-model="myDirectiveVar"></div>',
    //replace: true,
    //require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      console.debug(scope);

      scope._model = null;

      scope.$watch("model",function(newModel){
        scope._model = angular.copy(newModel);
        var newDate = new Date(newModel);
        if (newModel != null && newDate instanceof Date && !isNaN(newDate.valueOf())) {
          elem.val(formatTime(newDate));
        }
        else elem.val("");
      });

      elem.bind("blur",function(){
        validate(elem.val());
      });
      elem.bind("keydown keypress", function(event) {
        if (event.which === 13) {
            event.preventDefault();
            validate(elem.val());
        }
      });

      function formatTime(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }

      function validate(text) {
        var newTime = parseTime(text);
        console.log(newTime);
        if (newTime != null) scope.model = newTime;
        else scope.model = null;

        console.log(scope.model);
        scope.$apply();
      }

      function insertIntoString(a,b,position) {
        return [a.slice(0, position), b, a.slice(position)].join('');
      }

      function parseTime(text) {
        text = text.trim().toLowerCase();

        if (text == "") return null;

        // try to parse
        var date = Date.parse("1/1/1800 " + text); 

        // if date is invalid, parse manually
        if (isNaN(date)) {
          var AM_PM = "";
          if (text.indexOf("a") > -1 && text.indexOf("p") == -1) AM_PM = "am";
          else if (text.indexOf("p") > -1 && text.indexOf("a") == -1) AM_PM = "pm";

          // strip out everything but numbers and colons
          text = text.replace(/[^0-9:]/g, '');

          var h = 0;
          var m = 0;
          //var s = null;

          // trim length
          text = text.substr(0,6);

          // if no colon, place it
          if (text.indexOf(":") == -1){
            if (text.length == 1 || text.length == 2) text = text + ":00";
            else if (text.length == 3) text = insertIntoString(text,':',1);
            else if (text.length == 4) text = insertIntoString(text,':',2);
            else if (text.length == 5 || text.length == 6) {
              text = insertIntoString(text,':',2);
              text = insertIntoString(text,':',5);
            }
          }

          // split by colon
          var parts = text.split(":");
          for (var p = 0; p < parts.length; p++) {
            var num = parseInt(parts[p]);
            if (num != null && !isNaN(num)) {
              if (p == 0) h = num;
              else if (p == 1) m = num;
              //else if (p == 2) h = num;
            }
          }

          // 24-hour time
          if (h == 0) {
            h = 12; AM_PM = "am";
          }
          else if (h > 12 && h <= 23) {
            h = h - 12; AM_PM = "pm";
          }

          // if junk
          if (h == 0 && m == 0) return null;

          // parse date
          date = Date.parse("1/1/1800 " + h + ":" + m + (AM_PM == "" ? "" : " " + AM_PM) ); 
        }
        // if it's still bad, return null
        if (isNaN(date)) return null;
        else return new Date(date);
      }
    }
  };
});