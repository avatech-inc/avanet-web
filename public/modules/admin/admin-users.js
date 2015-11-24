angular.module('avatech').controller('AdminUsersController', function ($scope, $location, $http, Global, Restangular) {
    $scope.global = Global;

    // executes on 'page load'
    $scope.init = function() {
        $scope.getUsers();
    }

    var countries = {};
    
    $scope.totalUsers = 0;
    $scope.totalUsersToday = 0;
    $scope.totalUsersThisWeek = 0;
    $scope.totalUsersThisMonth = 0;
    $scope.totalCountries = 0;
    //$scope.totalOrgs = 0;

    var countries = {};
    var orgs = {};

    var allOrgs = [];

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    var week = new Date();
    week.setDate(week.getDate() - 7);

    var month = new Date();
    month.setDate(month.getDate() - 30);

    var europe = [
"Albania",
"Andorra",
"Armenia",
"Austria",
"Azerbaijan",
"Belarus",
"Belgium",
"Bosnia & Herzegovina",
"Bulgaria",
"Croatia",
"Cyprus",
"Czech Republic",
"Denmark",
"Estonia",
"Finland",
"France",
"Georgia",
"Germany",
"Greece",
"Hungary",
"Iceland",
"Ireland",
"Italy",
"Kosovo",
"Latvia",
"Liechtenstein",
"Lithuania",
"Luxembourg",
"Macedonia",
"Malta",
"Moldova",
"Monaco",
"Montenegro",
"The Netherlands",
"Norway",
"Poland",
"Portugal",
"Romania",
"Russia",
"San Marino",
"Serbia",
"Slovakia",
"Slovenia",
"Spain",
"Sweden",
"Switzerland",
"Turkey",
"Ukraine",
"United Kingdom"];

    $scope.getUsers = function() {
        Restangular.all('users').getList()
        .then(function(users) {
            $scope.users = users;

            var emails = {};

          var _orgs = {};

            //$scope.totalUsers = users.length;
            for (var i = 0; i < users.length; i++) {

                if (!users[i].admin && !users[i].test && users[i].org && users[i].org.length > 2 && users[i].org.toLowerCase() != "n/a" && users[i].org.toLowerCase() != "test"  && users[i].org != "/" && users[i].org.toLowerCase() != "avatech" && users[i].org != "ski patrol" && users[i].org != "pc" && users[i].org != "none" && users[i].org != "public" ) {
                    var normalized = users[i].org.toLowerCase().trim().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    _orgs[normalized] = null;
                }


                // if (!users[i].admin && !users[i].test) {
                //     if (!countries[users[i].country]) countries[users[i].country] = 1;
                //     else countries[users[i].country]++;
                // }

                if (!users[i].admin && !users[i].test) {
                    $scope.totalUsers++;

                    if (new Date(users[i].created) > yesterday) $scope.totalUsersToday++;

                    if (new Date(users[i].created) > week) $scope.totalUsersThisWeek++;

                    if (new Date(users[i].created) > month) $scope.totalUsersThisMonth++;

                    countries[users[i].country] = 0;

                    if (users[i].org && users[i].org != "" && users[i].org.toLowerCase() != "n/a" && users[i].org.toLowerCase() != "test"  && users[i].org != "/" && users[i].org.toLowerCase() != "avatech") {
                        if (!orgs[users[i].org]) orgs[users[i].org] = users[i].org +"|" + users[i].city + "|" + users[i].country + "|";
                        //else orgs[users[i].org]++;
                    }

                    emails[users[i].email] = 0;

                    //console.log(users[i].fullName + "," + users[i].created + "," + users[i].country + "," + users[i].org)
                    //console.log(users[i].created + "}" + users[i].city + "," + users[i].country + "}" + users[i].org);

                    if (users[i].country && europe.indexOf(users[i].country) > -1)
                        allOrgs.push({ 
                            name: users[i].fullName,
                            organization: users[i].org,
                            email: users[i].email,
                            city: users[i].city,
                            country: users[i].country,
                            device: false
                        });
                }
            }


            $scope.totalOrgs = Object.keys(_orgs).length;
            
            // $http.get('/fizblix')
            // .success(function(data){

            //     angular.forEach(data,function(order){
            //         // var orgName = order.order.pro_org;
            //         // if (orgName && orgName != "" && orgName != "N/A"  && orgName != "n/a"  && orgName != "/") {
            //         //     if (!orgs[orgName]) orgs[orgName] = orgName +"|" + order.order.billing_city + "|" + order.order.billing_country + "|";
            //         //     //else orgs[users[i].org]++;
            //         // }
            //         countries[order.order.billing_country] = 0;

            //         emails[order.email] = 0;

            //         console.log(order.order.billing_country);

            //         if (order.order.billing_country && europe.indexOf(order.order.billing_country) > -1)
            //             allOrgs.push({ 
            //                 name: order.order.pro_name,
            //                 organization: order.order.pro_org,
            //                 email: order.email,
            //                 city: order.order.billing_city,
            //                 country: order.order.billing_country,
            //                 device: true
            //             });



            //     });

            //     console.log(allOrgs);

            //     for (var j = 0; j < allOrgs.length; j++) {
            //         console.log(allOrgs[j].name + "{" + allOrgs[j].organization + "{" + allOrgs[j].email + "{" + allOrgs[j].city + "{" + allOrgs[j].country + "{" + allOrgs[j].device);
            //     }


            //     // angular.forEach(orgs,function(org) {
            //     //     console.log(org);
            //     // });
            //     // console.log(Object.keys(orgs).length);

            //     // angular.forEach(emails,function(index,email) {
            //     //     console.log(email);
            //     // });

            //     console.log(Object.keys(emails).length)
            // });


            //console.log(orgs);

            // $scope.totalCountries = Object.keys(countries).length;
            //$scope.totalOrgs = Object.keys(orgs).length;
            // console.log(countries);
            // console.log(Object.keys(countries).length)
        });
    }

    $scope.toggleDisabled = function(user) {
        user.disabled = !user.disabled;
        user.$update(function(data) {
            console.log(data);
        });
    }

    $scope.toggleTest = function(user) {
        user.test = !user.test;
        user.$update(function(data) {
            console.log(data);
        });
    }

    $scope.getStats = function(user) {
        // $http.get('/v1/users/' + user._id + '/stats').success(function(data){
        //     console.log(data);
        // });
    }

});