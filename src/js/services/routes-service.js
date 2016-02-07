
const _ = {}

import remove from 'lodash.remove'
import findIndex from 'lodash.findindex'

_.remove = remove
_.findIndex = findIndex


class RoutesService {
    constructor(
        $interval,
        Global,
        $http
    ) {
        this.routes = []

        this.$interval = $interval
        this.Global = Global
        this.$http = $http
    }

    _update(route) {
        let index = _.findIndex(this.routes, _route => _route._id === route._id)

        // doesn't exist, add
        if (index === -1) {
            this.routes.push(route)

        // if route already exists, replace
        } else {
            this.routes[index] = route
        }

        // todo: removed
    }

    init() {
        this.sync()

        this.$interval(() => this.sync(), 60000)
    }

    sync(callback) {
        // if user not available, don't sync
        if (!this.Global.user || !this.Global.user._id) return

        // Restangular.all("users/" + Global.user._id + "/routes")
        // .getList({
        //     verbose: false,
        //     //since: lastSync.toISOString()
        // })
        // .then(function(obs) {

        this.$http({
            method: 'GET',
            url: window.apiBaseUrl + 'users/' + this.Global.user._id + '/routes',
            responseType: 'json',
            params: {
                verbose: false
            }
        })
        .then(res => {
            for (let route of res.data) {
                this._update(route)
            }

            // keep track of last sync
            this.lastSync = new Date()

            // callback
            if (callback) callback()
        })
    }

    add(route) {
        this._update(route)
    }

    remove(route) {
        // remove from local cache
        _.remove(this.routes, _route => _route._id === route._id)

        // mark as removed on server
        this.$http.delete(window.apiBaseUrl + 'routes/' + route._id)
    }
}

RoutesService.$inject = [
    '$interval',
    'Global',
    '$http'
]

export default RoutesService
