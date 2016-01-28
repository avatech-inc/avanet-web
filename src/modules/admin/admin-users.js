
angular.module('avatech').controller('AdminUsersController', [
    '$scope',
    '$log',
    '$http',
    'Global',
    'Restangular',

    (
        $scope,
        $log,
        $http,
        Global,
        Restangular
    ) => {
        let countries = {}
        let orgs = {}
        let allOrgs = []
        let yesterday = new Date()
        let week = new Date()
        let month = new Date()
        let europe = [
            'Albania',
            'Andorra',
            'Armenia',
            'Austria',
            'Azerbaijan',
            'Belarus',
            'Belgium',
            'Bosnia & Herzegovina',
            'Bulgaria',
            'Croatia',
            'Cyprus',
            'Czech Republic',
            'Denmark',
            'Estonia',
            'Finland',
            'France',
            'Georgia',
            'Germany',
            'Greece',
            'Hungary',
            'Iceland',
            'Ireland',
            'Italy',
            'Kosovo',
            'Latvia',
            'Liechtenstein',
            'Lithuania',
            'Luxembourg',
            'Macedonia',
            'Malta',
            'Moldova',
            'Monaco',
            'Montenegro',
            'The Netherlands',
            'Norway',
            'Poland',
            'Portugal',
            'Romania',
            'Russia',
            'San Marino',
            'Serbia',
            'Slovakia',
            'Slovenia',
            'Spain',
            'Sweden',
            'Switzerland',
            'Turkey',
            'Ukraine',
            'United Kingdom'
        ]

        $scope.global = Global

        // executes on 'page load'
        $scope.init = () => $scope.getUsers()

        $scope.totalUsers = 0
        $scope.totalUsersToday = 0
        $scope.totalUsersThisWeek = 0
        $scope.totalUsersThisMonth = 0
        $scope.totalCountries = 0
        // $scope.totalOrgs = 0;

        yesterday.setDate(yesterday.getDate() - 1)
        week.setDate(week.getDate() - 7)
        month.setDate(month.getDate() - 30)

        $scope.getUsers = () => {
            Restangular
                .all('users')
                .getList()
                .then(users => {
                    let emails = {}
                    let _orgs = {}

                    $scope.users = users

                    for (let user of users) {
                        if (!user.admin &&
                            !user.test &&
                            user.org &&
                            user.org.length > 2 &&
                            user.org.toLowerCase() !== 'n/a' &&
                            user.org.toLowerCase() !== 'test' &&
                            user.org !== '/' &&
                            user.org.toLowerCase() !== 'avatech' &&
                            user.org !== 'ski patrol' &&
                            user.org !== 'pc' &&
                            user.org !== 'none' &&
                            user.org !== 'public') {
                            let normalized = user
                                .org
                                .toLowerCase()
                                .trim()
                                .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, '')

                            _orgs[normalized] = null
                        }

                        // if (!users[i].admin && !users[i].test) {
                        //     if (!countries[users[i].country]) countries[users[i].country] = 1;
                        //     else countries[users[i].country]++;
                        // }

                        if (!user.admin &&
                            !user.test) {
                            $scope.totalUsers++

                            if (new Date(user.created) > yesterday) $scope.totalUsersToday++
                            if (new Date(user.created) > week) $scope.totalUsersThisWeek++
                            if (new Date(user.created) > month) $scope.totalUsersThisMonth++

                            countries[user.country] = 0;

                            if (user.org &&
                                user.org !== '' &&
                                user.org.toLowerCase() !== 'n/a' &&
                                user.org.toLowerCase() !== 'test' &&
                                user.org !== '/' &&
                                user.org.toLowerCase() !== 'avatech') {
                                if (!orgs[user.org]) {
                                    orgs[user.org] = user.org + '|' +
                                                     user.city + '|' +
                                                     user.country + '|'
                                }
                                // else orgs[users[i].org]++;
                            }

                            emails[user.email] = 0

                            if (user.country &&
                                europe.indexOf(user.country) > -1) {
                                allOrgs.push({
                                    name: user.fullName,
                                    organization: user.org,
                                    email: user.email,
                                    city: user.city,
                                    country: user.country,
                                    device: false
                                })
                            }
                        }
                    }

                    $scope.totalOrgs = Object.keys(_orgs).length
                })
        }

        $scope.toggleDisabled = user => {
            user.disabled = !user.disabled
            user.$update(data => $log.debug(data))
        }

        $scope.toggleTest = user => {
            user.test = !user.test;
            user.$update(data => $log.debug(data))
        }

        $scope.getStats = user => {
        // $http.get('/v1/users/' + user._id + '/stats').success(function(data){
        //     console.log(data);
        // });
        }
    }
])
