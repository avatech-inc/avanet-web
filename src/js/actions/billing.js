/* global Billing, Redux */
/* eslint-disable spaced-comment */
"use strict";
/// <reference path='../../definitions/lodash.d.ts' />
/// <reference path='../../definitions/stripe.d.ts' />
/// <reference path='../../definitions/redux.d.ts' />
/// <reference path='../../definitions/whatwg-fetch.d.ts' />
/// <reference path='../types/common.ts' />
/// <reference path='../types/billing.ts' />
var lodash_1 = require('lodash');
var _ = { capitalize: lodash_1.capitalize };
/**
 * @module  actions/billing
 */
exports.SET_BILLING_TYPE = 'billing/SET_BILLING_TYPE';
exports.SET_PLANS = 'billing/SET_PLANS';
exports.SET_LEVEL = 'billing/SET_LEVEL';
exports.SET_ORIG_LEVEL = 'billing/SET_ORIG_LEVEL';
exports.SET_SEATS = 'billing/SET_SEATS';
exports.SET_SUB_INTERVAL = 'billing/SET_SUB_INTERVAL';
exports.SET_ORIG_SUB_INTERVAL = 'billing/SET_ORIG_SUB_INTERVAL';
exports.SET_COUPON = 'billing/SET_COUPON';
exports.SET_COUPON_MESSAGE = 'billing/SET_COUPON_MESSAGE';
exports.SET_COUPON_AMOUNT_OFF = 'billing/SET_COUPON_AMOUNT_OFF';
exports.SET_COUPON_PERCENT_OFF = 'billing/SET_COUPON_PERCENT_OFF';
exports.SET_COUPON_INTERVAL = 'billing/SET_COUPON_INTERVAL';
exports.SET_SEAT_USER = 'billing/SET_SEAT_USER';
exports.DELETE_SEAT_USER = 'billing/DELETE_SEAT_USER';
exports.SET_PAYMENT_SUCCESS = 'billing/SET_PAYMENT_SUCCESS';
exports.CLEAR_PAYMENT_SUCCESS = 'billing/CLEAR_PAYMENT_SUCCESS';
exports.SET_PAYMENT_ERROR = 'billing/SET_PAYMENT_ERROR';
exports.CLEAR_PAYMENT_ERROR = 'billing/CLEAR_PAYMENT_ERROR';
exports.SET_PROCESSING = 'billing/SET_PROCESSING';
exports.CLEAR_CVC = 'billing/CLEAR_CVC';
exports.RECEIVE_CARD = 'billing/RECEIVE_CARD';
exports.CLEAR_CARD = 'billing/CLEAR_CARD';
exports.SET_CARD_BRAND = 'billing/SET_CARD_BRAND';
exports.PAYMENT_FORM_CHANGED = 'billing/PAYMENT_FORM_CHANGED';
exports.RECEIVE_ORG = 'users/RECEIVE_ORG';
exports.RECEIVE_ORG_USERS = 'users/RECEIVE_ORG_USERS';
exports.RESET = 'tests/RESET';
/**
 * Set the billing type to <code>'user'</code> or <code>'org'</code>, changes
 * available fields.
 *
 * @param  {String} billingType - <code>'user'</code> or <code>'org'</code>.
 */
exports.setBillingType = function (billingType) { return ({
    type: exports.SET_BILLING_TYPE,
    billingType: billingType
}); };
/**
 * Set the available plans.
 *
 * @param  {Billing.Plan[]} plans - Array of Plans to make available.
 */
exports.setPlans = function (plans) { return ({
    type: exports.SET_PLANS,
    plans: plans
}); };
/**
 * Set processing state. Prevents credit card information from being submitted twice.
 *
 * @param  {Boolean} processing - Whether credit card information is processing.
 */
exports.setProcessing = function (processing) { return ({
    type: exports.SET_PROCESSING,
    processing: processing
}); };
/**
 * Set the plan level. Updates the available plans and current selection.
 *
 * @param  {String} level - <code>'tour'</code> or <code>'pro'</code>.
 */
