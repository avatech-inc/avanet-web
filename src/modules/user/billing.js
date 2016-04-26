/* eslint-disable spaced-comment */
"use strict";
var _this = this;
/// <reference path='../../definitions/angular.d.ts' />
/// <reference path='../../definitions/lodash.d.ts' />
/// <reference path='../../js/types/billing.ts' />
var lodash_1 = require('lodash');
var billing_1 = require('../../js/stores/billing');
var actions = require('../../js/actions/billing');
var _ = { range: lodash_1.range };
/**
 * Returns a filtered array of items from `items` whose ids are not present in array
 * of ids `selected` except for the index `selectionIndex`. Useful for filtering
 * items over multiple dropdown menus, where the current selection should not
 * be filtered out.
 *
 * @param  {Array<Ided>}   items
 * @param  {Array<string>} selected
 * @param  {number}        selectionIndex
 * @return {Array<Ided>}
 */
exports.unselectedItems = function (items, selected, selectionIndex) {
    return items.filter(function (item) { return (item.id === selected[selectionIndex] || selected.indexOf(item.id) === -1); });
};
/**
 * Returns an array from an array of strings `items` which are not undefined.
 *
 * @param  {Array<string>} items
 * @return {Array<string>}
 */
exports.filterUndefinedItems = function (items) {
    return items.filter(function (item) { return typeof item !== 'undefined'; });
};
/**
 * Returns a formatted credit card number with only the last 4 digits displayed.
 *
 * @param  {string} brand
 * @param  {string} last4
 * @return {string}
 */
exports.formatLast4 = function (last4, brand) {
    if (brand === 'Visa' || brand === 'MasterCard' || brand === 'Discover' || brand === 'JCB') {
        return '\u2022\u2022\u2022\u2022 ' +
            '\u2022\u2022\u2022\u2022 ' +
            '\u2022\u2022\u2022\u2022 ' +
            last4;
    }
    else if (brand === 'American Express') {
        return '\u2022\u2022\u2022\u2022 ' +
            '\u2022\u2022\u2022\u2022\u2022\u2022 ' +
            '\u2022' +
            last4;
    }
    else if (brand === 'Diners Club') {
        return '\u2022\u2022\u2022\u2022 ' +
            '\u2022\u2022\u2022\u2022\u2022\u2022 ' +
            last4;
    }
    return '\u2022\u2022\u2022\u2022 ' +
        '\u2022\u2022\u2022\u2022 ' +
        '\u2022\u2022\u2022\u2022 ' +
        last4;
};
/**
 * Returns the Font-Awesome icon string for Stripe card brand strings.
 *
 * @param {strip} stripeBrand
 * @returns {string}
 */
exports.cardBrandIcon = function (stripeBrand) {
    switch (stripeBrand) {
        case 'Visa':
            return 'visa';
        case 'MasterCard':
            return 'mastercard';
        case 'American Express':
            return 'amex';
        case 'Discover':
            return 'discover';
        case 'Diners Club':
            return 'diners-club';
        case 'JCB':
            return 'jcb';
        default:
            return '';
    }
};
/**
 * Returns an input mask for Stripe card brand strings.
 *
 * @param {strip} stripeBrand
 * @returns {string}
 */
