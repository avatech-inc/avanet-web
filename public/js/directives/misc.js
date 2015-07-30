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
  }
});

angular.module('avatech').directive('thumbnail', ['$timeout', '$parse',function($timeout, $parse) {
  return {
    restrict: 'A',
    scope: {
      photo: '=thumbnail'
    },
    link: function(scope, element, attrs) {

        scope.$watch('photo', function() {

            var url = scope.photo.url;

            if (scope.photo.cloudinary_id && scope.photo.cloudinary_format) url = "https://res.cloudinary.com/avatech/image/upload/w_200/" + scope.photo.cloudinary_id + "." + scope.photo.cloudinary_format;
            
            element[0].style.background = "url('" + url + "')"; 
        });

    }
  };
}]);

angular.module('avatech').directive('focusOn', ['$timeout', '$parse',function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusOn);
      scope.focus = function(modelName) {
        if (!scope[modelName]) scope[modelName] = 0;
        scope[modelName]++;
        console.log(scope[modelName]);
      }
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
  }
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
                if (newValue == null) return;
                metersOrFeet = newValue;
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (modelValue == null) return;
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
                if (newValue == null) return;
                cmOrIn = newValue;
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (modelValue == null) return;
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
                if (newValue == null) return;
                tempUnits = newValue;
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (modelValue == null) return;
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

        link: function (scope, element, attrs, ctrl)
        {
            if (!ctrl) return;
            ctrl.$parsers.unshift(function (inputValue) {
                var decimalFound = false;
                var digits = inputValue.split('').filter(function (s,i)
                {
                    var b = (!isNaN(s) && s != ' ');
                    if (!b && attrs.allowDecimal && attrs.allowDecimal == "true")
                    {
                        if (s == "." && decimalFound == false)
                        {
                            decimalFound = true;
                            b = true;
                        }
                    }
                    if (!b && attrs.allowNegative && attrs.allowNegative == "true")
                    {
                        b = (s == '-' && i == 0);
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
              if (el && el.data().$dropdownController) el.data().$dropdownController.toggle();
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

// slider
(function(){var n,t,e,a,r,o,s,l,u,i,c,p,f,d,v,h,g;n="uiSlider",t="slider",e=function(n){return angular.element(n)},p=function(n){return""+n+"px"},s=function(n){return n.css({opacity:0})},v=function(n){return n.css({opacity:1})},i=function(n,t){return n.css({left:t})},o=function(n){return n[0].offsetWidth/2},c=function(n){return n[0].offsetLeft},g=function(n){return n[0].offsetWidth},r=function(n,t){return c(t)-c(n)-g(n)},a=function(n,t){return n.attr("ng-bind-html-unsafe",t)},d=function(n,t,e,a){var r,o,s,l;return null==a&&(a=0),null==e&&(e=1/Math.pow(10,t)),o=(n-a)%e,l=o>e/2?n+e-o:n-o,r=Math.pow(10,t),s=l*r/r,s.toFixed(t)},l={mouse:{start:"mousedown",move:"mousemove",end:"mouseup"},touch:{start:"touchstart",move:"touchmove",end:"touchend"}},h=function(n){return{restrict:"EA",scope:{floor:"@",ceiling:"@",step:"@",precision:"@",ngModel:"=?",ngModelLow:"=?",ngModelHigh:"=?",translate:"&"},template:'<span class="bar"></span><span class="bar selection"></span><span class="pointer"></span><span class="pointer"></span><span class="bubble selection"></span><span ng-bind-html-unsafe="translate({value: floor})" class="bubble limit"></span><span ng-bind-html-unsafe="translate({value: ceiling})" class="bubble limit"></span><span class="bubble"></span><span class="bubble"></span><span class="bubble"></span>',compile:function(t,u){var f,h,m,b,M,w,F,C,L,x,$,y,H,I,E,R,W,X,z;if(u.translate&&u.$set("translate",""+u.translate+"(value)"),x=null==u.ngModel&&null!=u.ngModelLow&&null!=u.ngModelHigh,X=function(){var n,a,r,o;for(r=t.children(),o=[],n=0,a=r.length;a>n;n++)m=r[n],o.push(e(m));return o}(),M=X[0],H=X[1],L=X[2],C=X[3],I=X[4],b=X[5],f=X[6],F=X[7],w=X[8],h=X[9],y=x?"ngModelLow":"ngModel",$="ngModelHigh",a(I,"'Range: ' + translate({value: diff})"),a(F,"translate({value: "+y+"})"),a(w,"translate({value: "+$+"})"),a(h,"translate({value: "+y+"}) + ' - ' + translate({value: "+$+"})"),!x)for(z=[H,C,I,w,h],R=0,W=z.length;W>R;R++)t=z[R],t.remove();return E=[y,"floor","ceiling"],x&&E.push($),{post:function(t,a,u){var m,R,W,X,z,A,B,D,P,S,j,k,q,G,J;for(R=!1,D=e(document),u.translate||(t.translate=function(n){return n.value}),S=m=A=X=B=z=k=P=void 0,W=function(){var n,e,a,r,s;for(null==(r=t.precision)&&(t.precision=0),null==(s=t.step)&&(t.step=1),e=0,a=E.length;a>e;e++)n=E[e],t[n]=d(parseFloat(t[n]),parseInt(t.precision),parseFloat(t.step),parseFloat(t.floor));return t.diff=d(t[$]-t[y],parseInt(t.precision),parseFloat(t.step),parseFloat(t.floor)),S=o(L),m=g(M),A=0,X=m-g(L),B=parseFloat(u.floor),z=parseFloat(u.ceiling),k=z-B,P=X-A},j=function(){var n,e,u,M,E,z,j,q;return W(),M=function(n){return 100*((n-A)/P)},z=function(n){return 100*((n-B)/k)},E=function(n){return p(n*P/100)},u=function(n){return i(n,p(Math.min(Math.max(0,c(n)),m-g(n))))},q=function(){var n,e;return i(f,p(m-g(f))),e=z(t[y]),i(L,E(e)),i(F,p(c(L)-o(F)+S)),x?(n=z(t[$]),i(C,E(n)),i(w,p(c(C)-o(w)+S)),i(H,p(c(L)+S)),H.css({width:E(n-e)}),i(I,p(c(H)+o(H)-o(I))),i(h,p(c(H)+o(H)-o(h)))):void 0},n=function(){var n;return u(F),n=w,x&&(u(w),u(I),10>r(F,w)?(s(F),s(w),u(h),v(h),n=h):(v(F),v(w),s(h),n=w)),5>r(b,F)?s(b):x?5>r(b,n)?s(b):v(b):v(b),5>r(F,f)?s(f):x?5>r(n,f)?s(f):v(f):v(f)},e=function(n,e,r){var o,s,l;return o=function(){return n.removeClass("active"),D.unbind(r.move),D.unbind(r.end)},s=function(n){var r,o,s,l;return r=n.clientX||n.touches[0].clientX,o=r-a[0].getBoundingClientRect().left-S,o=Math.max(Math.min(o,X),A),s=M(o),l=B+k*s/100,x&&(e===y?l>t[$]&&(e=$,L.removeClass("active"),C.addClass("active")):t[y]>l&&(e=y,C.removeClass("active"),L.addClass("active"))),l=d(l,parseInt(t.precision),parseFloat(t.step),parseFloat(t.floor)),t[e]=l,t.$apply()},l=function(t){return n.addClass("active"),W(),t.stopPropagation(),t.preventDefault(),D.bind(r.move,s),D.bind(r.end,o)},n.bind(r.start,l)},j=function(){var n,t,a,r,o,s;for(R=!0,n=function(n){return e(L,y,l[n]),e(C,$,l[n])},o=["touch","mouse"],s=[],a=0,r=o.length;r>a;a++)t=o[a],s.push(n(t));return s},q(),n(),R?void 0:j()},n(j),G=0,J=E.length;J>G;G++)q=E[G],t.$watch(q,j);return window.addEventListener("resize",j)}}}}},f=["$timeout",h],u=function(e,a){return a.module(n,[]).directive(t,f)},u(window,window.angular)}).call(this);

