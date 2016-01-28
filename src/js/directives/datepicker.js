
angular.module('avatech').directive('datetimepicker', ['$log', $log => ({
    require: '^ngModel',
    restrict: 'E',
    scope: {
        theDate: '=ngModel'
    },
    templateUrl: '/js/directives/datepicker.html',
    link: (scope, elm, attrs, ctrl) => {
        scope.$watch('theDate', () => {
            if (!scope.theDate) {
                scope.theDate = new Date()
            }

            scope.internalDate = new Date(scope.theDate)

            scope.dateInput = angular.copy(scope.internalDate)
            scope.timeInput = angular.copy(scope.internalDate)
        }, true)

        scope.$watch('dateInput', () => {
            $log.debug(scope.dateInput)

            if (!scope.dateInput) return $log.debug('BAD DATE!')

            // $log.debug("    DATE: " + scope.dateInput.toISOString());

            scope.internalDate.setDate(scope.dateInput.getDate())
            scope.internalDate.setMonth(scope.dateInput.getMonth())
            scope.internalDate.setFullYear(scope.dateInput.getFullYear())
        }, true)

        scope.$watch('timeInput', () => {
            if (!scope.timeInput) return $log.debug('BAD TIME!')

            // $log.debug("    TIME: " + scope.timeInput.toISOString());

            scope.internalDate.setMinutes(scope.timeInput.getMinutes())
            scope.internalDate.setHours(scope.timeInput.getHours())
        }, true)
    }
})])

angular.module('avatech').directive('moDateInput', [() => ({
    require: '^ngModel',
    restrict: 'A',
    link: (scope, elm, attrs, ctrl) => {
        setTimeout(() => {
            let picker = new Pikaday({
                field: $(elm)[0],

                // todo: make this configurable
                // can't select date greater than today

                maxDate: new Date(),

                // format: 'YYYY-MM-DD'

                onSelect: () => {
                    // $log.debug(picker.toString());
                    // $log.debug(this.getMoment().format('Do MMMM YYYY'));
                }
            })

            // todo:find a more elegant way to make sure the picker loads the date
            setTimeout(() => {
                picker.setMoment(moment($(elm)[0].value))
            }, 400)
        }, 1)

        let dateFormat = attrs.moMediumDate
        dateFormat = 'YYYY-MM-DD'

        attrs.$observe('moDateInput', newValue => {
            if (dateFormat === newValue || !ctrl.$modelValue) return

            dateFormat = newValue

            ctrl.$modelValue = new Date(ctrl.$setViewValue)
        })

        ctrl.$formatters.unshift(modelValue => {
            if (!dateFormat || !modelValue) return ''

            return moment(modelValue).format(dateFormat)
        })

        ctrl.$parsers.unshift(viewValue => {
            let date = moment(viewValue, ['YYYY-MM-DD', 'MM/DD/YY'])

            return (date && date.isValid() && date.year() > 1950) ? date.toDate() : ''
        })
    }
})])

angular.module('avatech').directive('dateInput', [() => ({
    require: '^ngModel',
    restrict: 'A',
    link: (scope, elm, attrs, ctrl) => {
        let dateFormat = attrs.moMediumDate
        dateFormat = 'YYYY-MM-DD'

        // attrs.$observe('dateInput', function (newValue) {
        //     if (dateFormat == newValue || !ctrl.$modelValue) return;
        //     dateFormat = newValue;
        //     ctrl.$modelValue = new Date(ctrl.$setViewValue);
        // });

        ctrl.$formatters.unshift(modelValue => {
            if (!dateFormat || !modelValue) return ''

            return moment(modelValue).format(dateFormat)
        })

        ctrl.$parsers.unshift(viewValue => {
            let date = moment(viewValue, ['YYYY-MM-DD', 'MM/DD/YY'])

            return (date && date.isValid() && date.year() > 1950) ? date.toDate() : ''
        })
    }
})])
