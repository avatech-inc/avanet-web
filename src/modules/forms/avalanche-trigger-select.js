
angular.module('avatech').directive('avalancheTriggerSelect', () => ({
    restrict: 'E',
    scope: {
        triggers: '=ngModel',
        trigger: '=trigger'
    },
    templateUrl: '/modules/forms/avalanche-trigger.html',
    link: (scope, element) => {
        scope.addTrigger = trigger => {
            console.log('add trigger')
            console.log(trigger)

            if (!scope.triggers) scope.triggers = []

            if (!scope.hasTrigger(trigger)) {
                console.log('pushing!')

                scope.triggers.push(trigger.code)
            }
        }

        scope.removeTrigger = trigger => {
            if (!scope.triggers) return false

            angular.forEach(scope.triggers, (triggerCode, index) => {
                if (triggerCode === trigger) {
                    console.log('found!')

                    scope.triggers.splice(index, 1);

                    return
                }
            })
        }

        scope.hasTrigger = trigger => {
            if (!scope.triggers) return false

            let hasTrigger = false

            angular.forEach(scope.triggers, triggerCode => {
                if (triggerCode === trigger.code) hasTrigger = true
            })

            return hasTrigger
        }

        scope.getTriggerName = triggerCode => {
            let name = ''

            angular.forEach(scope.artificialTriggers, (triggers, triggerCategory) => {
                angular.forEach(triggers, trigger => {
                    if (trigger.code === triggerCode) {
                        name = triggerCategory + ': ' + trigger.name
                        return name
                    }
                })
            })

            angular.forEach(scope.naturalTriggers, trigger => {
                if (trigger.code === triggerCode) {
                    name = trigger.name
                    return name
                }
            })

            return name
        }

        scope.artificialTriggers = {
            /* eslint-disable quote-props */
            'Explosive': [
                { code: 'AA', name: 'Artillery' },
                { code: 'AE', name: 'Explosive thrown or placed on or under snow surface by hand' },
                { code: 'AL', name: 'Avalauncher' },
                { code: 'AB', name: 'Explosive detonated above snow surface (air blast)' },
                { code: 'AC', name: 'Cornice fall triggered by human or explosive action' },
                { code: 'AX', name: 'Gas exploder' },
                { code: 'AH', name: 'Explosives placed via helicopter' },
                { code: 'AP', name: 'Pre-placed, remotely detonated explosive charge' }
            ],
            'Vehicle': [
                { code: 'AM', name: 'Snowmobile' },
                { code: 'AK', name: 'Snowcat' },
                { code: 'AV', name: 'Other Vehicle' } // specify
            ],
            'Human': [
                { code: 'AS', name: 'Skier' },
                { code: 'AR', name: 'Snowboarder' },
                { code: 'AI', name: 'Snowshoer' },
                { code: 'AF', name: 'Foot penetration' },
                // { code: 'AC', name: 'Cornice fall produced by human or explosive action' }
            ],
            'Miscellaneous': [
                { code: 'AW', name: 'Wildlife' },
                { code: 'AU', name: 'Unknown artificial trigger' },
                { code: 'AO', name: 'Unclassified artificial trigger' } // specify
            ]
            /* eslint-enable quote-props */
        }

        scope.naturalTriggers = [
            { code: 'N', name: 'Natural trigger' },
            { code: 'NC', name: 'Cornice fall' },
            { code: 'NE', name: 'Earthquake' },
            { code: 'NI', name: 'Ice fall' },
            { code: 'NL', name: 'Avalanche triggered by loose snow avalanche' },
            { code: 'NS', name: 'Avalanche triggered by slab avalanche' },
            { code: 'NR', name: 'Rock fall' },
            { code: 'NO', name: 'Unclassified natural trigger' } // specify
        ]
    }
}))
