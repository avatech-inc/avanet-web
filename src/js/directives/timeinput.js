
const insertIntoString = (a, b, position) => {
    return [a.slice(0, position), b, a.slice(position)].join('')
}

const formatTime = date => {
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    minutes = minutes < 10 ? '0' + minutes : minutes

    return hours + ':' + minutes + ' ' + ampm
}

const parseTime = text => {
    let _text = text.trim().toLowerCase()

    if (_text === '') return null

    // try to parse
    let date = Date.parse('1/1/1800 ' + _text)

    // if date is invalid, parse manually
    if (isNaN(date)) {
        let AM_PM = ''

        if (
            _text.indexOf('a') > -1 &&
            _text.indexOf('p') === -1
        ) {
            AM_PM = 'am'
        } else if (
            _text.indexOf('p') > -1 &&
            _text.indexOf('a') === -1
        ) {
            AM_PM = 'pm'
        }

        // strip out everything but numbers and colons
        _text = _text.replace(/[^0-9:]/g, '')

        let h = 0
        let m = 0

        // var s = null;

        // trim length
        _text = _text.substr(0, 6)

        // if no colon, place it
        if (_text.indexOf(':') === -1) {
            if (
                _text.length === 1 ||
                _text.length === 2
            ) {
                _text = _text + ':00'
            } else if (_text.length === 3) {
                _text = insertIntoString(_text, ':', 1)
            } else if (_text.length === 4) {
                _text = insertIntoString(_text, ':', 2)
            } else if (
                _text.length === 5 ||
                _text.length === 6
            ) {
                _text = insertIntoString(_text, ':', 2)
                _text = insertIntoString(_text, ':', 5)
            }
        }

        // split by colon
        let parts = _text.split(':')

        for (let p = 0; p < parts.length; p++) {
            let num = parseInt(parts[p], 10)

            if (num !== null && !isNaN(num)) {
                if (p === 0) {
                    h = num
                } else if (p === 1) {
                    m = num

                // else if (p == 2) h = num;
                }
            }

            // 24-hour time
            if (h === 0) {
                h = 12
                AM_PM = 'am'
            } else if (h > 12 && h <= 23) {
                h = h - 12
                AM_PM = 'pm'
            }

            // if junk
            if (h === 0 && m === 0) return null

            // parse date
            date = Date.parse(
                '1/1/1800 ' +
                h +
                ':' +
                m +
                (AM_PM === '' ? '' : ' ' + AM_PM)
            )
        }

        // if it's still bad, return null
        if (isNaN(date)) {
            return null
        }

        return new Date(date)
    }
}

angular.module('avatech').directive('time', () => ({
    restrict: 'A', // attribute or element
    scope: {
        model: '=time',
     // bindAttr: '='
    },

    // template: '<div class="some">' +
    //  '<input ng-model="myDirectiveVar"></div>',
    // replace: true,
    // require: 'ngModel',

    link: (scope, elem) => {
        let validate = text => {
            let newTime = parseTime(text)

            if (newTime !== null) {
                scope.model = newTime
            } else {
                scope.model = null
            }

            scope.$apply()
        }

        scope._model = null

        scope.$watch('model', newModel => {
            scope._model = angular.copy(newModel)

            let newDate = new Date(newModel)

            if (
                newModel !== null &&
                newDate instanceof Date &&
                !isNaN(newDate.valueOf())
            ) {
                elem.val(formatTime(newDate))
            } else {
                elem.val('')
            }
        })

        elem.bind('blur', () => validate(elem.val()))

        elem.bind('keydown keypress', e => {
            if (e.which === 13) {
                e.preventDefault()
                validate(elem.val())
            }
        })
    }
}))
