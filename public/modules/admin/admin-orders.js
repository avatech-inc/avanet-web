angular.module('avatech.system').controller('OrdersController', ['$scope', '$location', '$http', 'Global', 'Users', function ($scope, $location, $http, Global, Users) {
    $scope.global = Global;

	// executes on 'page load'
	// $scope.init = function() {
	// 	$scope.getUsers();
	// }
    
 //    $scope.getUsers = function() {
 //        Users.query('', function(users) {
 //            $scope.users = users;
 //        });
	// }

    $http.get('/fizblix')
    .success(function(data){

        data = data.sort(function(a,b){
          return new Date(b.created) - new Date(a.created);
        });

        $scope.salesTotal = 0;
        $scope.salesCollected = 0;

        $scope.orders = data;

           var orders = {};

           var countries = {};

        $scope.totalDevices = 0;
        angular.forEach($scope.orders,function(order){
            $scope.totalDevices += order.order.quantity;



            $scope.salesTotal += order.order.subtotal;

            var orderCollected = order.order.subtotal;
            if (!order.order.payInFull) orderCollected = (order.order.quantity * 600)
            $scope.salesCollected += orderCollected;


            countries[order.order.billing_country] = 0;

            if (!orders[order.order.billing_country]) orders[order.order.billing_country] = 1;
            else orders[order.order.billing_country]++;

        });
        $scope.totalCountries = Object.keys(countries).length;
        console.log(orders);

        $scope.download = function() {
            var csv = "Date,Email,Name,Organization,Job Title,Profession,Deposit/Full,Unit Price,Quantity,Subtotal,Shipping,Tax,Total,";
            csv += "Billing Name,Billing Address,Billing Address 2,Billing City,Billing State/Province,Billing Postal,Billing Country,";
            csv += "Shipping Name,Shipping Address,Shipping Address 2,Shipping City,Shipping State/Province,Shipping Postal,Shipping Country,";

            angular.forEach($scope.orders,function(order){
                csv += "\n";

                csv += order.created + ",";

                csv += "\"" + order.order.pro_email + "\",";
                csv += "\"" + order.order.pro_name + "\",";
                csv += "\"" + order.order.pro_org + "\",";
                csv += "\"" + order.order.pro_jobTitle + "\",";
                csv += "\"" + order.order.pro_profession + "\",";

                csv += (order.order.payInFull ? "Full" : "Deposit") + ",";

                csv += "\"" + order.order.price + "\",";
                csv += "\"" + order.order.quantity + "\",";
                csv += "\"" + order.order.subtotal + "\",";
                csv += "\"" + order.order.shipping + "\",";
                csv += "\"" + order.order.tax + "\",";
                csv += "\"" + order.order.total + "\",";

                csv += "\"" + order.order.billing_name + "\",";
                csv += "\"" + order.order.billing_address + "\",";
                csv += "\"" + order.order.billing_address2 + "\",";
                csv += "\"" + order.order.billing_city + "\",";
                csv += "\"" + order.order.billing_state + "\",";
                csv += "\"" + order.order.billing_postal + "\",";
                csv += "\"" + order.order.billing_country + "\",";

                if (order.order.shippingSameAsBilling) {
                    csv += "\"" + order.order.billing_name + "\",";
                    csv += "\"" + order.order.billing_address + "\",";
                    csv += "\"" + order.order.billing_address2 + "\",";
                    csv += "\"" + order.order.billing_city + "\",";
                    csv += "\"" + order.order.billing_state + "\",";
                    csv += "\"" + order.order.billing_postal + "\",";
                    csv += "\"" + order.order.billing_country + "\",";
                }
                else {
                    csv += "\"" + order.order.shipping_name + "\",";
                    csv += "\"" + order.order.shipping_address + "\",";
                    csv += "\"" + order.order.shipping_address2 + "\",";
                    csv += "\"" + order.order.shipping_city + "\",";
                    csv += "\"" + order.order.shipping_state + "\",";
                    csv += "\"" + order.order.shipping_postal + "\",";
                    csv += "\"" + order.order.shipping_country + "\",";
                }

                //console.log(order);
            });
            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

            var link = document.createElement('a');
            angular.element(link)
                .attr('href', csvData)
                .attr('download', 'orders.csv');
            link.click();
        }
    });

}]);