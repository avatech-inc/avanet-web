
angular.module('avatech').controller('OrganizationsController', ['$scope', '$q', '$stateParams', '$location', '$modal', '$timeout', 'Global', 'Restangular',
function ($scope, $q, $stateParams, $location, $modal, $timeout, Global, Restangular) { 
    $scope.global = Global;

    $scope.newOrg = {};

    $scope.userIsAdmin = function() {
        var isAdmin = false;

        // if user is AvaNet admin, also can admin group
        if ($scope.global.user.admin) return true;

        angular.forEach($scope.members, function(member) {
            if (member.admin && member.user._id == $scope.global.user._id) {
                isAdmin = true; return;
            }
        });
        return isAdmin;
    }
    $scope.userIsMember = function() {
        var isMember = false;

        angular.forEach($scope.members, function(member) {
            if (member.user._id == $scope.global.user._id) {
                isMember = true; return;
            }
        });
        return isMember;
    }

    $scope.create = function() {
        console.log($scope.newOrgForm.$valid);
        if (!$scope.newOrgForm.$valid) return;
        console.log($scope.newOrgForm);

        Restangular.all('orgs').post($scope.newOrg).then(function(newOrg) {
            $location.path('orgs/' + newOrg._id);
            if (!Global.orgs.length) Global.orgs = [];
            Global.orgs.push({ name: newOrg.name, _id: newOrg._id });
        }, 
        // error
        function(response) {
            alert(response.data.message);
        });
    }
    $scope.members = [];
    $scope.students = [];

    $scope.loadOrg = function() { 
        var RestObject = Restangular.one('orgs', $stateParams.orgId);
        RestObject.get().then(function (org) {
            $scope.org = org;

            //org.name += " Test";
            //org.save();
        });

        RestObject.getList('members').then(function (members) {
            $scope.members = [];
            $scope.students = [];
            angular.forEach(members, function(member) {
                if (member.student) $scope.students.push(member);
                else $scope.members.push(member);
            });
        });
    };

    $scope.setMemberAdmin = function(member, admin) {
        //var RestObject = Restangular.one('orgs', $stateParams.orgId).one('members');
        member.admin = admin;
        member.save();
    }
    $scope.removeMember = function(member, index) {
        member.remove();
        $scope.members.splice(index, 1);
    }
    $scope.removeStudent = function(member, index) {
        member.remove();
        $scope.students.splice(index, 1);
    }
    $scope.addMember = function(user) {
        if (user.isMember) return;

        Restangular.one('orgs', $stateParams.orgId)
        .all('members')
        .post({ user: user._id })
        // success
        .then(function (member) {
            // add new member to  collection
            $scope.members.push(member);
        }
        // error
        , function(){
            console.log(member);
        });
    }
    $scope.inviteEmail = function() {
        if (!$scope.search.email) return;

        Restangular.one('orgs', $stateParams.orgId)
        .all('members')
        .post({ email: $scope.search.email })
        // success
        .then(function (member) {
            // add new member to  collection
            $scope.members.push(member);
        }
        // error
        , function(){
            console.log(member);
        });
    }

    $scope.allowMemberRemove = function(member) {
        if (member.admin && member.user._id == $scope.global.user._id) return false;
        else return true;
    }
    $scope.isOnlyAdmin = function(member) {
        var adminCount = 0;
        angular.forEach($scope.members,function(m){ if (m.admin) adminCount++; });
        return (adminCount == 1 && member.admin);
    }

    // user search

    $scope.newSearch = function() {
        $scope.search = { query: "" };
        //$scope.focus('focusSearch');
    }
    $scope.doSearch = function() {
        $timeout.cancel($scope.search.timer);
        $scope.abortSearch = false;
        if ($scope.search.query == "" || $scope.search.query.length < 3) {
            $scope.search.results = null;
            $scope.abortSearch = true;
            return;
        }
        $scope.search.timer = $timeout(function(){
            $scope.search.searching = true;

            Restangular.all("users").getList({ query: $scope.search.query }).then(function(users) {
                $scope.search.searching = false;

                if (users.length == 0) {
                    if ($scope.search.query.indexOf('@') > -1 && validateEmail($scope.search.query)) $scope.search.email =  $scope.search.query;
                    else $scope.search.email = null;
                }

                // detect if already members
                for (var r = 0; r < users.length; r++) {
                    var user = users[r];
                    for (var i = 0; i < $scope.members.length; i ++) {
                        if ($scope.members[i].user._id == user._id) {
                            user.isMember = true;
                            break;
                        }
                    }
                    if (user.isMember == null) user.isMember = false;
                }

                if (!$scope.abortSearch) $scope.search.results = users;
            });            

        },400);
    }
    function validateEmail(email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 

    $scope.onLogoUpload = function(file) {
        $scope.org.logoUrl = file.url;
        $scope.org.save();
        $scope.refreshOrg();
    }
    $scope.removeLogo = function(file) {
        $scope.org.logoUrl = null;
        $scope.org.save();
        $scope.refreshOrg();
    }

    $scope.refreshOrg = function() {
        for(var i = 0; i < $scope.global.orgs.length; i++) {
            if ($scope.global.orgs[i]._id == $scope.org._id) $scope.global.orgs[i] = $scope.org;
        }
    }

}]);
