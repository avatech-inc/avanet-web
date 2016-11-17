
// libraries
import uiMask from 'angular-ui-mask'

// config
import Routes from './config/routes'
import Lightbox from './config/lightbox'
import Schema from './config/schema'
import RestAngular from './config/restangular'
import PushState from './config/pushstate'
import Tooltip from './config/tooltip'
import Translate from './config/translate'

// services
import Global from './services/global'
import RoutesService from './services/routes-service'
import ObservationsService from './services/observations-service'

// directives
import { DatePicker, MoDateInput, DateInput } from './directives/datepicker'
import { InputDirectionRange, InputDirection } from './directives/input-direction'
import Uploader from './directives/fileupload'
import GrainSelect from './directives/grain-select'
import Autosize from './directives/textarea-autosize'
import TimeInput from './directives/timeinput'
import Validate from './directives/validation'

// admin
import AdminController from '../modules/admin/admin'
import AdminUsersController from '../modules/admin/admin-users'
import AdminOrgsController from '../modules/admin/admin-orgs'

// comments
import CommentsNew from '../modules/comments/comments'

// misc
import {
    LocationSelectButton,
    AccordionNew,
    OnEnter,
    FocusOn,
    AutoFocus,
    WindowResize,
    OnChange,
    MetersOrFeet,
    CmOrIn,
    TempUnits,
    NumberOnly,
    CloseDropdown,
    TooltipHide,
    SelectOnClick
} from './directives/misc'

// header
import HeaderController from '../modules/header/header'

// map
import Layers from '../modules/map/layers'
import LinearGraph from '../modules/map/linear-graph'
import Map from '../modules/map/map-directive'
import MapController from '../modules/map/map'
import { ObSearch, ObSearchFactory } from '../modules/map/ob-search'
import RoseGraph from '../modules/map/rose-graph'
import RoutePlanning from '../modules/map/route-planning'

// map search
import MapSearch from '../modules/map-search/map-search'

// observations
import NewObservation from '../modules/observations/observations'
import ObservationPreview from '../modules/observations/preview'
import OrganizationsController from '../modules/organizations/organizations'

// dialogs
import { Confirm, ConfirmController } from '../modules/confirm/confirm'
import { Publish, PublishController } from '../modules/publish-modal/modal'
import {
    LocationSelect,
    LocationSelectController
} from '../modules/location-select-modal/location-select-modal'

// snowpit editor
import AvalancheTriggerSelect from '../modules/forms/avalanche-trigger-select'
import ProfileEditor from '../modules/snowpit-editor/snowpit-canvas'
import SnowpitConstants from '../modules/snowpit-editor/snowpit-constants'
import {
    SnowpitEditor,
    Draggable,
    DraggableHardness
} from '../modules/snowpit-editor/snowpit-editor'
import SnowpitExport from '../modules/snowpit-editor/snowpit-export'
import { SnowpitProfile, SnowpitProfileBig } from '../modules/snowpit-editor/snowpit-graphs'
import SnowpitStability from '../modules/snowpit-editor/snowpit-stability'
import SnowpitViews from '../modules/snowpit-editor/snowpit-views'
import { GraphBig, Graph } from '../modules/sp-profiles/sp-profile-graphs'

// devices
import { RegisterDevice, RegisterDeviceController } from '../modules/register-device-modal/modal'
import { DeviceUpload, DeviceUploadController, SP1Upload } from '../modules/sp-profile-upload/modal'

// user
// import ForgotPassword from '../modules/user/forgot-password'
import Login from '../modules/user/login'
// import Register from '../modules/user/register'
// import ResetPassword from '../modules/user/reset-password'
// import Settings from '../modules/user/settings'

// eslint-disable-next-line import/no-unresolved
// import { Billing } from '../modules/user/billing'

import Terrain from '../modules/map/terrain-visualization'

let DEPS = [
    'ngRoute',
    'ngTouch',
    'ui.bootstrap',
    'ui.router',
    'ui.route',
    'restangular',
    'LocalStorageModule',
    'angularMoment',
    'sun.scrollable',
    'vr.directives.slider',
    'pascalprecht.translate',
    'schemaForm',
    'pasvaz.bindonce',
    'ct.ui.router.extras',
    'bootstrapLightbox',
    'credit-cards',
    'angular-country-picker',
    'pikaday',
    'ngjsColorPicker',
    'ngAudio',
    'terrain',
    'ui.mask'
]

if (__DEV__) {
    window.apiBaseUrl = 'http://localhost:10010/v2/'
    window.payBaseUrl = 'http://localhost:5000/'
}

if (__STAGE__) {
    window.apiBaseUrl = 'https://avanet-api-dev.herokuapp.com/v2/'
    window.payBaseUrl = 'https://secure-demo.avatech.com/'
}

if (__PROD__) {
    window.apiBaseUrl = 'https://api.avatech.com/v2/'
    window.payBaseUrl = 'https://secure.avatech.com/'

    DEPS.unshift('ngRaven')
}

angular.module('schemaForm').config(Schema)
angular.module('terrain', []).factory('terrainVisualization', Terrain)

