angular.module('avatech').directive('grainSelect', function(snowpitConstants) {    

    var template = "";
    template += '<div class="btn-group grainTypeSelect" dropdown>';
    template += '  <div class="dropdown-toggle">';
    template += '    <span ng-hide="grainType" class="empty">{{ placeholder }}</span>';
    template += '    <span class="snowsym" style="font-size:21px;position:relative;right:5px;"><span ng-style="grainTypeObject.style">{{ grainTypeObject.symbol }}</span></span>{{ grainTypeObject.desc }}';
    template += '    <i ng-hide="grainType" class="fa fa-sort sort"></i>';
    template += '  </div>';
    template += '  <i ng-show="grainType" class="fa fa-times clear" ng-click="setGrainType(null)"></i>';
    template += '  <ul class="dropdown-menu" role="menu" style="width:240px;height:auto;">';
    template += '    <li ng-show="!selectedCategory" ng-repeat="category in grainTypes"><a href="#" ng-click="selectCategory(category)" style="padding-top:0px;padding-bottom:0px;"><span class="snowsym" style="font-size:19px;position:relative;right:7px;"><span ng-style="type.style">{{ category.symbol }}</span></span> {{ category.desc }}</a></li>';
    template += '    <li ng-show="selectedCategory" ng-click="selectedCategory = null"><a href="#" style="font-weight:bold;margin-bottom:-4px;"><i class="fa fa-angle-left"></i>Categories</a></li>';
    template += '    <li ng-show="selectedCategory" class="divider"></li>';
    template += '    <li ng-repeat-start="category in grainTypes"></li>';
    template += '    <li ng-show="selectedCategory == category.code" ng-repeat="type in category.types"><a href="#" ng-click="setGrainType(type.icssg)" close-dropdown-on-click style="padding-top:0px;padding-bottom:0px;"><span class="snowsym" style="font-size:19px;position:relative;right:7px;"><span ng-style="type.style">{{ type.symbol }}</span></span> {{ type.desc }}</a></li>';
    template += '    <li ng-repeat-end></li>';
    template += '  </ul>';
    template += '</div>';

    return {
        restrict: 'E',
        scope: {
          grainType: '=ngModel',
          placeholder: '@'
        },
        template: template,
        link: function(scope, el, attrs) {    

            scope.grainTypes = snowpitConstants.grainTypes;

            scope.$watch('grainType',function(){
                if (!scope.grainType) {
                    scope.selectedCategory = null;
                    scope.grainTypeObject = null;
                    return;
                }

                angular.forEach(scope.grainTypes,function(category) {
                    for (var i = 0; i < category.types.length; i++) {
                        if (category.types[i].icssg == scope.grainType) {
                            scope.selectedCategory = category.code;
                            scope.grainTypeObject = category.types[i];
                            return;
                        }
                    }
                });
            });
            scope.selectCategory = function(category) { 
                scope.selectedCategory = category.code;
            };
            scope.setGrainType = function(code) {
                console.log("set grain type!");
                console.log(code);
                scope.grainType = code;
            }; 
        }
    };        
});