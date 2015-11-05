angular.module('avatech.system').controller('AdminOrgsController', function ($scope, $location, $http, Global, Restangular) {
    $scope.global = Global;

    // executes on 'page load'
    $scope.init = function() {
        $scope.getOrgs();
    }

    // var countries = {};
    
    // $scope.totalUsers = 0;
    // $scope.totalUsersToday = 0;
    // $scope.totalUsersThisWeek = 0;
    // $scope.totalUsersThisMonth = 0;
    // $scope.totalCountries = 0;
    // $scope.totalOrgs = 0;

    // var countries = {};
    // var orgs = {};

//     var allOrgs = [];

//     var yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);

//     var week = new Date();
//     week.setDate(week.getDate() - 7);

//     var month = new Date();
//     month.setDate(month.getDate() - 30);

//     var europe = [
// "Albania",
// "Andorra",
// "Armenia",
// "Austria",
// "Azerbaijan",
// "Belarus",
// "Belgium",
// "Bosnia & Herzegovina",
// "Bulgaria",
// "Croatia",
// "Cyprus",
// "Czech Republic",
// "Denmark",
// "Estonia",
// "Finland",
// "France",
// "Georgia",
// "Germany",
// "Greece",
// "Hungary",
// "Iceland",
// "Ireland",
// "Italy",
// "Kosovo",
// "Latvia",
// "Liechtenstein",
// "Lithuania",
// "Luxembourg",
// "Macedonia",
// "Malta",
// "Moldova",
// "Monaco",
// "Montenegro",
// "The Netherlands",
// "Norway",
// "Poland",
// "Portugal",
// "Romania",
// "Russia",
// "San Marino",
// "Serbia",
// "Slovakia",
// "Slovenia",
// "Spain",
// "Sweden",
// "Switzerland",
// "Turkey",
// "Ukraine",
// "United Kingdom"];

    $scope.getOrgs = function() {

        Restangular.all('orgs').getList()
        .then(function(orgs) {
            $scope.orgs = orgs;

          

            // var emails = {};

            // //$scope.totalUsers = users.length;
            // for (var i = 0; i < users.length; i++) {

            //     // if (!users[i].admin && !users[i].test) {
            //     //     if (!countries[users[i].country]) countries[users[i].country] = 1;
            //     //     else countries[users[i].country]++;
            //     // }

            //     if (!users[i].admin && !users[i].test) {
            //         $scope.totalUsers++;

            //         if (new Date(users[i].created) > yesterday) $scope.totalUsersToday++;

            //         if (new Date(users[i].created) > week) $scope.totalUsersThisWeek++;

            //         if (new Date(users[i].created) > month) $scope.totalUsersThisMonth++;

            //         countries[users[i].country] = 0;

            //         if (users[i].org && users[i].org != "" && users[i].org.toLowerCase() != "n/a" && users[i].org.toLowerCase() != "test"  && users[i].org != "/" && users[i].org.toLowerCase() != "avatech") {
            //             if (!orgs[users[i].org]) orgs[users[i].org] = users[i].org +"|" + users[i].city + "|" + users[i].country + "|";
            //             //else orgs[users[i].org]++;
            //         }

            //         emails[users[i].email] = 0;

            //         if (users[i].country && europe.indexOf(users[i].country) > -1)
            //             allOrgs.push({ 
            //                 name: users[i].fullName,
            //                 organization: users[i].org,
            //                 email: users[i].email,
            //                 city: users[i].city,
            //                 country: users[i].country,
            //                 device: false
            //             });
            //     }
            // }
            
            

            // $scope.totalCountries = Object.keys(countries).length;
            // $scope.totalOrgs = Object.keys(orgs).length;
            // console.log(countries);
            // console.log(Object.keys(countries).length)
        });
    }

    // $scope.toggleDisabled = function(user) {
    //     user.disabled = !user.disabled;
    //     user.$update(function(data) {
    //         console.log(data);
    //     });
    // }

    // $scope.toggleTest = function(user) {
    //     user.test = !user.test;
    //     user.$update(function(data) {
    //         console.log(data);
    //     });
    // }

});