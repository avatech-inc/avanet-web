
import './map-search.html'

const MapSearch = [
    '$timeout',
    '$log',

    (
        $timeout,
        $log
    ) => ({
        restrict: 'E',
        scope: {
            locationSelect: '&'
        },
        templateUrl: '/modules/map-search/map-search.html',

        link: (scope, elem, attr, ctrl) => {
          // $(elem).keydown(function(event) {
          //    if (event.keyCode == 13) {
          //       scope.onenter();
          //       console.log("enter!");
          //       return false;
          //    }
          // });
        },

        controller: ($scope, $timeout, $log) => {
            // -- map location search --

            // simple lat/lng distance sorting
            let geoSort = (locations, pos) => {
                let dist = l => (
                    (l.lat - pos.lat) * (l.lat - pos.lat) +
                    (l.lng - pos.lng) * (l.lng - pos.lng)
                )

                locations.sort((l1, l2) => dist(l1) - dist(l2))
            }

            let getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
                let deg2rad = deg => deg * (Math.PI / 180)

                let R = 6371 // Radius of the earth in km
                let dLat = deg2rad(lat2 - lat1)  // deg2rad below
                let dLon = deg2rad(lon2 - lon1)
                let a = (
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)
                )
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))  // Math.asin(Math.sqrt(a))

                return R * c // Distance in km
            }

            let levDist = (s, t) => {
                let d = [] // 2d matrix

                // Step 1
                let n = s.length
                let m = t.length

                if (n === 0) return m
                if (m === 0) return n

                // Create an array of arrays in javascript (a descending loop is quicker)
                for (let i = n; i >= 0; i--) d[i] = []

                // Step 2
                for (let i = n; i >= 0; i--) d[i][0] = i
                for (let j = m; j >= 0; j--) d[0][j] = j

                // Step 3
                for (let i = 1; i <= n; i++) {
                    let sI = s.charAt(i - 1)

                    // Step 4
                    for (let j = 1; j <= m; j++) {
                        // Check the jagged ld total so far
                        if (i === j && d[i][j] > 4) return n

                        let tJ = t.charAt(j - 1)
                        let cost = (sI === tJ) ? 0 : 1 // Step 5

                        // Calculate the minimum
                        let mi = d[i - 1][j] + 1
                        let b = d[i][j - 1] + 1
                        let c = d[i - 1][j - 1] + cost

                        if (b < mi) mi = b
                        if (c < mi) mi = c

                        d[i][j] = mi // Step 6

                        // Damerau transposition
                        if (
                            i > 1 &&
                            j > 1 &&
                            sI === t.charAt(j - 2) &&
                            s.charAt(i - 2) === tJ
                        ) {
                            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost)
                        }
                    }
                }

                // Step 7
                return d[n][m]
            }

            let abort
            let timer

            $scope.$watch('geo.query', () => {
                // clear current results
                $scope.geo.results = []

                if (abort) abort.abort()
                if (timer) $timeout.cancel(timer)

                timer = $timeout(() => {
                    $scope.geoSearch()
                }, 300)
            }, true)

            $scope.geo = { query: '', results: [] }

            $scope.geoSearch = () => {
                $log.debug($scope.geo.query)

                $scope.geo.query = $scope.geo.query.trim()

                if ($scope.geo.query === '') return

                // codeAddress($scope.geo.geoQuery);

                if ($scope.geo.query.length < 3) return

                $scope.searching = true

                // abort = $q.defer();

                abort = $.getJSON(
                    'https://ba-secure.geonames.net/searchJSON?q=' +
                    $scope.geo.query +
                    '&countryBias=US' +
                    '&featureClass=A' +
                    '&featureClass=L' +
                    '&featureClass=P' +
                    '&featureClass=T' +
                    '&featureClass=V' +
                    '&featureClass=S' +
                    '&style=FULL' +
                    '&maxRows=20' +
                    '&username=avatech'
                )

                // .success(function(data, status, headers, config) {

                // });
                // $http({ method: 'GET', timeout: abort.promise,
                //     url: "https://ba-secure.geonames.net/searchJSON?q=" + $scope.geo.query + "&countryBias=US&featureClass=A&featureClass=L&featureClass=P&featureClass=T&featureClass=V&featureClass=S&style=FULL&maxRows=20&username=avatech" })
                .success((data, status, headers, config) => {
                    $scope.searching = false
                    // geoSort(data.geonames, 40.633052, -111.5658795);

                    let states = {
                        // primary
                        CO: 200,
                        UT: 200,
                        WA: 100,
                        NV: 100,
                        MT: 100,
                        WY: 100,
                        AK: 100,
                        CA: 100,
                        ID: 100,
                        OR: 100,

                        // secondary
                        NH: 50,
                        ME: 50,
                        NM: 30,
                        VT: 20,
                        NY: 20,

                        // mostly flat
                        AZ: 10,
                        MA: 10,
                        MN: 10,
                        NJ: 10,
                        NC: 10,
                        ND: 10,
                        PA: 10,
                        SD: 10,
                        TN: 10,
                        VA: 10,
                        WV: 10,
                        MI: 10,

                        // flat places
                        NE: 0,
                        AL: 0,
                        AS: 0,
                        AR: 0,
                        CT: 0,
                        DE: 0,
                        DC: 0,
                        FM: 0,
                        FL: 0,
                        GA: 0,
                        GU: 0,
                        HI: 0,
                        IL: 0,
                        IN: 0,
                        IA: 0,
                        PR: 0,
                        RI: 0,
                        SC: 0,
                        PW: 0,
                        MP: 0,
                        MH: 0,
                        KS: 0,
                        MD: 0,
                        OH: 0,
                        OK: 0,
                        VI: 0,
                        MS: 0,
                        MO: 0,
                        TX: 0,
                        WI: 0,
                        KY: 0,
                        LA: 0,
                    }

                    // remove
                    let exlcude = [
                        'church',
                        'cemetery',
                        'mine(s)',
                        'tower',
                        'golf course',
                        'island',
                        'mall',
                        'museum',
                        'library'
                    ]

                    // eslint-disable-next-line array-callback-return, consistent-return
                    data.geonames = data.geonames.filter(a => {
                        let code = a.fcodeName

                        $log.debug(a.countryCode)

                        if (exlcude.indexOf(code) === -1 &&
                            a.countryCode !== undefined) {
                            return a
                        }
                    })

                    // // sort by location weight
                    // for (var i = 0; i < data.geonames.length; i++) {
                    //     var result = data.geonames[i];
                    //     result.weight = states[result.adminCode1.trim().toUpperCase()];
                    //     if (result.weight == null) {
                    // console.log("NOT FOUND (" + result.adminCode1 + ")");
                    // result.weight = 100; }
                    // }

                    //   data.geonames.sort(function(a,b) {
                    //     return b.weight - a.weight;
                    //   });

                    // filter out only the "flat" areas
                      // data.geonames = data.geonames.filter(function(a) {
                      //   return a.weight > 0;
                      // });

                    // merge "neighbors"
                    let merged = []

                    for (let i = 0; i < data.geonames.length; i++) {
                        let neighbors = []
                        let result = data.geonames[i]

                        // go through others
                        for (let j = 0; j < data.geonames.length; j++) {
                            let result2 = data.geonames[j]

                            if (result2.merged) continue

                            // if (result == result2) continue;

                            let distance = getDistanceFromLatLonInKm(
                                parseFloat(result.lat),
                                parseFloat(result.lng),
                                parseFloat(result2.lat),
                                parseFloat(result2.lng)
                            )

                            // console.log(distance);
                            // console.log(result2.merged);

                            if (distance < 2) {
                                result.merged = true
                                result2.merged = true
                                neighbors.push(result2)
                            }
                        }

                        // console.log(neighbors.length);
                        if (neighbors.length !== 0) {
                            merged.push(neighbors)
                        }

                        // break;
                    }

                    // find the "best" of the merged
                    let finalResults = []

                    for (let i = 0; i < merged.length; i++) {
                        let _merged = merged[i]

                        if (_merged.length === 1) {
                            finalResults.push(_merged[0])
                            continue
                        }

                        $log.debug('----------------------- ' + i)

                        // for (var m = 0; m < _merged.length; m++) {
                        //     var result = _merged[m];
                        //     var name = result.name.toLowerCase().trim();
                        //     var query = $scope.geo.query.toLowerCase().trim();

                        //     // if (name == query) result.quality = 3;
                        //     // else if (name.indexOf(query) == 0) result.quality = 2;
                        //     // else if (name.indexOf(query) != -1) result.quality = 1;
                        //     // else result.quality = 0;

                        //     //if (name == query) result.quality = 5;
                        //     //else
                        //     result.quality = result.score;
                        // }

                        // sort by quality
                        _merged.sort((a, b) => b.score - a.score)

                        for (let m = 0; m < _merged.length; m++) {
                            let result = _merged[m]
                            $log.debug(result.name + ': ' + result.quality + ' / ' + result.score)
                        }

                        // pick first
                        finalResults.push(_merged[0])
                    }

                    // sort final results by quality
                    // finalResults.sort(function(a,b) { return b.score - a.score });

                    data.geonames = data.geonames.slice(0, 6)

                    // finalResults = finalResults.slice(0,8)

                    $scope.geo.results = data.geonames
                    $scope.$apply()
                })
            }

            $scope.focusLocationSearchInput = () => {
                $('.location-search-input').focus(e => e.target.select())

                setTimeout(() => $('.location-search-input').focus(), 100)
            }

            $scope.goTo = result => {
                $scope.locationSelect({
                    location: {
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lng)
                    }
                })
            }
        }
    })
]

export default MapSearch
