
// bootstrap form validation
angular.module('avatech').directive('validate', function() {
  return {
    restrict: 'A',
    compile: function(elem, attr) {
      var formName = attr.name;

      // turn off html5 validation
      elem[0].setAttribute("novalidate","");

      // ng-submit
      var submitVariableName = "__submit_" + formName;

      // get 'form-group' divs
      var formGroups = elem[0].querySelectorAll('.form-group');

      var inputs = [];
      angular.forEach(formGroups, function(formGroup) {
        formGroup = angular.element(formGroup);
        var input = formGroup[0].querySelector('.form-control');

        if (input) {

          //var newName = input.attributes['ng-model'];
          var newName = formGroup[0].getAttribute('name');

          // if ngModel exists
          if (newName) {
            // replace '.' with '-'
            //var newName = newName.replace(/\./g, '_');

            // keep track of input blur
            var blurVariableName = "__blur_" + formName + "_" + newName;
            input.setAttribute("ng-blur", blurVariableName + " = true");

            // set input name/id
            input.setAttribute("name", newName);
            input.setAttribute("id", newName);
            
            // set 'for' on label
            var label = formGroup[0].querySelector('label');
            if (label) label.setAttribute("for", newName);

            // form group css ('has-error')
            var errorClassVariableName = "__error_" + formName + "_" + newName;
            formGroup[0].setAttribute("ng-class", "{ 'has-error': (" + submitVariableName + " || " + blurVariableName + ") && " + errorClassVariableName + " }");

            // error message
            var errorMessage = formGroup[0].querySelector(".error-message");
            if (errorMessage) {
              errorMessage.setAttribute("ng-show","(" + submitVariableName + " || " + blurVariableName + ")");
              errorMessage.innerHTML = "{{ __message_" + formName + "_" + newName + " }}";
            }

            inputs.push(newName);
          }
        }
      });

      // link function
      return function postLink(scope, elem, attrs, controller) { 
          elem.bind('submit', function(e) {
            e.preventDefault();
            scope[submitVariableName] = true;
            scope.$apply();
          });

          angular.forEach(inputs, function(newName) {
            scope.$watch(function(){ if (scope[formName][newName]) return scope[formName][newName].$error; else return null; }, function(errors){
              if (!errors) return;
              
              // field is valid
              if (scope[formName][newName].$valid) {
                scope["__error_" + formName + "_" + newName] = false;
                scope["__message_" + formName + "_" + newName] = "";
              }
              // field is invalid
              else {
                scope["__error_" + formName + "_" + newName] = true;
                angular.forEach(errors,function(isValid, field){
                  var message = "";
                  if (field == "required") message = "Required";
                  else if (field == "email") message = "Enter a valid email address";
                  else message = field;
                  if (isValid) scope["__message_" + formName + "_" + newName] = message;
                });
              }

            }, true);
          });
      };
    }
  };
});