// define app and dependencies
angular.module('avatech', DEPS)

    // config
    .config(Routes)
    .config(Lightbox)
    .config(RestAngular)
    .config(PushState)
    .config(Tooltip)
    .config(Translate)

    // services
    .service('Routes', RoutesService)
    .service('Observations', ObservationsService)

    // factories
    .factory('Global', Global)
    .factory('Confirm', Confirm)
    .factory('LocationSelectModal', LocationSelect)
    .factory('mapLayers', Layers)
    .factory('ObSearch', ObSearchFactory)
    .factory('PublishModal', Publish)
    .factory('RegisterDeviceModal', RegisterDevice)
    .factory('snowpitConstants', SnowpitConstants)
    .factory('snowpitExport', SnowpitExport)
    .factory('snowpitViews', SnowpitViews)
    .factory('DeviceUploadModal', DeviceUpload)

    // directives
    .directive('map', Map)
    .directive('datetimepicker', DatePicker)
    .directive('moDateInput', MoDateInput)
    .directive('dateInput', DateInput)
    .directive('uploader', Uploader)
    .directive('grainSelect', GrainSelect)
    .directive('inputDirectionRange', InputDirectionRange)
    .directive('inputDirection', InputDirection)
    .directive('autosize', Autosize)
    .directive('time', TimeInput)
    .directive('validate', Validate)
    .directive('commentsNew', CommentsNew)
    .directive('avalancheTriggerSelect', AvalancheTriggerSelect)
    .directive('linearGraph', LinearGraph)
    .directive('obSearch', ObSearch)
    .directive('roseGraph', RoseGraph)
    .directive('mapSearch', MapSearch)
    .directive('profileEditor', ProfileEditor)
    .directive('draggableLayer', Draggable)
    .directive('draggableHardness', DraggableHardness)
    .directive('profile', SnowpitProfile)
    .directive('profileBig', SnowpitProfileBig)
    .directive('stabilityTest', SnowpitStability)
    .directive('sp1Upload', SP1Upload)
    .directive('graphBig', GraphBig)
    .directive('graph', Graph)

    // misc
    .directive('locationSelectButton', LocationSelectButton)
    .directive('accordionNew', AccordionNew)
    .directive('onenter', OnEnter)
    .directive('focusOn', FocusOn)
    .directive('autoFocus', AutoFocus)
    .directive('windowResize', WindowResize)
    .directive('onChange', OnChange)
    .directive('metersOrFeet', MetersOrFeet)
    .directive('cmOrIn', CmOrIn)
    .directive('tempUnits', TempUnits)
    .directive('numberOnly', NumberOnly)
    .directive('closeDropdownOnClick', CloseDropdown)
    .directive('tooltipHideOnClick', TooltipHide)
    .directive('selectOnClick', SelectOnClick)

    // controllers
    .controller('MapController', MapController)
    .controller('AdminController', AdminController)
    .controller('AdminUsersController', AdminUsersController)
    .controller('AdminOrgsController', AdminOrgsController)
    .controller('ConfirmController', ConfirmController)
    .controller('HeaderController', HeaderController)
    .controller('LocationSelectModalController', LocationSelectController)
    .controller('RoutePlanningController', RoutePlanning)
    .controller('NewObservationModalController', NewObservation)
    .controller('ObservationPreviewController', ObservationPreview)
    .controller('OrganizationsController', OrganizationsController)
    .controller('PublishModalController', PublishController)
    .controller('RegisterDeviceModalController', RegisterDeviceController)
    .controller('SnowpitController', SnowpitEditor)
    .controller('DeviceUploadModalController', DeviceUploadController)
    // .controller('ForgotPasswordController', ForgotPassword)
    .controller('LoginController', Login)
    // .controller('RegisterController', Register)
    // .controller('ResetPasswordController', ResetPassword)
    // .controller('SettingsController', Settings)
    // .controller('Billing', Billing)

// configure console debug
if (__PROD__) {
    angular.module('avatech').config([
        '$logProvider',
        $logProvider => $logProvider.debugEnabled(false)
    ])
}

// the first thing that gets run
angular.module('avatech').run([
    '$rootScope',
    '$location',
    '$state',
    '$log',
    '$document',
    '$uibModalStack',
    'Observations',
    'Routes',
    'Global',

    (
        $rootScope,
        $location,
        $state,
        $log,
        $document,
        $uibModalStack,
        Observations,
        Routes,
        Global
    ) => {
        $rootScope.todaysDate = new Date()

        // init global service
        Global.init()

        // init observations service
        Observations.init()

        // init routes service
        Routes.init()

        $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState) => {
            // close any open modals before navigating to new state
            $uibModalStack.dismissAll()

            if (!toState) return
            if (toState.name === fromState.name) return

            // todo: kludgy non-angular way to clear tooltips on state change.
            // not ideal, but best solution for now
            $('.tooltip').remove()

            // redirect from login page if already logged in
            if (toState.data && toState.data.redirectIfLoggedIn && Global.user) {
                $log.debug('already logged in...')
                event.preventDefault()
                $state.transitionTo('index', null, { location: 'replace' })
                return
            }

            // access control
            if (toState.data && toState.data.requireLogin && !Global.user) {
                $log.debug('must be logged in')
                event.preventDefault()
                Global.redirectUrl = $location.url()
                $state.transitionTo('login', null, { location: 'replace' })
                return
            }

            if (toState.data && toState.data.requireAdmin && !Global.user.admin) {
                $log.debug('admin only')
                event.preventDefault()
                $state.transitionTo('index', null, { location: 'replace' })
                return
            }

            // set title
            // todo: there's gotta be a more angular-y way to do this
            let documentTitle = ''

            if (toState.data && toState.data.title) {
                documentTitle = toState.data.title
            }

            $document.prop('title', documentTitle)
        })

        // 3. after route change
        $rootScope.$on('$stateChangeSuccess', (event, toState) => {
            // resize map based on new layout
            $rootScope.$broadcast('resizeMap')

            if (__PROD__) {
                analytics.page()
            }

            // add class to body for page-specific styling
            // todo: there's gotta be a more angular-y way to do this
            //        ^^ in fact there is, <body class='{{ bodyCssClass }}' $rootScope.bodyCssClass
            let cssClass = ''

            if (toState.data && toState.data.bodyCssClass) {
                cssClass = toState.data.bodyCssClass
            }

            $document[0].body.className = cssClass
        })
    }
])