exports.setLevel = function (level) { return ({
    type: exports.SET_LEVEL,
    level: level
}); };
/**
 * Set original plan level. Used for determining upgrade/downgrade/cancel logic.
 *
 * @param  {String} level - <code>'tour'</code> or <code>'pro'</code>.
 */
exports.setOrigLevel = function (level) { return ({
    type: exports.SET_ORIG_LEVEL,
    level: level
}); };
/**
 * Set the number of seats for an organization. Updates the number of fields
 * for organization seats.
 *
 * @param  {Number} seats - Number of seats.
 */
exports.setSeats = function (seats) { return ({
    type: exports.SET_SEATS,
    seats: seats
}); };
/**
 * Set subscribiption billing interval to <code>'month'</code> or <code>'year'</code>.
 *
 * @param  {String} interval - <code>'month'</code> or <code>'year'</code>.
 */
exports.setSubInterval = function (interval) { return ({
    type: exports.SET_SUB_INTERVAL,
    interval: interval
}); };
/**
 * Set original subscribiption billing interval to <code>'month'</code> or <code>'year'</code>.
 * Used for determining upgrade/downgrade/cancel logic.
 *
 * @param  {String} interval - <code>'month'</code> or <code>'year'</code>.
 */
exports.setOrigSubInterval = function (interval) { return ({
    type: exports.SET_ORIG_SUB_INTERVAL,
    interval: interval
}); };
/**
 * Sets a coupon code.
 *
 * @param  {String} coupon - Coupon code.
 */
exports.setCoupon = function (coupon) { return ({
    type: exports.SET_COUPON,
    coupon: coupon
}); };
/**
 * Sets a coupon code for valid/invalid coupons.
 *
 * @param  {String} message - Coupon message.
 */
exports.setCouponMessage = function (message) { return ({
    type: exports.SET_COUPON_MESSAGE,
    message: message
}); };
/**
 * Applies the dollar amount off determined by the coupon. Pasing 0 clears the amount.
 *
 * @param  {Number} amount - Dollar amount.
 */
exports.setCouponAmountOff = function (amount) { return ({
    type: exports.SET_COUPON_AMOUNT_OFF,
    amount: amount
}); };
/**
 * Applies the percentage off determined by the coupon. Pasing 0 clears the percentage.
 *
 * @param  {Number} percent - Percentage.
 */
exports.setCouponPercentOff = function (percent) { return ({
    type: exports.SET_COUPON_PERCENT_OFF,
    percent: percent
}); };
/**
 * Restrict available plan intervals based on coupon metadta.
 *
 * @param  {String} interval - <code>'month'</code> or <code>'year'</code>.
 */
exports.setCouponInterval = function (interval) { return ({
    type: exports.SET_COUPON_INTERVAL,
    interval: interval
}); };
/**
 * Sets a user by <code>id</code> to seat number <code>index</code>.
 *
 * @param  {Number} index - Seat number, 0-indexed.
 * @param  {String} id - User id.
 */
exports.setSeatUser = function (index, id) { return ({
    type: exports.SET_SEAT_USER,
    index: index,
    id: id
}); };
/**
 * Removes a user from seat number <code>index</code>.
 *
 * @param  {Number} index - Seat number, 0-indexed.
 */
exports.deleteSeatUser = function (index) { return ({
    type: exports.DELETE_SEAT_USER,
    index: index
}); };
/**
 * Receive an Org JSON object from the API.
 *
 * @param  {Any} json - JSON response from the API.
 */
exports.receiveOrg = function (json) { return ({
    type: exports.RECEIVE_ORG,
    json: json
}); };
/**
 * Receive an Org Users JSON object from the API.
 *
 * @param  {Any} json - JSON response from the API.
 */
exports.receiveOrgUsers = function (json) { return ({
    type: exports.RECEIVE_ORG_USERS,
    json: json
}); };
/**
 * Reset the store to a blank state. Used for testing.
 */
exports.resetStore = function () { return ({
    type: exports.RESET
}); };
/**
 * Set credit card brand.
 *
 * @param  {String} brand
 */
