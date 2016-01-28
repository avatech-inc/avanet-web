
angular.module('avatech').directive('inputDirectionRange', () => ({
    restrict: 'E',
    scope: {
        model: '=ngModel',
        angleLow: '=angleLow',
        angleHigh: '=angleHigh'
    },
    templateUrl: '/js/directives/input-direction-range.html',
    link: (scope, el, attrs) => {
        let input = { focus: () => {} }

        $(el[0]).find('div.dir.dir-N').mousedown($event => {
            scope.model = 0
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-NE').mousedown($event => {
            scope.model = 45
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-E').mousedown($event => {
            scope.model = 90
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-SE').mousedown($event => {
            scope.model = 135
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-S').mousedown($event => {
            scope.model = 180
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-SW').mousedown($event => {
            scope.model = 225
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-W').mousedown($event => {
            scope.model = 270
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-NW').mousedown($event => {
            scope.model = 315
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        scope.$watch('angleHigh', val => {
            $(el[0]).find('input.dial').trigger('setAngleHigh', val).trigger('change')
        })

        scope.$watch('angleLow', val => {
            $(el[0]).find('input.dial').trigger('setAngleLow', val).trigger('change')
        })

        scope.$watch('model', newVal => {
            if (newVal === 0) scope._model = 'N'
            else if (newVal === 45) scope._model = 'NE'
            else if (newVal === 90) scope._model = 'E'
            else if (newVal === 135) scope._model = 'SE'
            else if (newVal === 180) scope._model = 'S'
            else if (newVal === 225) scope._model = 'SW'
            else if (newVal === 270) scope._model = 'W'
            else if (newVal === 315) scope._model = 'NW'
            else scope._model = newVal
        })

        scope.$watch('_model', newVal => {
            if (newVal === null || newVal === undefined) {
                // scope.model = null;

                $(el[0]).find('input.dial').val(-999).trigger('change')
                return
            }

            if (newVal.length && newVal.toLowerCase() === 'n') {
                $(el[0]).find('input.dial').val(0).trigger('change')
                scope.model = 0
                return
            } else if (newVal.length && newVal.toLowerCase() === 'ne') {
                $(el[0]).find('input.dial').val(45).trigger('change')
                scope.model = 45
                return
            } else if (newVal.length && newVal.toLowerCase() === 'e') {
                $(el[0]).find('input.dial').val(90).trigger('change')
                scope.model = 90
                return
            } else if (newVal.length && newVal.toLowerCase() === 'se') {
                $(el[0]).find('input.dial').val(135).trigger('change')
                scope.model = 135
                return
            } else if (newVal.length && newVal.toLowerCase() === 's') {
                $(el[0]).find('input.dial').val(180).trigger('change')
                scope.model = 180
                return
            } else if (newVal.length && newVal.toLowerCase() === 'sw') {
                $(el[0]).find('input.dial').val(225).trigger('change')
                scope.model = 225
                return
            } else if (newVal.length && newVal.toLowerCase() === 'w') {
                $(el[0]).find('input.dial').val(270).trigger('change')
                scope.model = 270
                return
            } else if (newVal.length && newVal.toLowerCase() === 'nw') {
                $(el[0]).find('input.dial').val(315).trigger('change')
                scope.model = 315
                return
            }

            let _newVal = parseInt(newVal, 10)

            if (_newVal > 359) {
                _newVal = 0
            } else if (_newVal < 0) {
                _newVal = 0
            } else if (
                isNaN(_newVal) ||
                _newVal === null ||
                _newVal === undefined
            ) {
                _newVal = null
            }

            // setting model to null doesn't trigger $watch (why?),
            // so we have to manually set _model to null
            if (_newVal === null) {
                scope._model = null
            }

            scope.model = _newVal

            if (!(
                isNaN(_newVal) ||
                _newVal === null ||
                _newVal === undefined
            )) {
                $(el[0]).find('input.dial').val(_newVal).trigger('change')
            }
        })

        // init jquery-knob
        $(el[0]).find('input.dial').knob({
            change: newVal => {
                scope.model = parseInt(newVal, 10)
                scope.$apply()
            },
            draw: context => {}
        })
    }
}))

angular.module('avatech').directive('inputDirection', () => ({
    restrict: 'E',
    scope: {
        model: '=ngModel'
    },
    templateUrl: '/js/directives/input-direction.html',
    link: (scope, el, attrs) => {
        let input = $(el[0]).find('input.trigger')

        $(el[0]).find('div.dir.dir-N').mousedown($event => {
            scope.model = 0
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-NE').mousedown($event => {
            scope.model = 45
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-E').mousedown($event => {
            scope.model = 90
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-SE').mousedown($event => {
            scope.model = 135
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-S').mousedown($event => {
            scope.model = 180
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-SW').mousedown($event => {
            scope.model = 225
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-W').mousedown($event => {
            scope.model = 270
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        $(el[0]).find('div.dir.dir-NW').mousedown($event => {
            scope.model = 315
            scope.$apply()
            input.focus()

            $(el[0]).find('input.dial').val(scope.model).trigger('change')
        })

        let className = attrs.inputClass
        input.addClass(className)

        scope.$watch('model', newVal => {
            if (newVal === 0) scope._model = 'N'
            else if (newVal === 45) scope._model = 'NE'
            else if (newVal === 90) scope._model = 'E'
            else if (newVal === 135) scope._model = 'SE'
            else if (newVal === 180) scope._model = 'S'
            else if (newVal === 225) scope._model = 'SW'
            else if (newVal === 270) scope._model = 'W'
            else if (newVal === 315) scope._model = 'NW'
            else scope._model = newVal
        })

        scope.$watch('_model', newVal => {
            if (newVal === null || newVal === undefined) {
                // scope.model = null;

                $(el[0]).find('input.dial').val(-999).trigger('change')
                return
            }

            if (newVal.length && newVal.toLowerCase() === 'n') {
                $(el[0]).find('input.dial').val(0).trigger('change')
                scope.model = 0
                return
            } else if (newVal.length && newVal.toLowerCase() === 'ne') {
                $(el[0]).find('input.dial').val(45).trigger('change')
                scope.model = 45
                return
            } else if (newVal.length && newVal.toLowerCase() === 'e') {
                $(el[0]).find('input.dial').val(90).trigger('change')
                scope.model = 90
                return
            } else if (newVal.length && newVal.toLowerCase() === 'se') {
                $(el[0]).find('input.dial').val(135).trigger('change')
                scope.model = 135
                return
            } else if (newVal.length && newVal.toLowerCase() === 's') {
                $(el[0]).find('input.dial').val(180).trigger('change')
                scope.model = 180
                return
            } else if (newVal.length && newVal.toLowerCase() === 'sw') {
                $(el[0]).find('input.dial').val(225).trigger('change')
                scope.model = 225
                return
            } else if (newVal.length && newVal.toLowerCase() === 'w') {
                $(el[0]).find('input.dial').val(270).trigger('change')
                scope.model = 270
                return
            } else if (newVal.length && newVal.toLowerCase() === 'nw') {
                $(el[0]).find('input.dial').val(315).trigger('change')
                scope.model = 315
                return
            }

            let _newVal = parseInt(newVal, 10)

            if (_newVal > 359) {
                _newVal = 0
            } else if (_newVal < 0) {
                _newVal = 0
            } else if (
                isNaN(_newVal) ||
                _newVal === null ||
                _newVal === undefined
            ) {
                _newVal = null
            }

            // setting model to null doesn't trigger $watch (why?),
            // so we have to manually set _model to null
            if (_newVal === null) {
                scope._model = null
            }

            scope.model = _newVal

            if (!(
                isNaN(_newVal) ||
                _newVal === null ||
                _newVal === undefined
            )) {
                $(el[0]).find('input.dial').val(_newVal).trigger('change')
            }
        })

        // init jquery-knob
        $(el[0]).find('input.dial').knob({
            change: newVal => {
                scope.model = parseInt(newVal, 10)
                scope.$apply()
            }
        })

        // prevent default dropdown behavior
        input.click($event => {
            $event.preventDefault()
            $event.stopPropagation()
        })

        // simulate blur
        input.keydown($event => {
            let keyCode = $event.keyCode || $event.which

            if (keyCode === 9) {
                scope.isOpen = false
                scope.$apply()
            }
        })

        // prevent hide when clicking inside dropdown
        $(el[0]).find('ul').click($event => {
            $event.preventDefault()
            $event.stopPropagation()
        })
    }
}))
