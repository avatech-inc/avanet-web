
const Translate = [
    '$translateProvider',
    '$translatePartialLoaderProvider',

    ($translateProvider,
     $translatePartialLoaderProvider) => {
        $translatePartialLoaderProvider.addPart('test')
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/translate/{lang}/{part}.json'
        })

        // set language
        $translateProvider.preferredLanguage('en')

        // enable proper escaping of translation content
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters')
    }
]

export default Translate