exports.setCardBrand = function (brand) { return ({
    type: exports.SET_CARD_BRAND,
    brand: brand
}); };
/**
 * Receive saved card details from the API.
 *
 * @param  {String} name
 * @param  {String} last_4
 * @param  {Number} exp_month
 * @param  {Number} exp_year
 * @param  {String} cvc
 * @param  {String} brand
 */
exports.receiveCard = function (name, last_4, // eslint-disable-line camelcase
    exp_month, // eslint-disable-line camelcase
    exp_year, // eslint-disable-line camelcase
    cvc, brand) {
    return ({
        type: exports.RECEIVE_CARD,
        name: name,
        last_4: last_4,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc,
        brand: brand
    });
};
/**
 * Clear card details from state.
 */
exports.clearCard = function () { return ({
    type: exports.CLEAR_CARD
}); };
/**
 * Set the form to dirty so we know to save it.
 *
 * @param  {Boolean} changed
 */
exports.paymentFormChanged = function (changed) { return ({
    type: exports.PAYMENT_FORM_CHANGED,
    changed: changed
}); };
/**
 * Display payment status success message.
 *
 * @param  {String} message - Message to display.
 */
exports.setPaymentSuccess = function (message) { return ({
    type: exports.SET_PAYMENT_SUCCESS,
    message: message
}); };
/**
 * Clear payment success message.
 */
exports.clearPaymentSuccess = function () { return ({
    type: exports.CLEAR_PAYMENT_SUCCESS
}); };
/**
 * Display payment status error message.
 *
 * @param  {String} message - Message to display.
 */
exports.setPaymentError = function (message) { return ({
    type: exports.SET_PAYMENT_ERROR,
    message: message
}); };
/**
 * Clear payment error message.
 */
exports.clearPaymentError = function () { return ({
    type: exports.CLEAR_PAYMENT_ERROR
}); };
var PaymentError = (function () {
    /**
     * @constructs PaymentError
     * @description Used for relaying payment error messages.
     *
     * @param  {string} message
     */
    function PaymentError(message) {
        this.message = message;
    }
    return PaymentError;
}());
exports.PaymentError = PaymentError;
var NetworkError = (function () {
    /**
     * @constructs NetworkError
     * @description Used for relaying network error messages.
     *
     * @param  {string} message
     */
    function NetworkError(message) {
        this.message = message;
    }
    return NetworkError;
}());
exports.NetworkError = NetworkError;
/**
 * Fetch org payment users from the API.
 *
 * @param  {String}  orgId
 * @param  {String}  authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
exports.fetchOrgUsers = function (orgId, paidMembers, authToken) {
    return function (dispatch) {
        return fetch(window.apiBaseUrl + "orgs/" + orgId + "/members", { headers: { 'Auth-Token': authToken } })
            .then(function (response) { return response.json(); })
            .then(function (json) {
            var users = json.map(function (user) { return ({
                id: user._id,
                fullName: user.user.fullName
            }); });
            dispatch(exports.receiveOrgUsers(users));
            if (paidMembers.length) {
                for (var i = 0; i < paidMembers.length; i++) {
                    dispatch(exports.setSeatUser(i, paidMembers[i]));
                }
            }
            else {
                dispatch(exports.setSeats(users.length));
                for (var i = 0; i < users.length; i++) {
                    dispatch(exports.setSeatUser(i, users[i].id));
                }
            }
            return Promise.resolve();
        });
    };
};
/**
 * Fetch org payment info from the API.
 *
 * @param  {String}  orgId
 * @param  {String}  authToken
 * @return {Promise}
 */
