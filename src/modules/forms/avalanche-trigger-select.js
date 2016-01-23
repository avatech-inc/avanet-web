angular.module('avatech').directive('avalancheTriggerSelect',
    ['$http', '$timeout, $log',
    function($http, $timeout, $log) {
  return {
    restrict: 'E',
    scope: { 
      triggers: '=ngModel',
      trigger: '=trigger'
    },
    template: '<div class="btn-group userSelect" uib-dropdown ng-show="trigger == \'N\'">' +
'       <button  type="button" uib-dropdown-toggle class="btn btn-default">' +
'         <i class="fa fa-plus"></i> Add Secondary Natural Trigger' +
'       </button>' +
'       <ul class="dropdown-menu" ng-click="$event.stopPropagation()" role="menu" style="width:300px;min-height:100px;"><li><a style="white-space:normal !important;background:transparent !important;padding:0 !important;">' +
'         <ul class="results">' +
'         	<li ng-repeat="type in naturalTriggers" ng-click="addTrigger(type)" ng-class="{ isMember: hasTrigger(type) }" close-dropdown-on-click>' +
'         		{{ type.name }}<span class="arrow"><i class="fa fa-plus"></i></span>' +
'     		</li>' +
'         </ul>' +
'         </a></li></ul>' +
'</div>' +
'<div class="btn-group userSelect" uib-dropdown ng-show="trigger == \'A\'">' +
'      <button  type="button" uib-dropdown-toggle class="btn btn-default">' +
'        <i class="fa fa-plus"></i> Add Secondary Artificial Trigger' +
'      </button>' +
'      <ul class="dropdown-menu" ng-click="$event.stopPropagation()" role="menu" style="width:300px;min-height:100px;"><li><a style="white-space:normal !important;background:transparent !important;padding:0 !important;">' +
'        <div ng-repeat="cat in [\'Explosive\',\'Vehicle\',\'Human\',\'Miscellaneous\']">' +
'	        <div class="subheader" ng-class="{ \'first\': $index == 0 }">{{ cat }}</div>' +
'	        <ul class="results">' +
'	        	<li ng-repeat="type in artificialTriggers[cat]" ng-click="addTrigger(type)" ng-class="{ isMember: hasTrigger(type) }" close-dropdown-on-click>' +
'	        		{{ type.name }}' +
'	        		<span class="arrow"><i class="fa fa-plus"></i></span>' +
'        		</li>' +
'	        </ul>' +
'        </div>' +
'        </a></li></ul>' +
'	</div>' +
'<ul style="margin-bottom:0px;margin-top:8px;padding-left:22px;" ng-show="triggers && triggers.length">' +
'	<li ng-repeat="trigger in triggers">{{ getTriggerName(trigger) }} <span ng-click="removeTrigger(trigger)" style="margin-left:6px;"><i class="fa fa-times"></i></span></li>' +
'</ul>'
	,link: function(scope, element) {


    scope.addTrigger = function(trigger) {
    	console.log("add trigger");
    	console.log(trigger);
        if (!scope.triggers) scope.triggers = [];
        if (!scope.hasTrigger(trigger)) {
        	console.log("pushing!");
        	scope.triggers.push(trigger.code);
        }
    }
    scope.removeTrigger = function(trigger) {
    	if (!scope.triggers) return false;
        angular.forEach(scope.triggers, function(triggerCode, index) {
            if (triggerCode == trigger) {
            	console.log("found!");
            	scope.triggers.splice(index, 1);
            	return;
            }
        });
    }

    scope.hasTrigger = function(trigger) {
        if (!scope.triggers) return false;
        var hasTrigger = false;
        angular.forEach(scope.triggers, function(triggerCode){
            if (triggerCode == trigger.code) hasTrigger = true;
        })
        return hasTrigger;
    }

    scope.getTriggerName = function(triggerCode) {
        var name = "";
        angular.forEach(scope.artificialTriggers,function(triggers, triggerCategory){
            angular.forEach(triggers, function(trigger){
                if (trigger.code == triggerCode) return name = triggerCategory + ": " + trigger.name;
            });
        });
        angular.forEach(scope.naturalTriggers,function(trigger){
            if (trigger.code == triggerCode) return name = trigger.name;
        });
        return name;
    }

    scope.artificialTriggers = {
        "Explosive": [
            { code: "AA", name: "Artillery" },
            { code: "AE", name: "Explosive thrown or placed on or under snow surface by hand" },
            { code: "AL", name: "Avalauncher" },
            { code: "AB", name: "Explosive detonated above snow surface (air blast)" },
            { code: "AC", name: "Cornice fall triggered by human or explosive action" },
            { code: "AX", name: "Gas exploder" },
            { code: "AH", name: "Explosives placed via helicopter" },
            { code: "AP", name: "Pre-placed, remotely detonated explosive charge" }
        ],
        "Vehicle": [
            { code: "AM", name: "Snowmobile" },
            { code: "AK", name: "Snowcat" },
            { code: "AV", name: "Other Vehicle" } //specify
        ],
        "Human": [
            { code: "AS", name: "Skier" },
            { code: "AR", name: "Snowboarder" },
            { code: "AI", name: "Snowshoer" },
            { code: "AF", name: "Foot penetration" },
            //{ code: "AC", name: "Cornice fall produced by human or explosive action" }
        ],
        "Miscellaneous": [
            { code: "AW", name: "Wildlife" },
            { code: "AU", name: "Unknown artificial trigger" },
            { code: "AO", name: "Unclassified artificial trigger" } //specify
        ]
    };
    scope.naturalTriggers = [
        { code: "N", name: "Natural trigger" },
        { code: "NC", name: "Cornice fall" },
        { code: "NE", name: "Earthquake" },
        { code: "NI", name: "Ice fall" },
        { code: "NL", name: "Avalanche triggered by loose snow avalanche" },
        { code: "NS", name: "Avalanche triggered by slab avalanche" },
        { code: "NR", name: "Rock fall" },
        { code: "NO", name: "Unclassified natural trigger" } // specify
    ];
}
}
}]);
