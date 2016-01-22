angular.module('avatech').directive('inputDirectionRange', function() {    

    var selectionArea = "<div class='bg'>";
    selectionArea += "<div class='dir dir-N'>N</div>";
    selectionArea += "<div class='dir dir-NE'>NE</div>";
    selectionArea += "<div class='dir dir-E'>E</div>";
    selectionArea += "<div class='dir dir-SE'>SE</div>";
    selectionArea += "<div class='dir dir-S'>S</div>";
    selectionArea += "<div class='dir dir-SW'>SW</div>";
    selectionArea += "<div class='dir dir-W'>W</div>";
    selectionArea += "<div class='dir dir-NW'>NW</div>";
    selectionArea += "</div>";

    selectionArea += "<input value='{{ _model }}' class='dial' data-min=0 data-max=359 data-width=90 data-displayInput=false data-cursor=12 data-thickness=.2 data-fgColor='#4285f4'>";
  
    return {
        restrict: 'E',
        scope: {
          model: '=ngModel',
          angleLow: '=angleLow',
          angleHigh: '=angleHigh',
        },
        template: '<div style="min-width:100px;height:100px;overflow:hidden;text-align:center;padding-top:4px;margin-top:0px;display:inline-block;position:relative;"> ' + selectionArea + "</div>",
        link: function(scope, el, attrs) {    

            var input = { focus: function(){}};

            $(el[0]).find("div.dir.dir-N").mousedown(function($event) {
                scope.model = 0; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-NE").mousedown(function($event) {
                scope.model = 45; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-E").mousedown(function($event) {
                scope.model = 90; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-SE").mousedown(function($event) {
                scope.model = 135; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-S").mousedown(function($event) {
                scope.model = 180; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-SW").mousedown(function($event) {
                scope.model = 225; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-W").mousedown(function($event) {
                scope.model = 270; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-NW").mousedown(function($event) {
                scope.model = 315; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });

            scope.$watch('angleHigh', function(val) {
                $(el[0]).find("input.dial").trigger('setAngleHigh', val).trigger('change');
            });
            scope.$watch('angleLow', function(val) {
                $(el[0]).find("input.dial").trigger('setAngleLow', val).trigger('change');
            });

            scope.$watch('model', function(newVal) {
              if (newVal === 0) scope._model = "N";
              else if (newVal == 45) scope._model = "NE";
              else if (newVal == 90) scope._model = "E";
              else if (newVal == 135) scope._model = "SE";
              else if (newVal == 180) scope._model = "S";
              else if (newVal == 225) scope._model = "SW";
              else if (newVal == 270) scope._model = "W";
              else if (newVal == 315) scope._model = "NW";
              else scope._model = newVal;
            });


            scope.$watch('_model', function(newVal) {
              if(newVal === null || newVal === undefined) {
                //scope.model = null;
                $(el[0]).find("input.dial").val(-999).trigger('change');
                return;
            }

                if (newVal.length && newVal.toLowerCase() == "n") {
                    $(el[0]).find("input.dial").val(0).trigger('change');
                    scope.model = 0;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "ne") {
                    $(el[0]).find("input.dial").val(45).trigger('change');
                    scope.model = 45;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "e") {
                    $(el[0]).find("input.dial").val(90).trigger('change');
                    scope.model = 90;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "se") {
                    $(el[0]).find("input.dial").val(135).trigger('change');
                    scope.model = 135;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "s") {
                    $(el[0]).find("input.dial").val(180).trigger('change');
                    scope.model = 180;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "sw") {
                    $(el[0]).find("input.dial").val(225).trigger('change');
                    scope.model = 225; 
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "w") {
                    $(el[0]).find("input.dial").val(270).trigger('change');
                    scope.model = 270;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "nw") {
                    $(el[0]).find("input.dial").val(315).trigger('change');
                    scope.model = 315;
                    return;
                }

              newVal = parseInt(newVal);

              if (newVal > 359) newVal = 0;
              else if (newVal < 0) newVal = 0;
              else if (isNaN(newVal) || newVal === null || newVal === undefined) {
                newVal = null;
              }
              // setting model to null doesn't trigger $watch (why?), so we have to manually set _model to null
              if (newVal === null) scope._model = null;
              scope.model = newVal;

              if (!(isNaN(newVal) || newVal === null || newVal=== undefined)) {
                $(el[0]).find("input.dial").val(newVal).trigger('change');
              }

            });
    
            // init jquery-knob
            $(el[0]).find("input.dial").knob({
              change: function(newVal) {
                newVal = parseInt(newVal);
                scope.model = newVal;
                scope.$apply();
              },
              draw: function(context) {

              }
            });
        }
    };        
});