exports.fetchOrg = function (orgId, authToken) {
    return function (dispatch) {
        return fetch(window.payBaseUrl + "organizations/" + orgId + "/", { headers: { 'Auth-Token': authToken } }) // eslint-disable-line max-len
            .then(function (response) { return response.json(); })
            .then(function (json) {
            var paidMembers = [];
            if (json.customer) {
                dispatch(exports.receiveOrg(json));
                dispatch(exports.setSeats(json.seats_total));
                dispatch(exports.setLevel(json.subscription_metadata.level));
                dispatch(exports.setSubInterval(json.billing_interval));
                dispatch(exports.setOrigLevel(json.subscription_metadata.level));
                dispatch(exports.setOrigSubInterval(json.billing_interval));
                dispatch(exports.receiveCard(json.cardholders_name, json.last_4, json.exp_month, json.exp_year, '\u2022\u2022\u2022', json.brand));
                paidMembers = json.paid_members_hacky;
            }
            else {
                dispatch(exports.setLevel('pro'));
                dispatch(exports.setSubInterval('year'));
                dispatch(exports.paymentFormChanged(false));
                dispatch(exports.clearPaymentError());
                dispatch(exports.setProcessing(false));
                dispatch(exports.clearCard());
                dispatch(exports.setBillingType('org'));
                dispatch(exports.setSeats(1));
                dispatch(exports.receiveOrg(json));
                dispatch(exports.receiveCard('', '', 0, 0, '', ''));
            }
            dispatch(exports.fetchOrgUsers(orgId, paidMembers, authToken));
            return Promise.resolve();
        });
    };
};
/**
 * Fetch user payment info from the API.
 *
 * @param  {String}  authToken
 * @return {Promise}
 */
exports.fetchUser = function (authToken) {
    return function (dispatch) {
        return fetch(window.payBaseUrl + "user/", { headers: { 'Auth-Token': authToken } })
            .then(function (response) { return response.json(); })
            .then(function (json) {
            if (json.customer) {
                dispatch(exports.setLevel(json.subscription_metadata.level));
                dispatch(exports.setSubInterval(json.billing_interval));
                dispatch(exports.setOrigLevel(json.subscription_metadata.level));
                dispatch(exports.setOrigSubInterval(json.billing_interval));
                dispatch(exports.receiveCard(json.cardholders_name, json.last_4, json.exp_month, json.exp_year, '\u2022\u2022\u2022', json.brand));
            }
            else {
                dispatch(exports.setLevel('pro'));
                dispatch(exports.setSubInterval('year'));
                dispatch(exports.paymentFormChanged(false));
                dispatch(exports.clearPaymentError());
                dispatch(exports.setProcessing(false));
                dispatch(exports.clearCard());
                dispatch(exports.setBillingType('user'));
                dispatch(exports.receiveCard('', '', 0, 0, '', ''));
            }
            return Promise.resolve();
        });
    };
};
/**
 * Fetch available plans from the API.
 *
 * @param  {String} authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
exports.fetchPlans = function (authToken) { return function (dispatch) {
    return fetch(window.payBaseUrl + "plans/", { headers: { 'Auth-Token': authToken } })
        .then(function (response) { return response.json(); })
        .then(function (json) {
        var plans = json.results.map(function (plan) {
            if (plan.interval === 'year') {
                plan.amountMonth = plan.amount / 12;
            }
            else {
                plan.amountMonth = plan.amount;
            }
            var level = _.capitalize(plan.metadata.level);
            var price = plan.amountMonth / 100;
            if (level === 'Tour') {
                level = 'Premium';
            }
            if (price) {
                plan.title = level + " - $" + price + "/month";
            }
            else {
                plan.title = level + " - Free";
            }
            return plan;
        });
        plans.sort(function (a, b) { return a.metadata.rank - b.metadata.rank; });
        dispatch(exports.setPlans(plans.filter(function (plan) { return plan.metadata.status === 'live'; })));
        return Promise.resolve;
    });
}; };
/**
 * @param  {string} coupon
 * @param  {string} authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
exports.fetchCoupon = function (coupon, authToken) { return function (dispatch) {
    return fetch(window.payBaseUrl + "coupons/", {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon: coupon })
    })
        .then(function (response) { return response.json(); })
        .then(function (json) {
        if (json.valid) {
            dispatch(exports.setCouponMessage('billing.coupon_applied'));
            if (json.amount_off) {
                dispatch(exports.setCouponAmountOff(json.amount_off));
            }
            else if (json.percent_off) {
                dispatch(exports.setCouponPercentOff(json.percent_off));
            }
            if (json.metadata.interval) {
                dispatch(exports.setSubInterval(json.metadata.interval));
                dispatch(exports.setCouponInterval(json.metadata.interval));
            }
        }
        else {
            dispatch(exports.setCouponMessage('billing.coupon_invalid'));
            dispatch(exports.setCouponAmountOff(0));
            dispatch(exports.setCouponPercentOff(0));
            dispatch(exports.setCouponInterval(null));
        }
        return Promise.resolve;
    });
}; };
/**
 * Create CC token with Stripe.
 *
 * @param  {String}  cc
 * @param  {String}  cvc
 * @param  {Number}  month
 * @param  {Number}  year
 * @return {Promise} - resolve: string, reject: PaymentError
 */
