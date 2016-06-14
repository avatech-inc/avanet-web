
import './ob-search.html'

export const ObSearch = [
    'Global',
    'ObSearch',

    (
        Global,
        ObSearch
    ) => ({
        restrict: 'A',
        templateUrl: '/modules/map/ob-search.html',
        scope: {
            obSearch: '=obSearch',
            showPublisher: '=showPublisher',
            orgs: '=orgs'
        },
        link: (scope) => {
            scope.obSearch = ObSearch

            // formatters

            scope.formatElev = val => {
                let _val = val

                if (!Global.user.settings) return _val

                // meters
                if (!Global.user.settings.elevation) {
                    _val = val + ' m'

                // feet
                } else {
                    _val = Math.round(val * 3.28084).toFixed(0) + ' ft'
                }

                return _val
            }

            scope.formatTempRange = (val1, val2) => {
                let _val = val1

                if (!Global.user.settings) return _val

                // meters
                if (!Global.user.settings.elevation) {
                    _val = val1 + '-' + val2 + ' m'

                // feet
                } else {
                    _val = (
                        Math.round(val1 * 3.28084).toFixed(0) +
                        '-' +
                        Math.round(val2 * 3.28084).toFixed(0) + ' ft'
                    )
                }

                return _val
            }

            scope.formatDegSlider = val => val + '°'
        }
    })
]