exports.cardBrandMask = function (stripeBrand) {
    switch (stripeBrand) {
        case 'Visa':
            return '8888 8888 8888 8888';
        case 'MasterCard':
            return '8888 8888 8888 8888';
        case 'American Express':
            return '8888 888888 88888';
        case 'Discover':
            return '8888 8888 8888 8888';
        case 'Diners Club':
            return '8888 888888 8888';
        case 'JCB':
            return '8888 8888 8888 8888';
        default:
            return '8888 8888 8888 8888';
    }
};
exports.Billing = [
    '$scope',
    '$http',
    '$stateParams',
    'Global',
    function ($scope, $http, $stateParams, global // todo: add some definitions/sanity to the globals
        ) {
        var authToken = $http.defaults.headers.common['Auth-Token'];
        var state = billing_1.billingStore.getState();
        var props = {
            seatArray: _.range(1, 50),
            months: _.range(1, 13),
            years: _.range(new Date().getFullYear(), new Date().getFullYear() + 50),
            orgs: global.user.organizations.map(function (org) { return ({ id: org._id, name: org.name }); })
        };
        // Display something besides $NaN/ to get the UI up and running.
        // Other $scope variables don't display directly, so they can load asynchronously.
        $scope.interval = 'year';
        $scope.total = 0;
        // Set uiMask options here, since the global config seems to be broken.
        // https://github.com/angular-ui/ui-mask#global-customization
        // says that maskDefinitions() can be called from the global config,
        // but uiMask.Config does not include that function:
        // https://github.com/angular-ui/ui-mask/blob/master/src/mask.js#L15
        $scope.ccOptions = {
            maskDefinitions: { '8': /[\d|\u2022]/ },
            clearOnBlur: false,
            unmaskEmpty: true,
            returnInvalid: true
        };
        var update = function () {
            state = billing_1.billingStore.getState();
            var billingType = state.get('type');
            var level = state.get('level');
            var seats = state.get('seats');
            var interval = state.get('interval');
            var success = state.get('success');
            var error = state.get('error');
            var processing = state.get('processing');
            var card = state.get('card');
            var seatUsers = state.get('seatUsers').toArray();
            var org = state.get('org');
            var orgUsers = [];
            if (billingType === 'org') {
                if (org !== null) {
                    orgUsers = org.get('users').toArray().map(function (user) { return ({
                        id: user.id,
                        fullName: user.fullName
                    }); });
                }
            }
            var planObj = state.get('plans')
                .find(function (plan) { return (plan.interval === interval &&
                plan.metadata.level === level); });
            var total = 0;
            if (planObj) {
                total = planObj.amountMonth * seats;
                if (interval === 'year') {
                    total = planObj.amountMonth * seats * 12;
                    $scope.savings = null;
                }
                else if (interval === 'month') {
                    var planYearObj = state.get('plans')
                        .find(function (plan) { return (plan.interval === 'year' &&
                        plan.metadata.level === level); });
                    $scope.savings = Math.round((1 - (planYearObj.amountMonth / planObj.amountMonth)) * 100);
                }
            }
            var brand = card.get('brand');
            if (card.get('last_4') !== null) {
                var last4 = card.get('last_4');
                if (last4 && last4.length === 4) {
                    last4 = exports.formatLast4(last4, brand);
                }
                $scope.name = card.get('name');
                $scope.cc = last4;
                $scope.exp_month = card.get('exp_month');
                $scope.exp_year = card.get('exp_year');
                $scope.cvc = card.get('cvc');
                billing_1.billingStore.dispatch(actions.clearCard());
            }
            $scope.plans = state.get('plans')
                .filter(function (plan) { return plan.interval === $scope.interval; })
                .filter(function (plan) { return (plan.metadata.level === 'pro' ||
                billingType !== 'org'); })
                .toArray();
            $scope.ccFormat = exports.cardBrandMask(brand);
            $scope.brandlogo = exports.cardBrandIcon(brand);
            $scope.billingType = billingType;
            $scope.level = level;
            $scope.seats = seats;
            $scope.interval = interval;
            $scope.total = total;
            $scope.error = error;
            $scope.success = success;
            $scope.processing = processing;
            if (billingType === 'org') {
                $scope.seatUsers = seatUsers;
                $scope.orgUsers = orgUsers;
            }
        };
        $scope.props = props;
        $scope.$evalAsync(update);
        billing_1.billingStore.subscribe(function () { return $scope.$evalAsync(update); });
        var stateType = 'user';
        if (typeof $stateParams.orgId !== 'undefined') {
            stateType = 'org';
        }
        billing_1.billingStore.dispatch(actions.setBillingType(stateType));
        billing_1.billingStore.dispatch(actions.fetchPlans(authToken));
        if (stateType === 'org') {
            billing_1.billingStore.dispatch(actions.fetchOrg($stateParams.orgId, authToken));
        }
        else if (stateType === 'user') {
            billing_1.billingStore.dispatch(actions.fetchUser(authToken));
        }
        $scope.getUnselectedUsers = function (index) { return exports.unselectedItems($scope.orgUsers, $scope.seatUsers, index); };
        $scope.changeLevel = function (level) { return billing_1.billingStore.dispatch(actions.setLevel(level)); };
        $scope.changeOrg = function (org) { return billing_1.billingStore.dispatch(actions.fetchOrg(org.id, authToken)); };
        $scope.changeSeats = function (seats) { return billing_1.billingStore.dispatch(actions.setSeats(seats)); };
        $scope.changeInterval = function (interval) { return billing_1.billingStore.dispatch(actions.setSubInterval(interval)); };
        $scope.setSeatUser = function (index, id) { return billing_1.billingStore.dispatch(actions.setSeatUser(index, id)); };
        $scope.deleteSeatUser = function (index) { return billing_1.billingStore.dispatch(actions.deleteSeatUser(index)); };
        $scope.changePayment = function (value, field) {
            // Determine card type
            if (field === 'cc') {
                var cc = value || '';
                if (cc.indexOf('\u2022') === -1) {
                    billing_1.billingStore.dispatch(actions.setCardBrand(Stripe.card.cardType(cc)));
                }
            }
            // Clear payment information when changing for the first time
            if (!state.get('changed')) {
                var emptyCard = [
                    field === 'name' ? value : '',
                    field === 'cc' ? value : '',
                    field === 'exp_month' ? value : 0,
                    field === 'exp_year' ? value : 0,
                    field === 'cvc' ? value : '',
                    ''
                ];
                billing_1.billingStore.dispatch(actions.receiveCard.apply(_this, emptyCard));
            }
            billing_1.billingStore.dispatch(actions.clearPaymentError());
            billing_1.billingStore.dispatch(actions.paymentFormChanged(true));
        };
        $scope.saveBilling = function (name, cc, cvc, expMonth, expYear) {
            var billingType = state.get('type');
            var planObj = state.get('plans')
                .find(function (plan) { return (plan.interval === state.get('interval') &&
                plan.metadata.level === state.get('level')); });
            if (state.get('processing'))
                return;
            billing_1.billingStore.dispatch(actions.setProcessing(true));
            billing_1.billingStore.dispatch(actions.clearPaymentError());
            // Resolve the Stripe token to null unless the payment form has changed.
            var tokenPromise = Promise.resolve(null);
            if (state.get('changed')) {
                tokenPromise = actions.createToken(name, cc, cvc, parseInt(expMonth, 10), parseInt(expYear, 10));
            }
            if (billingType === 'org') {
                var orgId_1 = state.get('org').get('id');
                var seats_1 = state.get('seats');
                var paidMembers_1 = exports.filterUndefinedItems(state.get('seatUsers').toArray()); // eslint-disable-line max-len
                Promise.all([
                    tokenPromise,
                    actions.fetchOrgPayment(orgId_1, authToken)
                ]).then(function (values) {
                    return billing_1.billingStore.dispatch(actions.submitOrgPayment(orgId_1, values[0], values[1], planObj.id, seats_1, paidMembers_1.length, paidMembers_1, authToken));
                }).catch(function (error) { return billing_1.billingStore.dispatch(actions.handleError(error)); });
            }
            else if (billingType === 'user') {
                Promise.all([
                    tokenPromise,
                    actions.fetchUserPayment(authToken)
                ]).then(function (values) {
                    return billing_1.billingStore.dispatch(actions.submitUserPayment(values[0], values[1], planObj.id, authToken));
                }).catch(function (error) { return billing_1.billingStore.dispatch(actions.handleError(error)); });
            }
        };
    }
];