exports.createToken = function (name, cc, cvc, exp_month, // eslint-disable-line camelcase
    exp_year // eslint-disable-line camelcase
    ) {
    return new Promise(function (resolve, reject) {
        return Stripe.card.createToken({
            name: name,
            number: cc,
            cvc: cvc,
            exp_month: exp_month,
            exp_year: exp_year
        }, function (status, response) {
            if (response.error) {
                reject(new PaymentError(response.error.message));
            }
            else {
                resolve(response.id);
            }
        });
    });
};
/**
 * Fetch org payment from the API.
 *
 * @param  {String}  orgId
 * @param  {String}  authToken
 * @return {Promise} - resolve: OrgPaymentResponse, reject: NetworkError
 */
exports.fetchOrgPayment = function (orgId, authToken) {
    return fetch(window.payBaseUrl + "organizations/" + orgId + "/", { headers: { 'Auth-Token': authToken } })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Patch org payment to the API.
 *
 * @param  {String}  orgId
 * @param  {Payment} body
 * @param  {String}  authToken
 * @return {Promise} - resolve: OrgPaymentResponse, reject: NetworkError
 */
exports.patchOrgPayment = function (orgId, body, authToken) {
    return fetch(window.payBaseUrl + "organizations/" + orgId + "/", {
        method: 'PATCH',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Post org payment to the API.
 *
 * @param  {String}  orgId
 * @param  {Payment} body
 * @param  {String}  authToken
 * @return {Promise} - resolve: OrgPaymentResponse, reject: NetworkError
 */
exports.postOrgPayment = function (orgId, body, authToken) {
    return fetch(window.payBaseUrl + "organizations/" + orgId + "/", {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Post paying org members to the API.
 *
 * @param  {String}        orgId
 * @param  {Array<string>} members
 * @param  {String}        authToken
 * @return {Promise} - resolve: MemberResponse, reject: NetworkError
 */
exports.postOrgMembers = function (orgId, members, authToken) {
    return fetch(window.payBaseUrl + "organizations/" + orgId + "/members/", {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_members: members })
    }).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Fetch user payment from the API.
 *
 * @param  {String}  authToken
 * @return {Promise} - resolve: UserPaymentResponse, reject: NetworkError
 */
exports.fetchUserPayment = function (authToken) {
    return fetch(window.payBaseUrl + "user/", { headers: { 'Auth-Token': authToken } })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Patch user payment to the API.
 *
 * @param  {Payment} body
 * @param  {String}  authToken
 * @return {Promise} - resolve: UserPaymentResponse, reject: NetworkError
 */
exports.patchUserPayment = function (body, authToken) {
    return fetch(window.payBaseUrl + "user/", {
        method: 'PATCH',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Post user payment to the API.
 *
 * @param  {Payment} body
 * @param  {string}  authToken
 * @return {Promise} - resolve: UserPaymentResponse, reject: NetworkError
 */
exports.postUserPayment = function (body, authToken) {
    return fetch(window.payBaseUrl + "user/", {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(function (json) {
            return Promise.reject(new NetworkError(json.message));
        });
    });
};
/**
 * Handle NetworkError or Payment error.
 *
 * @param  {MessageAction} error
 * @return {Function} - (dispatch: Store.dispatch): void
 */
exports.handleError = function (error) {
    return function (dispatch) {
        dispatch(exports.setProcessing(false));
        if (error instanceof NetworkError) {
            dispatch(exports.setPaymentError(error.message));
        }
        else if (error instanceof PaymentError) {
            dispatch(exports.setPaymentError(error.message));
        }
        else {
            dispatch(exports.setPaymentError('Unknown error.'));
        }
        dispatch(exports.clearCard());
    };
};
/**
 * Submit org payment. Posts a Stripe token to the payment API.
 * Handles processing state, organization seats and payment response.
 *
 * @param  {String}  orgId
 * @param  {String} token
 * @param  {PaymentResponse} paymentObj
 * @param  {String}  plan
 * @param  {Number}  seats
 * @param  {Number}  quantity
 * @param  {String[]} paidMembers
 * @param  {String}  coupon
 * @param  {String}  authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
exports.submitOrgPayment = function (orgId, token, paymentObj, plan, seats, quantity, paidMembers, coupon, authToken) {
    return function (dispatch) {
        var body = { plan: plan, seats: seats, quantity: quantity };
        var request = exports.postOrgPayment;
        if (token !== null) {
            body.token = token;
        }
        if (coupon !== null) {
            body.coupon = coupon;
        }
        if (paymentObj.customer) {
            request = exports.patchOrgPayment;
        }
        return request(orgId, body, authToken)
            .then(function () { return exports.postOrgMembers(orgId, paidMembers, authToken); })
            .then(function (paymentObj) {
            dispatch(exports.setProcessing(false));
            dispatch(exports.clearPaymentError());
            dispatch(exports.paymentFormChanged(false));
            dispatch(exports.setCoupon(''));
            dispatch(exports.setCouponMessage(''));
            dispatch(exports.setCouponAmountOff(0));
            dispatch(exports.setCouponPercentOff(0));
            dispatch(exports.setCouponInterval(null));
            dispatch(exports.setSeats(paymentObj.seats_total));
            dispatch(exports.setLevel(paymentObj.subscription_metadata.level));
            dispatch(exports.setSubInterval(paymentObj.billing_interval));
            dispatch(exports.receiveCard(paymentObj.cardholders_name, paymentObj.last_4, paymentObj.exp_month, paymentObj.exp_year, '\u2022\u2022\u2022', paymentObj.brand));
            dispatch(exports.setPaymentSuccess('Updated membership.'));
            setTimeout(function () {
                dispatch(exports.clearPaymentSuccess());
            }, 5000);
            return Promise.resolve();
        })
            .catch(function (error) { return dispatch(exports.handleError(error)); });
    };
};
/**
 * Submit org payment. Posts a Stripe token to the payment API.
 * Handles processing state and payment response.
 *
 * @param  {String}  orgId
 * @param  {String}  token
 * @param  {PaymentResponse} paymentObj
 * @param  {String}  plan
 * @param  {String}  coupon
 * @param  {String}  authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
exports.submitUserPayment = function (token, paymentObj, plan, coupon, authToken) {
    return function (dispatch) {
        var body = { plan: plan };
        var request = exports.postUserPayment;
        if (token !== null) {
            body.token = token;
        }
        if (coupon !== null) {
            body.coupon = coupon;
        }
        if (paymentObj.customer) {
            request = exports.patchUserPayment;
        }
        return request(body, authToken)
            .then(function (paymentObj) {
            dispatch(exports.setProcessing(false));
            dispatch(exports.clearPaymentError());
            dispatch(exports.paymentFormChanged(false));
            dispatch(exports.setCoupon(''));
            dispatch(exports.setCouponMessage(''));
            dispatch(exports.setCouponAmountOff(0));
            dispatch(exports.setCouponPercentOff(0));
            dispatch(exports.setCouponInterval(null));
            dispatch(exports.setLevel(paymentObj.subscription_metadata.level));
            dispatch(exports.setSubInterval(paymentObj.billing_interval));
            dispatch(exports.receiveCard(paymentObj.cardholders_name, paymentObj.last_4, paymentObj.exp_month, paymentObj.exp_year, '\u2022\u2022\u2022', paymentObj.brand));
            dispatch(exports.setPaymentSuccess('Updated membership.'));
            setTimeout(function () {
                dispatch(exports.clearPaymentSuccess());
            }, 5000);
            return Promise.resolve();
        })
            .catch(function (error) { return dispatch(exports.handleError(error)); });
    };
};
