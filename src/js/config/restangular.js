
const RestAngular = [
    'RestangularProvider',

    RestangularProvider => {
        // set API base url
        RestangularProvider.setBaseUrl(window.apiBaseUrl)

        // support mongodb '_id' format
        RestangularProvider.setRestangularFields({ id: '_id' })
    }
]

export default RestAngular
