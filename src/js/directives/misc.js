
export const LocationSelectButton = [
    'LocationSelectModal',

    LocationSelectModal => ({
        restrict: 'A',
        scope: {
            model: '=ngModel'
        },
        link: (scope, el) => {
            // el.bind('click', function($event) {
            //   var el = $($event.target).closest(".open");
            //   if (el && el.data() && el.data().$uibDropdownController)
            // el.data().$uibDropdownController.toggle();
            //   scope.$apply();
            // });

            el.bind('click', $event => {
                LocationSelectModal.open({
                    initialLocation: scope.model
                }).then(location => {
                    if (location && location.length === 2) {
                        location[0] = parseFloat(location[0].toFixed(7))
                        location[1] = parseFloat(location[1].toFixed(7))
                        scope.model = location
                    }
                }, () => {
                    // on dismiss
                })
            })
        }
    })
]

export const AccordionNew = () => ({
    restrict: 'E',
    link: (scope, elem) => {
        $(elem).find('.header').click(() => {
            if ($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open')
            } else {
                $(elem).find('.accordion-item').removeClass('open')
                $(this).parent().addClass('open')
            }
        })
    }
})

// on enter
export const OnEnter = () => ({
    restrict: 'A',
    scope: {
        onenter: '&'
    },
    link: (scope, elem) => {
        $(elem).keydown(e => {
            if (e.keyCode === 13) {
                scope.onenter()
                return false
            }
        })
    }
})

export const FocusOn = [
    '$timeout',
    '$parse',

    ($timeout, $parse) => ({
        link: (scope, element, attrs) => {
            let model = $parse(attrs.focusOn)

            scope.focus = modelName => {
                if (!scope[modelName]) {
                    scope[modelName] = 0
                }

                scope[modelName]++
            }

            scope.$watch(model, value => {
                $timeout(() => element[0].focus())
            })
        }
    })
]

export const AutoFocus = () => ({
    restrict: 'AC',
    link: (_scope, _element) => {
        _element[0].focus()
    }
})

export const WindowResize = ['$window', $window => {
    return $scope => {
        $scope._getWindowSize = () => {
            $scope.windowHeight = $window.innerHeight
            $scope.windowWidth = $window.innerWidth
        }

        angular.element($window).bind('resize', () => {
            $scope._getWindowSize()
        })

        $scope._getWindowSize()
    }
}]

export const OnChange = () => ({
    restrict: 'A',
    scope: {
        onChange: '='
    },
    link: (scope, elm) => {
        scope.$watch('onChange', nVal => elm.val(nVal))

        elm.bind('blur', () => {
            let currentValue = elm.val()

            if (scope.onChange !== currentValue) {
                scope.$apply(() => scope.onChange = currentValue)
            }
        })
    }
})

export const MetersOrFeet = () => ({
    require: '^ngModel',
    restrict: 'A',
    link: (scope, elm, attrs, ctrl) => {
        let metersOrFeet = attrs.metersOrFeet

        attrs.$observe('metersOrFeet', newValue => {
            if (newValue === null) return
            metersOrFeet = newValue
        })

        ctrl.$formatters.unshift(modelValue => {
            if (modelValue === null) return undefined

            // if feet
            if (metersOrFeet === 1) {
                return Math.round(modelValue * 3.28084)
            }

            return Math.round(modelValue)
        })

        ctrl.$parsers.unshift(viewValue => {
            // if feet
            if (metersOrFeet === 1) {
                return (viewValue * 0.3048)
            }

            // if meters (multiply by 1 to screen out non-numbers)
            return (viewValue * 1)
        })
    }
})

