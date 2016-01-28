
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
            let obs = res.data

            for (let i = 0; i < obs.length; i++) {
                this.addOrReplace(obs[i])
            }

            // keep track of last sync
            this.lastSync = new Date()

            // callback
            if (callback) callback()
        })
    }

    replaceObservation(observation) {
        for (let i = 0; i < this.observations.length; i++) {
            let _observation = this.observations[i]

            if (_observation._id === observation._id) {
                this.observations[i] = observation
                return true
            }
        }

        return false
    }

    addOrReplace(observation) {
        // if observation already exists, replace
        if (this.replaceObservation(observation)) return

        // doesn't exist, add
        this.observations.push(observation)

        // todo: removed
    }

    save(observation, callback) {
        this.replaceObservation(observation)

        // update
        if (observation._id) {
            this.$http
                .put(window.apiBaseUrl + 'observations/' + observation._id, observation)
                .then(res => {
                    angular.extend(observation, res.data)
                    this.replaceObservation(observation)

                    if (callback) callback(observation)
                })

        // create
        } else {
            this.$http
                .post(window.apiBaseUrl + 'observations', observation)
                .then(res => {
                    angular.extend(observation, res.data)
                    this.replaceObservation(observation)

                    if (callback) callback(observation)
                })
        }
    }

    remove(observation) {
        // remove from local cache
        let index = -1

        for (let i = 0; i < this.observations.length; i++) {
            let _observation = this.observations[i]

            if (_observation._id === observation._id) {
                index = i
                break
            }
        }

        if (index > -1) {
            this.observations.splice(index, 1)
        }

        // mark as removed on server
        this.$http.delete(window.apiBaseUrl + 'observations/' + observation._id)
    }
}

ObservationsService.$inject = [
    '$interval',
    'Global',
    '$http'
]

angular.module('avatech').service('Observations', ObservationsService)
