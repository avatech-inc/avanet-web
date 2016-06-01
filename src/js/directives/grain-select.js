
import './grain-select.html'

const GrainSelect = ['snowpitConstants', snowpitConstants => ({
    restrict: 'E',
    scope: {
        grainType: '=ngModel',
        placeholder: '@'
    },

    templateUrl: '/js/directives/grain-select.html',

    link: (scope, el, attrs) => {
        scope.grainTypes = snowpitConstants.grainTypes;

        scope.$watch('grainType', () => {
            if (!scope.grainType) {
                scope.selectedCategory = null
                scope.grainTypeObject = null
                return
            }

            angular.forEach(scope.grainTypes, (category) => {
                for (let i = 0; i < category.types.length; i++) {
                    if (category.types[i].icssg === scope.grainType) {
                        scope.selectedCategory = category.code
                        scope.grainTypeObject = category.types[i]

                        return
                    }
                }
            })
        })

        scope.selectCategory = category => {
            scope.selectedCategory = category.code
        }

        scope.setGrainType = code => {
            scope.grainType = code
        }
    }
})]

export default GrainSelect