export const CmOrIn = [
    '$window',
    '$parse',

    ($window, $parse) => ({
        require: '^ngModel',
        restrict: 'A',
        link: (scope, elm, attrs, ctrl) => {
            let cmOrIn = attrs.cmOrIn

            attrs.$observe('cmOrIn', newValue => {
                if (newValue === null) return

                cmOrIn = newValue
            })

            ctrl.$formatters.unshift(modelValue => {
                if (modelValue === null) return undefined

                if (cmOrIn === 1) {
                    return Math.round(modelValue * 0.393701)
                }

                return Math.round(modelValue)
            })

            ctrl.$parsers.unshift(viewValue => {
                // if inches
                if (cmOrIn === 1) {
                    return (viewValue * 2.54)
                }

                // if cm (multiply by 1 to screen out non-numbers)
                return (viewValue * 1)
            })
        }
    })
]

export const TempUnits = [
    '$window',
    '$parse',

    ($window, $parse) => ({
        require: '^ngModel',
        restrict: 'A',
        link: (scope, elm, attrs, ctrl) => {
            let tempUnits = attrs.tempUnits

            attrs.$observe('tempUnits', newValue => {
                if (newValue === null) return

                tempUnits = newValue
            })

            ctrl.$formatters.unshift(modelValue => {
                if (modelValue === null) return undefined

                // if fahrenheit
                if (tempUnits === 'F') {
                    return ((modelValue * (9 / 5)) + 32)
                }

                return Math.round(modelValue).toFixed(1)
            })

            ctrl.$parsers.unshift(viewValue => {
                // if fahrenheit
                if (viewValue === '-') return '-'

                if (tempUnits === 'F') {
                    return (viewValue - 32) * (5 / 9)
                }

                // if celsius (multiply by 1 to screen out non-numbers)
                return (viewValue * 1)
            });
        }
    })
]

export const NumberOnly = () => ({
    restrict: 'EA',
    require: '?ngModel',
    scope: {
        allowDecimal: '@',
        allowNegative: '@',
        minNum: '@',
        maxNum: '@'
    },

    link: (scope, element, attrs, ctrl) => {
        if (!ctrl) return

        ctrl.$parsers.unshift(inputValue => {
            let decimalFound = false
            let digits = inputValue.split('').filter((s, i) => {
                let b = (!isNaN(s) && s !== ' ')

                if (!b && attrs.allowDecimal && attrs.allowDecimal === 'true') {
                    if (s === '.' && decimalFound === false) {
                        decimalFound = true
                        b = true
                    }
                }

                if (!b && attrs.allowNegative && attrs.allowNegative === 'true') {
                    b = (s === '-' && i === 0)
                }

                return b
            }).join('')

            if (
                attrs.maxNum &&
                !isNaN(attrs.maxNum) &&
                parseFloat(digits) > parseFloat(attrs.maxNum)
            ) {
                digits = attrs.maxNum
            }

            if (
                attrs.minNum &&
                !isNaN(attrs.minNum) &&
                parseFloat(digits) < parseFloat(attrs.minNum)
            ) {
                digits = attrs.minNum
            }

            ctrl.$viewValue = digits
            ctrl.$render()

            return digits
        })
    }
})

// closes a bootstrap dropdown when clicked (can be anywhere within the dropdown)
export const CloseDropdown = () => ({
    restrict: 'A',
    link: (scope, el) => {
        el.bind('click', $event => {
            let el = $($event.target).closest('.open')

            if (
                el &&
                el.data() &&
                el.data().$uibDropdownController
            ) {
                el.data().$uibDropdownController.toggle()
            }

            scope.$apply()
        })
    }
})

export const TooltipHide = () => ({
    restrict: 'A',
    link: (scope, el) => {
        el.bind('click', $event => {
            // var el = $($event.target).closest(".open");
            // if (el && el.data().$dropdownController) el.data().$dropdownController.toggle();
            // scope.$apply();

            el.data().$scope.tt_isOpen = false

            // console.log(el.data().$scope.tt_isOpen);
        })
    }
})

export const SelectOnClick = () => ({
    restrict: 'A',
    link: (scope, element) => {
        element.on('click', () => {
            this.select()
        })
    }
})
