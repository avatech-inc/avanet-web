/* eslint-disable new-cap, spaced-comment */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path='../../../node_modules/immutable/dist/immutable.d.ts'/>
/// <reference path='../../definitions/redux.d.ts'/>
/// <reference path='../../definitions/redux-thunk.d.ts'/>
/// <reference path='../types/billing.ts' />
var Immutable = require('immutable');
var thunk = require('redux-thunk');
var redux_1 = require('redux');
var actions = require('../actions/billing');
/**
 * @module stores/billing
 */
var DefaultCard = {
    name: null,
    last_4: null,
    exp_month: null,
    exp_year: null,
    cvc: null,
    brand: 'Unknown'
};
var CardRecord = (function (_super) {
    __extends(CardRecord, _super);
    function CardRecord() {
        _super.apply(this, arguments);
    }
    return CardRecord;
}(Immutable.Record(DefaultCard)));
exports.CardRecord = CardRecord;
var DefaultOrg = {
    id: null,
    name: null,
    users: Immutable.List([])
};
var OrgRecord = (function (_super) {
    __extends(OrgRecord, _super);
    function OrgRecord() {
        _super.apply(this, arguments);
    }
    return OrgRecord;
}(Immutable.Record(DefaultOrg)));
exports.OrgRecord = OrgRecord;
var DefaultBilling = {
    plans: Immutable.List([]),
    level: 'tour',
    interval: 'year',
    origLevel: null,
    origInterval: null,
    coupon: '',
    couponMessage: null,
    couponAmountOff: 0,
    couponPercentOff: 0,
    couponInterval: null,
    changed: false,
    error: null,
    success: null,
    processing: false,
    card: new CardRecord(),
    type: null,
    org: null,
    seats: 1,
    seatUsers: Immutable.List([]).setSize(1)
};
var BillingState = (function (_super) {
    __extends(BillingState, _super);
    function BillingState() {
        _super.apply(this, arguments);
    }
    return BillingState;
}(Immutable.Record(DefaultBilling)));
/**
 * Takes an immutable list of seat users `state` and returns a copy of it
 * modified with BillingAction `action`
 *
 * @ignore
 * @param  {Immutable.List<string>} state
 * @param  {BillingAction}          action
 * @return {Immutable.List<string>}
 */
var seats = function (state, action) {
    switch (action.type) {
        case actions.SET_SEATS:
            return state.setSize(action.seats);
        case actions.SET_SEAT_USER:
            if (action.index > state.size)
                return state;
            return state.set(action.index, action.id);
        case actions.DELETE_SEAT_USER:
            return state.delete(action.index).setSize(state.size);
        default:
            return state;
    }
};
/**
 * Takes an immutable map org `state` and returns a copy of it
 * modified with FetchAction `action`
 *
 * @ignore
 * @param  {Org}         state
 * @param  {FetchAction} action
 * @return {Org}
 */
var org = function (state, action) {
    switch (action.type) {
        case actions.RECEIVE_ORG:
            return new OrgRecord({
                id: action.json.id,
                name: action.json.name,
                users: Immutable.List([])
            });
        case actions.RECEIVE_ORG_USERS:
            if (state !== null) {
                return state.set('users', Immutable.List(action.json));
            }
            else {
                return state;
            }
        default:
            return state;
    }
};
/**
 * @ignore
 * @param  {string}
 * @param  {MessageAction}
 * @return {string}
 */
var error = function (state, action) {
    switch (action.type) {
        case actions.SET_PAYMENT_ERROR:
            return action.message;
        case actions.CLEAR_PAYMENT_ERROR:
            return null;
        default:
            return state;
    }
};
/**
 * @ignore
 * @param  {string}
 * @param  {MessageAction}
 * @return {string}
 */
var success = function (state, action) {
    switch (action.type) {
        case actions.SET_PAYMENT_SUCCESS:
            return action.message;
        case actions.CLEAR_PAYMENT_SUCCESS:
            return null;
        default:
            return state;
    }
};
/**
 * @ignore
 * @param  {CardRecord}
 * @param  {CardAction}
 * @return {CardRecord}
 */
var card = function (state, action) {
    switch (action.type) {
        case actions.RECEIVE_CARD:
            return new CardRecord({
                name: action.name,
                last_4: action.last_4,
                exp_month: action.exp_month,
                exp_year: action.exp_year,
                cvc: action.cvc,
                brand: action.brand
            });
        case actions.CLEAR_CARD:
            return new CardRecord({
                brand: state.get('brand')
            });
        case actions.SET_CARD_BRAND:
            return state.set('brand', action.brand);
        default:
            return state;
    }
};
/**
 * Takes an immutable record `state` and returns a copy of it modified with
 * BillingAction `action`
 *
 * @ignore
 * @param  {BillingState}  state
 * @param  {BillingAction} action
 * @return {BillingState}
 */
var rootReducer = function (state, action) {
    if (state === void 0) { state = new BillingState(); }
    switch (action.type) {
        case actions.SET_PLANS:
            return state.set('plans', Immutable.List(action.plans));
        case actions.SET_BILLING_TYPE:
            return state.set('type', action.billingType);
        case actions.SET_LEVEL:
            return state.set('level', action.level);
        case actions.SET_ORIG_LEVEL:
            return state.set('origLevel', action.level);
        case actions.SET_SUB_INTERVAL:
            return state.set('interval', action.interval);
        case actions.SET_ORIG_SUB_INTERVAL:
            return state.set('origInterval', action.interval);
        case actions.SET_COUPON:
            return state.set('coupon', action.coupon);
        case actions.SET_COUPON_MESSAGE:
            return state.set('couponMessage', action.message);
        case actions.SET_COUPON_AMOUNT_OFF:
            return state.set('couponAmountOff', action.amount);
        case actions.SET_COUPON_PERCENT_OFF:
            return state.set('couponPercentOff', action.percent);
        case actions.SET_COUPON_INTERVAL:
            return state.set('couponInterval', action.interval);
        case actions.SET_PROCESSING:
            return state.set('processing', action.processing);
        case actions.SET_SEATS:
            var s = state.set('seats', action.seats);
            return s.set('seatUsers', seats(s.get('seatUsers'), action));
        case actions.SET_SEAT_USER:
        case actions.DELETE_SEAT_USER:
            return state.set('seatUsers', seats(state.get('seatUsers'), action));
        case actions.RECEIVE_ORG:
        case actions.RECEIVE_ORG_USERS:
            return state.set('org', org(state.get('org'), action));
        case actions.RECEIVE_CARD:
        case actions.CLEAR_CARD:
        case actions.SET_CARD_BRAND:
            return state.set('card', card(state.get('card'), action));
        case actions.PAYMENT_FORM_CHANGED:
            return state.set('changed', action.changed);
        case actions.SET_PAYMENT_ERROR:
        case actions.CLEAR_PAYMENT_ERROR:
            return state.set('error', error(state.get('error'), action));
        case actions.SET_PAYMENT_SUCCESS:
        case actions.CLEAR_PAYMENT_SUCCESS:
            return state.set('success', success(state.get('success'), action));
        case actions.RESET:
            return new BillingState();
        default:
            return state;
    }
};
/**
 * @type {Redux.Store}
 * @description Redux billing store to manage billing state.
 *
 * @example
 * billingStore.dispatch(actions.setBillingType('org'))
 *
 * @example
 * billingStore.dispatch(actions.setBillingType('org'))
 */
exports.billingStore = redux_1.createStore(rootReducer, redux_1.applyMiddleware(thunk));
