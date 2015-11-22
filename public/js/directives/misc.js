angular.module('avatech').directive('accordionNew', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs, ctrl) {
            $(elem).find(".header").click(function() {
                if ($(this).parent().hasClass("open")) {
                    $(this).parent().removeClass("open");
                }
                else {
                    $(elem).find(".accordion-item").removeClass("open");
                    $(this).parent().addClass("open");
                }
            });
        }
    }
});

// on enter
angular.module('avatech').directive('onenter', function() {
  return {
    restrict: 'A',
    scope: {
      onenter: '&'
    },
    link: function(scope, elem, attr, ctrl) {
      $(elem).keydown(function(event) {
         if (event.keyCode == 13) {
            scope.onenter();
            console.log("enter!");
            return false;
         }
      });
    }
  };
});

angular.module('avatech').directive('focusOn', ['$timeout', '$parse',function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusOn);
      scope.focus = function(modelName) {
        if (!scope[modelName]) scope[modelName] = 0;
        scope[modelName]++;
        console.log(scope[modelName]);
      };
      scope.$watch(model, function(value) {
        $timeout(function() {
          element[0].focus(); 
        });
      });
    }
  };
}]);
angular.module('avatech').directive('autoFocus', function() {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            _element[0].focus();
        }
    };
});

angular.module('avatech.system').directive('windowResize', ['$window', function($window) {
  return function($scope) {
    $scope._getWindowSize = function() {
      $scope.windowHeight = $window.innerHeight;
      $scope.windowWidth  = $window.innerWidth;
    };
    angular.element($window).bind("resize", function() {
      $scope._getWindowSize();
      $scope.$apply();
    });
    $scope._getWindowSize();
  };
}]);

angular.module('avatech.system').directive('onChange', function() {    
    return {
        restrict: 'A',
        scope:{'onChange':'=' },
        link: function(scope, elm, attrs) {
            scope.$watch('onChange', function(nVal) { elm.val(nVal); });            
            elm.bind('blur', function() {
                var currentValue = elm.val();
                if( scope.onChange !== currentValue ) {
                    scope.$apply(function() {
                        scope.onChange = currentValue;
                    });
                }
            });
        }
    };        
});

angular.module('avatech').directive('metersOrFeet', ['$window','$parse', function ($window, $parse) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {
            var metersOrFeet = attrs.metersOrFeet;

            attrs.$observe('metersOrFeet', function (newValue) {
                if (newValue === null) return;
                metersOrFeet = newValue;
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (modelValue === null) return;
                console.log("2: " + modelValue);

                // if feet
                if (metersOrFeet == 1) return Math.round(modelValue * 3.28084);
                else return Math.round(modelValue);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                // if feet
                if (metersOrFeet == 1) {
                    return (viewValue * 0.3048);
                }
                // if meters (multiply by 1 to screen out non-numbers)
                else return (viewValue * 1);
            });
        }
    };
}]);

angular.module('avatech').directive('cmOrIn', ['$window','$parse', function ($window, $parse) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {
            var cmOrIn = attrs.cmOrIn;

            attrs.$observe('cmOrIn', function (newValue) {
                if (newValue === null) return;
                cmOrIn = newValue;
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (modelValue === null) return;
                if (cmOrIn == 1) return Math.round(modelValue * 0.393701); 
                else return Math.round(modelValue);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                // if inches
                if (cmOrIn == 1) {
                    return (viewValue * 2.54);
                }
                // if cm (multiply by 1 to screen out non-numbers)
                else return (viewValue * 1);
            });
        }
    };
}]);

angular.module('avatech').directive('tempUnits', ['$window','$parse', function ($window, $parse) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {
            var tempUnits = attrs.tempUnits;

            attrs.$observe('tempUnits', function (newValue) {
                if (newValue === null) return;
                tempUnits = newValue;
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (modelValue === null) return;
                // if fahrenheit
                if (tempUnits == 'F') return ((modelValue*(9/5))+32);
                else return Math.round(modelValue).toFixed(1);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                // if fahrenheit
                if (viewValue == "-") return "-";
                if (tempUnits == 'F') {
                    return (viewValue - 32) * (5/9);
                }
                // if celsius (multiply by 1 to screen out non-numbers)
                else return (viewValue * 1);
            });
        }
    };
}]);

angular.module('avatech').directive('numberOnly', function () {
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope:{
            allowDecimal: '@',
            allowNegative: '@',
            minNum: '@',
            maxNum: '@'
        },

        link: function (scope, element, attrs, ctrl) {
            if (!ctrl) return;
            ctrl.$parsers.unshift(function (inputValue) {
                var decimalFound = false;
                var digits = inputValue.split('').filter(function (s,i)
                {
                    var b = (!isNaN(s) && s != ' ');
                    if (!b && attrs.allowDecimal && attrs.allowDecimal == "true")
                    {
                        if (s == "." && decimalFound === false)
                        {
                            decimalFound = true;
                            b = true;
                        }
                    }
                    if (!b && attrs.allowNegative && attrs.allowNegative == "true")
                    {
                        b = (s == '-' && i === 0);
                    }

                    return b;
                }).join('');
                if (attrs.maxNum && !isNaN(attrs.maxNum) && parseFloat(digits) > parseFloat(attrs.maxNum))
                {
                    digits = attrs.maxNum;
                }
                if (attrs.minNum && !isNaN(attrs.minNum) && parseFloat(digits) < parseFloat(attrs.minNum))
                {
                    digits = attrs.minNum;
                }
                ctrl.$viewValue = digits;
                ctrl.$render();

                return digits;
            });
        }
    };
});

// closes a bootstrap dropdown when clicked (can be anywhere within the dropdown)
angular.module('avatech').directive('closeDropdownOnClick', function() {    
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {    
            el.bind('click', function($event) {
              console.log("dropdown clicked!");
              var el = $($event.target).closest(".open");
              if (el && el.data().$uibDropdownController) el.data().$uibDropdownController.toggle();
              scope.$apply();
            });
        }
    };        
});

angular.module('avatech.system').directive('tooltipHideOnClick', function() {    
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {    
            el.bind('click', function($event) {
              // var el = $($event.target).closest(".open");
              // if (el && el.data().$dropdownController) el.data().$dropdownController.toggle();
              // scope.$apply();
              el.data().$scope.tt_isOpen = false;
              console.log(el.data().$scope.tt_isOpen);
            });
        }
    };        
});

angular.module('avatech.system').directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});