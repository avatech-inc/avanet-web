
import '../../modules/forms/direction-select.html'
import '../../modules/forms/radiobuttons-nullable.html'
import '../../modules/forms/datepicker.html'
import '../../modules/forms/grain-type-select.html'
import '../../modules/forms/trend-select.html'
import '../../modules/forms/location-select.html'
import '../../modules/forms/avalanche-trigger-select.html'
import '../../modules/forms/number.html'

const Schema = [
    'schemaFormDecoratorsProvider',

    schemaFormDecoratorsProvider => {
        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'direction-select',
            '/modules/forms/direction-select.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'radiobuttons-nullable',
            '/modules/forms/radiobuttons-nullable.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'datepicker',
            '/modules/forms/datepicker.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'grainTypeSelect',
            '/modules/forms/grain-type-select.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'trend-select',
            '/modules/forms/trend-select.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'location-select',
            '/modules/forms/location-select.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'avalanche-trigger-select',
            '/modules/forms/avalanche-trigger-select.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'number',
            '/modules/forms/number.html'
        )

        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'units',
            '/modules/forms/number.html'
        )
    }
]

export default Schema
