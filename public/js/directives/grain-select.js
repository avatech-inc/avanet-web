
angular.module('avatech').directive('grainSelect', ['snowpitConstants'
    ,function(snowpitConstants) {    

    var template = "";
    template += '<div class="btn-group grainTypeSelect" dropdown>';
    template += '  <div ng-click="selectedCategory = grainType.category" class="dropdown-toggle">';
    template += '    <span ng-hide="grainType" class="empty">{{ placeholder }}</span>';

    template += '    <span class="snowsym" style="font-size:21px;position:relative;right:5px;"><span ng-style="getGrainType(grainType).style">{{ getGrainType(grainType).symbol }}</span></span>{{ getGrainType(grainType).desc }}';

    template += '    <i ng-hide="grainType" class="fa fa-sort sort"></i>';
    template += '  </div>';
    template += '  <i ng-show="grainType" class="fa fa-times clear" ng-click="setGrainType(null)"></i>';
    template += '  <ul class="dropdown-menu" role="menu" style="width:240px;height:auto;">';
    template += '    <li ng-show="!selectedCategory" ng-repeat="category in grainTypes"><a href="#" ng-click="selectCategory(category)" style="padding-top:0px;padding-bottom:0px;"><span class="snowsym" style="font-size:19px;position:relative;right:7px;"><span ng-style="type.style">{{ category.symbol }}</span></span> {{ category.desc }}</a></li>';
    template += '    <li ng-show="selectedCategory" ng-click="selectedCategory = null"><a href="#" style="font-weight:bold;margin-bottom:-4px;"><i class="fa fa-angle-left"></i>Categories</a></li>';
    template += '    <li ng-show="selectedCategory" class="divider"></li>';
    template += '    <li ng-repeat-start="category in grainTypes"></li>';
    template += '    <li ng-show="selectedCategory == category.legacyCode" ng-repeat="type in category.types"><a href="#" ng-click="setGrainType(category.legacyCode,type.code)" close-dropdown-on-click style="padding-top:0px;padding-bottom:0px;"><span class="snowsym" style="font-size:19px;position:relative;right:7px;"><span ng-style="type.style">{{ type.symbol }}</span></span> {{ type.desc }}</a></li>';
    template += '    <li ng-repeat-end></li>';
    template += '  </ul>';
    template += '</div>';

    return {
        restrict: 'E',
        scope: {
          grainType: '=',
          placeholder: '@'
        },
        template: template,
        link: function(scope, el, attrs) {    
          
        },
        controller: ['$scope', function($scope) {
            $scope.grainTypes = snowpitConstants.grainTypes;
            $scope.selectedCategory;

            $scope.selectCategory = function(category, type) { 
                $scope.selectedCategory = category.legacyCode;
                // todo: first need to change all snowpits to use proper codes (icssg)
                //$scope.setGrainType(category.legacyCode,category.code);
            }
            $scope.getGrainType = function(grainType) {
                if (!grainType) return;
                for (var i = 0; i < $scope.grainTypes.length;i++){
                    if ($scope.grainTypes[i].legacyCode == grainType.category) {
                        for (var j = 0; j < $scope.grainTypes[i].types.length; j++) {
                            if ($scope.grainTypes[i].types[j].code == grainType.code) {
                                return $scope.grainTypes[i].types[j];
                            }
                        }
                        break;
                    }
                }
            }
            
            $scope.setGrainType = function(category, code) {
                if (category == null) {
                    // if ($scope.settings.selectedLayer.grainType2) {
                    //     $scope.settings.selectedLayer.grainType = $scope.settings.selectedLayer.grainType2;
                    //     $scope.settings.selectedLayer.grainType2 = null;
                    // }
                    //else 
                    $scope.grainType = null;
                }
                else $scope.grainType = { category: category, code: code };
            }

        }]
    };        
}]);