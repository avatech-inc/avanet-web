
const _ = {}

import remove from 'lodash.remove'
import findIndex from 'lodash.findindex'

_.remove = remove
_.findIndex = findIndex


class ObservationsService {
    constructor(
        $interval,
        Global,
        $http
    ) {
        this.observations = []

        this.$interval = $interval
        this.Global = Global
        this.$http = $http
    }

    _update(observation) {
        let index = _.findIndex(this.observations, _ob => _ob._id === observation._id)

        // doesn't exist, add
        if (index === -1) {
            this.observations.push(observation)

        // if route already exists, replace
        } else {
            this.observations[index] = observation
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

        // Restangular.all("users/" + Global.user._id + "/observations")
        // .getList({
        //     verbose: false,
        //     //since: lastSync.toISOString()
        // })
        // .then(function(obs) {

        this.$http({
            method: 'GET',
            url: window.apiBaseUrl + 'users/' + this.Global.user._id + '/observations',
            responseType: 'json',
            params: {
                verbose: false
            }
        })
        .then(res => {
            for (let ob of res.data) {
                this._update(ob)
            }

            // keep track of last sync
            this.lastSync = new Date()

            // callback
            if (callback) callback()
        })
    }

    save(observation, callback) {
        this._update(observation)

        // update
        if (observation._id) {
            this.$http
                .put(window.apiBaseUrl + 'observations/' + observation._id, observation)
                .then(res => {
                    angular.extend(observation, res.data)
                    this._update(observation)

                    if (callback) callback(observation)
                })

        // create
        } else {
            this.$http
                .post(window.apiBaseUrl + 'observations', observation)
                .then(res => {
                    angular.extend(observation, res.data)
                    this._update(observation)

                    if (callback) callback(observation)
                })
        }
    }

    remove(observation) {
        // remove from local cache
        _.remove(this.observations, _ob => _ob._id === observation._id)

        // mark as removed on server
        this.$http.delete(window.apiBaseUrl + 'observations/' + observation._id)
    }
}

ObservationsService.$inject = [
    '$interval',
    'Global',
    '$http'
]

export default ObservationsService
