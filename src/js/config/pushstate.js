
const PushState = [
    '$locationProvider',

    $locationProvider => $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    })
]

export default PushState