export const ObSearchFactory = [
    'Global',

    Global => {
        let service = {}
        let defaultPublisher = {
            orgs: null,
            outsideOrgs: true,
            me: true,
            rec: true
        }

        service.elevationMax = Global.user.settings.elevation === 0 ? 8850 : 8850

        service.searchQuery = {
            days: 7,

            elev_low: 0,
            elev_high: service.elevationMax,

            aspect_low: 0,
            aspect_high: 359,

            slope_low: 0,
            slope_high: 70,

            text: '',

            type: {},

            publisher: angular.copy(defaultPublisher)
        }

        service.observationTypes = [
            'avalanche',
            'weather',
            'wind',
            'snowpack',
            'snowpack-test',
            'snowpit',
            'sp-profile',
        ]

        service.search_text = val => {
            let needle = service.searchQuery.text.toLowerCase()

            if (needle.length < 3) return true

            // build haystack
            let haystack = []

            if (val.user.fullName) {
                haystack.push(val.user.fullName.toLowerCase())
            }

            if (val.metaData && val.metaData.location) {
                haystack.push(val.metaData.location.toLowerCase())
            }

            if (val.organization) {
                haystack.push(val.organization.name.toLowerCase())
            }

            // search through haystack
            for (let i = 0; i < haystack.length; i++) {
                if (haystack[i].length === 0) continue
                if (haystack[i].indexOf(needle) !== -1) return true
            }

            return false
        }

        service.publisher_isOutsideOrg = orgId => {
            for (let i = 0; i < Global.orgs.length; i++) {
                if (Global.orgs[i]._id === orgId) return false
            }

            return true
        }

        service.search_publisher = val => {
            let self = service
            let allowed = false

            // my orgs
            if (self.searchQuery.publisher.orgs) {
                // if no organization specified, return null
                if (!val.organization) allowed = false

                if (
                    val.organization &&
                    !self.publisher_isOutsideOrg(val.organization._id) &&
                    self.searchQuery.publisher.orgs.indexOf(val.organization._id) !== -1
                ) {
                    allowed = true
                } else if (!self.searchQuery.publisher.orgs) {
                    allowed = true
                }

                // outside orgs
                if (
                    !val.organization ||
                    (
                        val.organization &&
                        self.publisher_isOutsideOrg(val.organization._id)
                    )
                ) {
                    allowed = self.searchQuery.publisher.outsideOrgs
                }

                // rec users
                // console.log("userType: " + val.user.userType);
                if (
                    val.user &&
                    (
                        (
                            val.user.userType &&
                            val.user.userType.indexOf('pro') === -1
                        ) ||
                        !val.user.userType
                    )
                ) {
                    // if (val.user && val.user.student) {
                    if (
                        allowed === false &&
                        self.searchQuery.publisher.rec
                    ) {
                        allowed = true
                    } else if (
                        allowed === true &&
                        !self.searchQuery.publisher.rec
                    ) {
                        allowed = false
                    }
                }

                // me
                if (self.searchQuery.publisher.me === null) {
                    self.searchQuery.publisher.me = true
                }

                if (self.searchQuery.publisher.me !== null) {
                    if (val.user._id === Global.user._id) {
                        if (
                            allowed === false &&
                            self.searchQuery.publisher.me
                        ) {
                            allowed = true
                        } else if (
                            allowed === true &&
                            !self.searchQuery.publisher.me
                        ) {
                            allowed = false
                        }
                    }
                }

                return allowed
            }
        }

        service.search_type = val => service.searchQuery.type[val.type]

        service.search_date = val => {
            let d = new Date()

            // hack for 'today' (since midnight)
            if (service.searchQuery.days === 0) {
                // set to midnight
                d.setHours(0, 0, 0, 0)
            } else {
                d.setDate(d.getDate() - service.searchQuery.days)
            }

            return (new Date(val.date) > d)
        }

        service.search_elevation = val => {
            // if full range is selected, return everything
            // (including profiles without elevation specified)
            if (
                service.searchQuery.elev_low === 0 &&
                service.searchQuery.elev_high === service.elevationMax
            ) {
                return true
            } else if (
                (
                    val.metaData &&
                    val.metaData.elevation
                ) ||
                val.elevation
            ) {
                let elevation

                if (val.metaData && val.metaData.elevation) {
                    elevation = val.metaData.elevation
                } else {
                    elevation = val.elevation
                }

                return (
                        elevation >= service.searchQuery.elev_low &&
                        elevation <= service.searchQuery.elev_high
                )
            }

            return false
        }

        service.search_aspect = val => {
            // if full range is selected, return everything
            // (including profiles without aspect specified)
            if (
                service.searchQuery.aspect_low === 0 &&
                service.searchQuery.aspect_high === 359
            ) {
                return true
            } else if (
                (
                    val.metaData &&
                    val.metaData.aspect
                ) ||
                val.aspect
            ) {
                let aspect

                if (val.metaData && val.metaData.aspect) {
                    aspect = val.metaData.aspect
                } else {
                    aspect = val.aspect
                }

                if (service.searchQuery.aspect_low > service.searchQuery.aspect_high) {
                    if (
                        aspect >= service.searchQuery.aspect_low ||
                        aspect <= service.searchQuery.aspect_high
                    ) {
                        return true
                    }
                } else if (
                    aspect >= service.searchQuery.aspect_low &&
                    aspect <= service.searchQuery.aspect_high
                ) {
                    return true
                }

                return false
            }

            return false
        }

        service.search_slope = val => {
            // if full range is selected, return everything
            // (including profiles without slope specified)
            if (service.searchQuery.slope_low === 0 && service.searchQuery.slope_high === 70) {
                return true
            } else if (
                (
                    val.metaData &&
                    val.metaData.slope
                ) ||
                val.slope
            ) {
                let slope

                if (val.metaData && val.metaData.slope) {
                    slope = val.metaData.slope
                } else {
                    slope = val.slope
                }

                return (
                    slope >= service.searchQuery.slope_low &&
                    slope <= service.searchQuery.slope_high
                )
            }

            return false
        }

        service.doSearch = profile => {
            let self = service
            let ok = true

            // only search through published profiles
            if (!profile.published) return false

            if (self.search_type(profile) === false) ok = false
            if (self.search_date(profile) === false) ok = false
            if (self.search_text(profile) === false) ok = false
            if (self.search_publisher(profile) === false) ok = false
            if (self.search_elevation(profile) === false) ok = false
            if (self.search_aspect(profile) === false) ok = false
            if (self.search_slope(profile) === false) ok = false

            return ok
        }

        service.publisher_isOrgSelected = orgId => {
            if (!service.searchQuery.publisher.orgs) {
                return true
            }

            return (service.searchQuery.publisher.orgs.indexOf(orgId) !== -1)
        }

        service.publisher_selectOrg = orgId => {
            let self = service

            // if empty, add all orgs
            if (!service.searchQuery.publisher.orgs) {
                service.searchQuery.publisher.orgs = []

                angular.forEach(Global.orgs, org => {
                    self.searchQuery.publisher.orgs.push(org._id)
                })
            }

            // if not in array, add
            if (service.searchQuery.publisher.orgs.indexOf(orgId) === -1) {
                service.searchQuery.publisher.orgs.push(orgId)

            // if already in array, remove
            } else {
                for (let i = 0; i < service.searchQuery.publisher.orgs.length; i++) {
                    if (service.searchQuery.publisher.orgs[i] === orgId) {
                        service.searchQuery.publisher.orgs.splice(i, 1)
                        break
                    }
                }
            }
        }

        service.publisher_selectMyOrgs = () => {
            let self = service

            // if all orgs selected, select none
            if (
                service.searchQuery.publisher.orgs === null ||
                (
                    service.searchQuery.publisher.orgs &&
                    service.searchQuery.publisher.orgs.length === Global.orgs.length
                )
            ) {
                service.searchQuery.publisher.orgs = []

            // if none selected, add all orgs
            } else {
                service.searchQuery.publisher.orgs = []

                angular.forEach(Global.orgs, org => {
                    self.searchQuery.publisher.orgs.push(org._id)
                })
            }
        }

        service.publisher_selectOutsideOrgs = () => {
            if (service.searchQuery.publisher.outsideOrgs !== null) {
                service.searchQuery.publisher.outsideOrgs = !service.searchQuery.publisher.outsideOrgs  // eslint-disable-line max-len
            } else {
                service.searchQuery.publisher.outsideOrgs = false
            }
        }

        service.publisher_selectMe = () => {
            if (service.searchQuery.publisher.me !== null) {
                service.searchQuery.publisher.me = !service.searchQuery.publisher.me
            } else {
                service.searchQuery.publisher.me = false
            }
        }

        service.publisher_selectRec = () => {
            if (service.searchQuery.publisher.rec !== null) {
                service.searchQuery.publisher.rec = !service.searchQuery.publisher.rec
            } else {
                service.searchQuery.publisher.rec = false
            }
        }

        service.type_select = type => {
            service.searchQuery.type[type] = !service.searchQuery.type[type]
        }

        service.clearSearchElevation = $event => {
            $event.preventDefault()

            service.searchQuery.elev_low = 0
            service.searchQuery.elev_high = 9000

            return false
        }

        service.clearSearchAspect = $event => {
            $event.preventDefault()

            service.searchQuery.aspect_low = 0
            service.searchQuery.aspect_high = 359

            return false
        }

        service.clearSearchSlope = $event => {
            $event.preventDefault()

            service.searchQuery.slope_low = 0
            service.searchQuery.slope_high = 70

            return false
        }

        service.isDefaultPublisher = () => {
            if (!service.searchQuery) return false

            let publisher = service.searchQuery.publisher

            return (
                (
                    publisher.orgs === null ||
                    publisher.orgs.length === Global.orgs.length
                ) &&
                (publisher.outsideOrgs === true) &&
                (publisher.me === true) &&
                (publisher.rec === true)
            )
        }

        service.setDefaultPublisher = () => {
            service.searchQuery.publisher = angular.copy(defaultPublisher)
        }

        service.isDefaultType = () => {
            let trueCount = 0

            angular.forEach(service.searchQuery.type, obType => {
                if (obType) trueCount++
            })

            return (trueCount === Object.keys(service.observationTypes).length)
        }

        service.setDefaultType = () => {
            let self = service

            angular.forEach(service.observationTypes, obType => {
                self.searchQuery.type[obType] = true
            })
        }

        // add all observation types to query as default
        service.setDefaultType()

        return service
    }
]
