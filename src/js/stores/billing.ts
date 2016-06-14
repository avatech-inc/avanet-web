/* eslint-disable new-cap, spaced-comment */

/// <reference path='../../../node_modules/immutable/dist/immutable.d.ts'/>
/// <reference path='../../definitions/redux.d.ts'/>
/// <reference path='../../definitions/redux-thunk.d.ts'/>
/// <reference path='../types/billing.ts' />

import Immutable = require('immutable')
import thunk = require('redux-thunk')

import { createStore, applyMiddleware } from 'redux'
import * as actions from '../actions/billing'

/**
 * @module stores/billing
 */

const DefaultCard: Billing.Card = {
    name: null,
    last_4: null,
    exp_month: null,
    exp_year: null,
    cvc: null,
    brand: 'Unknown'
}

export class CardRecord extends Immutable.Record<Billing.Card>(DefaultCard) implements Billing.Card {
    name: string;
    last_4: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    brand: string;
}

const DefaultOrg: Billing.Org = {
    id: null,
    name: null,
    users: Immutable.List([])
}

export class OrgRecord extends Immutable.Record<Billing.Org>(DefaultOrg) implements Billing.Org {
    id: string;
    name: string;
    users: Immutable.List<Billing.User>;
}

const DefaultBilling: Billing.StateRecord = {
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
}

class BillingState extends Immutable.Record<Billing.StateRecord>(DefaultBilling) implements Billing.StateRecord {
    plans: Immutable.List<Billing.Plan>;
    level: string;
    interval: 'month' | 'year';
    origLevel: string;
    origInterval: string;
    coupon: string;
    couponMessage: string;
    couponAmountOff: number;
    couponPercentOff: number;
    couponInterval: 'month' | 'year';
    changed: boolean;
    error: string;
    success: string;
    processing: boolean;
    card: CardRecord;
    type: 'user' | 'org';
    org: OrgRecord;
    seats: number;
    seatUsers: Immutable.List<string>;
}

/**
 * Takes an immutable list of seat users `state` and returns a copy of it
 * modified with BillingAction `action`
 *
 * @ignore
 * @param  {Immutable.List<string>} state
 * @param  {BillingAction}          action
 * @return {Immutable.List<string>}
 */
const seats = (
    state: Immutable.List<string>,
    action: Billing.BillingAction
): Immutable.List<string> => {
    switch (action.type) {

    case actions.SET_SEATS:
        return state.setSize(action.seats)

    case actions.SET_SEAT_USER:
        if (action.index > state.size) return state

        return state.set(action.index, action.id)

    case actions.DELETE_SEAT_USER:
        return state.delete(action.index).setSize(state.size)

    default:
        return state
    }
}

/**
 * Takes an immutable map org `state` and returns a copy of it
 * modified with FetchAction `action`
 *
 * @ignore
 * @param  {Org}         state
 * @param  {FetchAction} action
 * @return {Org}
 */
const org = (
    state: OrgRecord,
    action: Billing.FetchAction
): OrgRecord => {
    switch (action.type) {

    case actions.RECEIVE_ORG:
        return new OrgRecord({
            id: action.json.id,
            name: action.json.name,
            users: Immutable.List([])
        })
    case actions.RECEIVE_ORG_USERS:
        if (state !== null) {
            return state.set('users', Immutable.List(action.json))
        } else {
            return state
        }
    default:
        return state
    }
}

/**
 * @ignore
 * @param  {string}
 * @param  {MessageAction}
 * @return {string}
 */
const error = (
    state: string,
    action: Billing.MessageAction
): string => {
    switch (action.type) {

    case actions.SET_PAYMENT_ERROR:
        return action.message
    case actions.CLEAR_PAYMENT_ERROR:
        return null
    default:
        return state
    }
}

/**
 * @ignore
 * @param  {string}
 * @param  {MessageAction}
 * @return {string}
 */
const success = (
    state: string,
    action: Billing.MessageAction
): string => {
    switch (action.type) {

    case actions.SET_PAYMENT_SUCCESS:
        return action.message
    case actions.CLEAR_PAYMENT_SUCCESS:
        return null
    default:
        return state
    }
}

/**
 * @ignore
 * @param  {CardRecord}
 * @param  {CardAction}
 * @return {CardRecord}
 */
const card = (
    state: CardRecord,
    action: Billing.CardAction
): CardRecord => {
    switch (action.type) {

    case actions.RECEIVE_CARD:
        return new CardRecord({
            name: action.name,
            last_4: action.last_4,
            exp_month: action.exp_month,
            exp_year: action.exp_year,
            cvc: action.cvc,
            brand: action.brand
        })
    case actions.CLEAR_CARD:
        return new CardRecord({
            brand: state.get('brand')
        })
    case actions.SET_CARD_BRAND:
        return state.set('brand', action.brand)
    default:
        return state
    }
}

/**
 * Takes an immutable record `state` and returns a copy of it modified with
 * BillingAction `action`
 *
 * @ignore
 * @param  {BillingState}  state
 * @param  {BillingAction} action
 * @return {BillingState}
 */
const rootReducer = (
    state = new BillingState(),
    action: Billing.BillingAction
): BillingState => {
    switch (action.type) {

    case actions.SET_PLANS:
        return state.set('plans', Immutable.List(action.plans))

    case actions.SET_BILLING_TYPE:
        return state.set('type', action.billingType)

    case actions.SET_LEVEL:
        return state.set('level', action.level)

    case actions.SET_ORIG_LEVEL:
        return state.set('origLevel', action.level)

    case actions.SET_SUB_INTERVAL:
        return state.set('interval', action.interval)

    case actions.SET_ORIG_SUB_INTERVAL:
        return state.set('origInterval', action.interval)

    case actions.SET_COUPON:
        return state.set('coupon', action.coupon)

    case actions.SET_COUPON_MESSAGE:
        return state.set('couponMessage', action.message)

    case actions.SET_COUPON_AMOUNT_OFF:
        return state.set('couponAmountOff', action.amount)

    case actions.SET_COUPON_PERCENT_OFF:
        return state.set('couponPercentOff', action.percent)

    case actions.SET_COUPON_INTERVAL:
        return state.set('couponInterval', action.interval)

    case actions.SET_PROCESSING:
        return state.set('processing', action.processing)

    case actions.SET_SEATS:
        let s = state.set('seats', action.seats)
        return s.set('seatUsers', seats(s.get('seatUsers'), action))

    case actions.SET_SEAT_USER:
    case actions.DELETE_SEAT_USER:
        return state.set('seatUsers', seats(state.get('seatUsers'), action))

    case actions.RECEIVE_ORG:
    case actions.RECEIVE_ORG_USERS:
        return state.set('org', org(state.get('org'), action))

    case actions.RECEIVE_CARD:
    case actions.CLEAR_CARD:
    case actions.SET_CARD_BRAND:
        return state.set('card', card(state.get('card'), action))

    case actions.PAYMENT_FORM_CHANGED:
        return state.set('changed', action.changed)

    case actions.SET_PAYMENT_ERROR:
    case actions.CLEAR_PAYMENT_ERROR:
        return state.set('error', error(state.get('error'), action))

    case actions.SET_PAYMENT_SUCCESS:
    case actions.CLEAR_PAYMENT_SUCCESS:
        return state.set('success', success(state.get('success'), action))

    case actions.RESET:
        return new BillingState()

    default:
        return state
    }
}

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
export const billingStore = createStore(rootReducer, applyMiddleware(thunk))
