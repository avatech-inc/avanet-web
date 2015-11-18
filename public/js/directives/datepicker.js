


angular.module('avatech').directive('datetimepicker', ['$window', function ($window) {
    return {
        require:'^ngModel',
        restrict:'E',
        scope: { 
          theDate: '=ngModel'
        },
        template: '<input class="form-control" ng-model="dateInput" mo-date-input schema-validate="form" style="width:100px;display:inline-block;vertical-align:bottom;margin-right:6px;"/><timepicker style="display:inline-block;vertical-align:bottom;height:34px;" class="timepicker" ng-model="timeInput" hour-step="1" minute-step="1" show-meridian="true" mousewheel="false" show-spinners="false"></timepicker>',
        link:function (scope, elm, attrs, ctrl) {

          scope.$watch('theDate',function(){
            if (!scope.theDate) scope.theDate = new Date();
            
            scope.internalDate = new Date(scope.theDate);

            scope.dateInput = angular.copy(scope.internalDate);
            scope.timeInput = angular.copy(scope.internalDate);
          }, true);

          scope.$watch('internalDate',function(){


            //if (!scope.internalDate) scope.theDate.$setValidity("bad date", false);
            
            //scope.theDate = scope.internalDate.toISOString();

            // console.log("COMBINED: " + scope.theDate);
            // console.log("--------------------------");
          }, true);

          scope.$watch('dateInput',function() {
            console.log(scope.dateInput);
            if (!scope.dateInput) return console.log("BAD DATE!");

            //console.log("    DATE: " + scope.dateInput.toISOString());
            scope.internalDate.setDate(scope.dateInput.getDate());
            scope.internalDate.setMonth(scope.dateInput.getMonth());
            scope.internalDate.setFullYear(scope.dateInput.getFullYear());
          }, true);

          scope.$watch('timeInput',function(){
            if (!scope.timeInput) return console.log("BAD TIME!");

            //console.log("    TIME: " + scope.timeInput.toISOString());
            scope.internalDate.setMinutes(scope.timeInput.getMinutes());
            scope.internalDate.setHours(scope.timeInput.getHours());
          }, true);

        }
      };
    }
  ]);

angular.module('avatech').directive('moDateInput', ['$window', function ($window) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {

          elm = $(elm)[0];

            setTimeout(function(){
                  var picker = new Pikaday({
                      field: elm,
                      // todo: make this configurable
                      // can't select date greater than today
                      maxDate: new Date(),
                      //, format: 'YYYY-MM-DD'
                      onSelect: function() {
                          //console.log(picker.toString());
                          //console.log(this.getMoment().format('Do MMMM YYYY'));
                      }
                  });
                  // todo:find a more elegant way to make sure the picker loads the date
                  setTimeout(function(){
                      picker.setMoment(moment(elm.value));
                  },400);
            },1);


            var moment = $window.moment;
            var dateFormat = attrs.moMediumDate;
            
            dateFormat = "YYYY-MM-DD";

            attrs.$observe('moDateInput', function (newValue) {
                if (dateFormat == newValue || !ctrl.$modelValue) return;
                dateFormat = newValue;
                ctrl.$modelValue = new Date(ctrl.$setViewValue);
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (!dateFormat || !modelValue) return "";
                var retVal = moment(modelValue).format(dateFormat);
                return retVal;
            });

            ctrl.$parsers.unshift(function (viewValue) {
                var date = moment(viewValue,["YYYY-MM-DD","MM/DD/YY"]);
                return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
            });
        }
    };
}]);


angular.module('avatech').directive('dateInput', ['$window', function ($window) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {

          elm = $(elm)[0];

            var moment = $window.moment;
            var dateFormat = attrs.moMediumDate;
            
            dateFormat = "YYYY-MM-DD";

            attrs.$observe('moDateInput', function (newValue) {
                if (dateFormat == newValue || !ctrl.$modelValue) return;
                dateFormat = newValue;
                ctrl.$modelValue = new Date(ctrl.$setViewValue);
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (!dateFormat || !modelValue) return "";
                var retVal = moment(modelValue).format(dateFormat);
                return retVal;
            });

            ctrl.$parsers.unshift(function (viewValue) {
                var date = moment(viewValue,["YYYY-MM-DD","MM/DD/YY"]);
                return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
            });
        }
    };
}]);