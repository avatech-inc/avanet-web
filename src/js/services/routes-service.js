
class RoutesService {
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

    save(observation) {
        this.replaceObservation(observation)

        // update on server
        // todo: update!
        // if (observation.type == 'test') {
        //  $http.post("/v1/tests", observation);
        // }
    }

    add(observation) {
        this.addOrReplace(observation)
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

        if (index > -1) this.observations.splice(index, 1)

        // mark as removed on server
        this.$http.delete(window.apiBaseUrl + 'routes/' + observation._id)
    }
}

RoutesService.$inject = [
    '$interval',
    'Global',
    '$http'
]

angular.module('avatech').service('Routes', RoutesService)