angular.module('avatech').directive('inputDirection', function() {    

    var selectionArea = "<div class='bg'>";
    selectionArea += "<div class='dir dir-N'>N</div>";
    selectionArea += "<div class='dir dir-NE'>NE</div>";
    selectionArea += "<div class='dir dir-E'>E</div>";
    selectionArea += "<div class='dir dir-SE'>SE</div>";
    selectionArea += "<div class='dir dir-S'>S</div>";
    selectionArea += "<div class='dir dir-SW'>SW</div>";
    selectionArea += "<div class='dir dir-W'>W</div>";
    selectionArea += "<div class='dir dir-NW'>NW</div>";
    selectionArea += "</div>";

    selectionArea += "<input value='{{ _model }}' class='dial' data-min=0 data-max=359 data-width=90 data-displayInput=false data-cursor=12 data-thickness=.2 data-fgColor='#4285f4'>";
  
    return {
        restrict: 'E',
        scope: {
          model: '=ngModel'
        },
        template: '<div class="btn-group" uib-dropdown is-open="isOpen" ><div><input style="width:65px;" ng-model="_model" class="trigger" ng-focus="isOpen = true" ></div><ul class="dropdown-menu" role="menu" style="min-width:100px;height:100px;overflow:hidden;text-align:center;padding-top:4px;margin-top:0px;">' + selectionArea + '</ul></div>',
        link: function(scope, el, attrs) {    
            var input = $(el[0]).find("input.trigger");

            $(el[0]).find("div.dir.dir-N").mousedown(function($event) {
                scope.model = 0; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-NE").mousedown(function($event) {
                scope.model = 45; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-E").mousedown(function($event) {
                scope.model = 90; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-SE").mousedown(function($event) {
                scope.model = 135; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-S").mousedown(function($event) {
                scope.model = 180; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-SW").mousedown(function($event) {
                scope.model = 225; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-W").mousedown(function($event) {
                scope.model = 270; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });
            $(el[0]).find("div.dir.dir-NW").mousedown(function($event) {
                scope.model = 315; scope.$apply(); input.focus();
                $(el[0]).find("input.dial").val(scope.model).trigger('change');
            });

            var className = attrs.inputClass;
            input.addClass(className);

            scope.$watch('model', function(newVal) {
              if (newVal === 0) scope._model = "N";
              else if (newVal == 45) scope._model = "NE";
              else if (newVal == 90) scope._model = "E";
              else if (newVal == 135) scope._model = "SE";
              else if (newVal == 180) scope._model = "S";
              else if (newVal == 225) scope._model = "SW";
              else if (newVal == 270) scope._model = "W";
              else if (newVal == 315) scope._model = "NW";
              else scope._model = newVal;
            });


            scope.$watch('_model', function(newVal) {
              if(newVal=== null || newVal=== undefined) {
                //scope.model = null;
                $(el[0]).find("input.dial").val(-999).trigger('change');
                return;
            }

                if (newVal.length && newVal.toLowerCase() == "n") {
                    $(el[0]).find("input.dial").val(0).trigger('change');
                    scope.model = 0;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "ne") {
                    $(el[0]).find("input.dial").val(45).trigger('change');
                    scope.model = 45;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "e") {
                    $(el[0]).find("input.dial").val(90).trigger('change');
                    scope.model = 90;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "se") {
                    $(el[0]).find("input.dial").val(135).trigger('change');
                    scope.model = 135;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "s") {
                    $(el[0]).find("input.dial").val(180).trigger('change');
                    scope.model = 180;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "sw") {
                    $(el[0]).find("input.dial").val(225).trigger('change');
                    scope.model = 225; 
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "w") {
                    $(el[0]).find("input.dial").val(270).trigger('change');
                    scope.model = 270;
                    return;
                }
                else if (newVal.length && newVal.toLowerCase() == "nw") {
                    $(el[0]).find("input.dial").val(315).trigger('change');
                    scope.model = 315;
                    return;
                }

              newVal = parseInt(newVal);

              if (newVal > 359) newVal = 0;
              else if (newVal < 0) newVal = 0;
              else if (isNaN(newVal) || newVal === null || newVal === undefined) {
                newVal = null;
              }
              // setting model to null doesn't trigger $watch (why?), so we have to manually set _model to null
              if (newVal === null) scope._model = null;
              scope.model = newVal;

              if (!(isNaN(newVal) || newVal === null || newVal === undefined))
                $(el[0]).find("input.dial").val(newVal).trigger('change');
            });
    
            // init jquery-knob
            $(el[0]).find("input.dial").knob({
              change: function(newVal) {
                newVal = parseInt(newVal);
                scope.model = newVal;
                scope.$apply();
              }
            });

            // prevent default dropdown behavior
            input.click(function($event) {
                $event.preventDefault();
                $event.stopPropagation();
            });

            // simulate blur
            input.keydown(function($event) {
                var keyCode = $event.keyCode || $event.which; 
                if (keyCode == 9) {
                  scope.isOpen = false;
                  scope.$apply();
                }
            });

            // prevent hide when clicking inside dropdown
            $(el[0]).find("ul").click(function($event) {
                $event.preventDefault();
                $event.stopPropagation();
            });
        }
    };        
});