
// bootstrap form validation
angular.module('avatech').directive('validate', () => ({
    restrict: 'A',
    compile: (elem, attr) => {
        let formName = attr.name

        // turn off html5 validation
        elem[0].setAttribute('novalidate', '')

        // ng-submit
        let submitVariableName = '__submit_' + formName

        // get 'form-group' divs
        let formGroups = elem[0].querySelectorAll('.form-group')

        let inputs = []

        angular.forEach(formGroups, formGroup => {
            let _formGroup = angular.element(formGroup)
            let input = _formGroup[0].querySelector('.form-control')

            if (input) {
                // var newName = input.attributes['ng-model'];
                let newName = _formGroup[0].getAttribute('name')

                // if ngModel exists
                if (newName) {
                    // replace '.' with '-'
                    // var newName = newName.replace(/\./g, '_');

                    // keep track of input blur
                    let blurVariableName = '__blur_' + formName + '_' + newName
                    input.setAttribute('ng-blur', blurVariableName + ' = true')

                    // set input name/id
                    input.setAttribute('name', newName)
                    input.setAttribute('id', newName)

                    // set 'for' on label
                    let label = _formGroup[0].querySelector('label')

                    if (label) {
                        label.setAttribute('for', newName)
                    }

                    // form group css ('has-error')
                    let errorClassVariableName = '__error_' + formName + '_' + newName

                    _formGroup[0].setAttribute('ng-class', (
                        '{ "has-error": (' +
                        submitVariableName +
                        ' || ' +
                        blurVariableName +
                        ') && ' +
                        errorClassVariableName +
                        ' }'
                    ))

                    // error message
                    let errorMessage = _formGroup[0].querySelector('.error-message')

                    if (errorMessage) {
                        errorMessage.setAttribute('ng-show', (
                            '(' +
                            submitVariableName +
                            ' || ' +
                            blurVariableName +
                            ')'
                        ))

                        errorMessage.innerHTML = '{{ __message_' + formName + '_' + newName + ' }}'
                    }

                    inputs.push(newName)
                }
            }
        })

        // link function
        return (scope, elem, attrs, controller) => {
            elem.bind('submit', e => {
                e.preventDefault()
                scope[submitVariableName] = true
                scope.$apply()
            })

            angular.forEach(inputs, newName => {
                scope.$watch(() => {
                    if (scope[formName][newName]) {
                        return scope[formName][newName].$error
                    }

                    return null
                }, errors => {
                    if (!errors) return

                    // field is valid
                    if (scope[formName][newName].$valid) {
                        scope['__error_' + formName + '_' + newName] = false
                        scope['__message_' + formName + '_' + newName] = ''

                    // field is invalid
                    } else {
                        scope['__error_' + formName + '_' + newName] = true

                        angular.forEach(errors, (isValid, field) => {
                            let message = ''

                            if (field === 'required') {
                                message = 'Required'
                            } else if (field === 'email') {
                                message = 'Enter a valid email address'
                            } else {
                                message = field
                            }

                            if (isValid) {
                                scope['__message_' + formName + '_' + newName] = message
                            }
                        })
                    }
                }, true)
            })
        }
    }
}))
