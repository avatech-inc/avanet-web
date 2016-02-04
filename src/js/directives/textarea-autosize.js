
// textarea autosize (relies on jquery.autosize.js)
angular.module('avatech').directive('autosize', () => ({
    restrict: 'A',
    link: (scope, elem, attr, ctrl) => {
        $(elem).on('focus', e => $(e.target).autosize())

        // handle programatic reset to empty string
        scope.$watch(() => {
            return $(elem).val()
        }, (newVal, oldVal) => {
            if (
                newVal === null ||
                newVal === '' &&
                oldVal !== null &&
                oldVal !== ''
            ) {
                $(elem).autosize().show().trigger('autosize.resize')
            }
        })
    }
}))
