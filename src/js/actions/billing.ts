/* global Billing, Redux */
/* eslint-disable spaced-comment */

/// <reference path='../../definitions/lodash.d.ts' />
/// <reference path='../../definitions/stripe.d.ts' />
/// <reference path='../../definitions/redux.d.ts' />
/// <reference path='../../definitions/whatwg-fetch.d.ts' />
/// <reference path='../types/common.ts' />
/// <reference path='../types/billing.ts' />

import { capitalize } from 'lodash'

const _ = { capitalize: capitalize }

declare var window: AppWindow

export const SET_BILLING_TYPE = 'billing/SET_BILLING_TYPE'
export const SET_PLANS = 'billing/SET_PLANS'
export const SET_LEVEL = 'billing/SET_LEVEL'
export const SET_SEATS = 'billing/SET_SEATS'
export const SET_SUB_INTERVAL = 'billing/SET_INTERVAL'
export const SET_COUPON = 'billing/SET_COUPON'
export const SET_COUPON_MESSAGE = 'billing/SET_COUPON_MESSAGE'
export const SET_COUPON_AMOUNT_OFF = 'billing/SET_COUPON_AMOUNT_OFF'
export const SET_COUPON_PERCENT_OFF = 'billing/SET_COUPON_PERCENT_OFF'
export const SET_COUPON_INTERVAL = 'billing/SET_COUPON_INTERVAL'
export const SET_SEAT_USER = 'billing/SET_SEAT_USER'
export const DELETE_SEAT_USER = 'billing/DELETE_SEAT_USER'
export const SET_PAYMENT_SUCCESS = 'billing/SET_PAYMENT_SUCCESS'
export const CLEAR_PAYMENT_SUCCESS = 'billing/CLEAR_PAYMENT_SUCCESS'
export const SET_PAYMENT_ERROR = 'billing/SET_PAYMENT_ERROR'
export const CLEAR_PAYMENT_ERROR = 'billing/CLEAR_PAYMENT_ERROR'
export const SET_PROCESSING = 'billing/SET_PROCESSING'
export const CLEAR_CVC = 'billing/CLEAR_CVC'
export const RECEIVE_CARD = 'billing/RECEIVE_CARD'
export const CLEAR_CARD = 'billing/CLEAR_CARD'
export const SET_CARD_BRAND = 'billing/SET_CARD_BRAND'
export const PAYMENT_FORM_CHANGED = 'billing/PAYMENT_FORM_CHANGED'

export const RECEIVE_ORG = 'users/RECEIVE_ORG'
export const RECEIVE_ORG_USERS = 'users/RECEIVE_ORG_USERS'

export const RESET = 'tests/RESET'

export const setBillingType = (billingType: string) => ({
    type: SET_BILLING_TYPE,
    billingType: billingType
})

export const setPlans = (plans: Array<Billing.Plan>) => ({
    type: SET_PLANS,
    plans: plans
})

export const setProcessing = (processing: boolean) => ({
    type: SET_PROCESSING,
    processing: processing
})

export const setLevel = (level: string) => ({
    type: SET_LEVEL,
    level: level
})

export const setSeats = (seats: number) => ({
    type: SET_SEATS,
    seats: seats
})

export const setSubInterval = (interval: 'month' | 'year') => ({
    type: SET_SUB_INTERVAL,
    interval: interval
})

export const setCoupon = (coupon: string) => ({
    type: SET_COUPON,
    coupon: coupon
})

export const setCouponMessage = (message: string) => ({
    type: SET_COUPON_MESSAGE,
    message: message
})

export const setCouponAmountOff = (amount: number) => ({
    type: SET_COUPON_AMOUNT_OFF,
    amount: amount
})

export const setCouponPercentOff = (percent: number) => ({
    type: SET_COUPON_PERCENT_OFF,
    percent: percent
})

export const setCouponInterval = (interval: 'month' | 'year') => ({
    type: SET_COUPON_INTERVAL,
    interval: interval
})

export const setSeatUser = (index: number, id: string) => ({
    type: SET_SEAT_USER,
    index: index,
    id: id
})

export const deleteSeatUser = (index: number) => ({
    type: DELETE_SEAT_USER,
    index: index
})

export const receiveOrg = (json: any) => ({
    type: RECEIVE_ORG,
    json: json
})

export const receiveOrgUsers = (json: any) => ({
    type: RECEIVE_ORG_USERS,
    json: json
})

export const resetStore = () => ({
    type: RESET
})

export const setCardBrand = (brand: string) => ({
    type: SET_CARD_BRAND,
    brand: brand
})

export const receiveCard = (
    name: string,
    last_4: string,  // eslint-disable-line camelcase
    exp_month: number,  // eslint-disable-line camelcase
    exp_year: number,  // eslint-disable-line camelcase
    cvc: string,
    brand: string
) => ({
    type: RECEIVE_CARD,
    name: name,
    last_4: last_4,
    exp_month: exp_month,
    exp_year: exp_year,
    cvc: cvc,
    brand: brand
})

export const clearCard = () => ({
    type: CLEAR_CARD
})

export const paymentFormChanged = (changed: boolean) => ({
    type: PAYMENT_FORM_CHANGED,
    changed: changed
})

export const setPaymentSuccess = (message: string) => ({
    type: SET_PAYMENT_SUCCESS,
    message: message
})

export const clearPaymentSuccess = () => ({
    type: CLEAR_PAYMENT_SUCCESS
})

export const setPaymentError = (message: string) => ({
    type: SET_PAYMENT_ERROR,
    message: message
})

export const clearPaymentError = () => ({
    type: CLEAR_PAYMENT_ERROR
})

export class PaymentError {
    message: string;

    constructor(message: string) {
        this.message = message
    }
}

export class NetworkError {
    message: string;

    constructor(message: string) {
        this.message = message
    }
}

/**
 * @param  {string}  orgId
 * @param  {string}  authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
export const fetchOrgUsers = (orgId: string, paidMembers: Array<string>, authToken: string) =>
    (dispatch: Redux.Dispatch) =>
        fetch(`${window.apiBaseUrl}orgs/${orgId}/members`, { headers: { 'Auth-Token': authToken } })
            .then(response => response.json())
            .then(json => {
                let users = json.map((user: Billing.UserResponse) => ({
                    id: user._id,
                    fullName: user.user.fullName
                }))

                dispatch(receiveOrgUsers(users))

                if (paidMembers.length) {
                    for (let i = 0; i < paidMembers.length; i++) {
                        dispatch(setSeatUser(i, paidMembers[i]))
                    }
                } else {
                    dispatch(setSeats(users.length))

                    for (let i = 0; i < users.length; i++) {
                        dispatch(setSeatUser(i, users[i].id))
                    }
                }

                return Promise.resolve()
            })

/**
 * @param  {string}  orgId
 * @param  {string}  authToken
 * @return {Promise}
 */
export const fetchOrg = (orgId: string, authToken: string) =>
    (dispatch: Redux.Dispatch) =>
        fetch(`${window.payBaseUrl}organizations/${orgId}/`, { headers: { 'Auth-Token': authToken } })  // eslint-disable-line max-len
            .then(response => response.json())
            .then(json => {
                let paidMembers: Array<string> = []

                if (json.customer) {
                    dispatch(receiveOrg(json))
                    dispatch(setSeats(json.seats_total))
                    dispatch(setLevel(json.subscription_metadata.level))
                    dispatch(setSubInterval(json.billing_interval))

                    dispatch(receiveCard(
                        json.cardholders_name,
                        json.last_4,
                        json.exp_month,
                        json.exp_year,
                        '\u2022\u2022\u2022',
                        json.brand
                    ))

                    paidMembers = json.paid_members_hacky
                } else {
                    dispatch(setLevel('pro'))
                    dispatch(setSubInterval('year'))
                    dispatch(paymentFormChanged(false))
                    dispatch(clearPaymentError())
                    dispatch(setProcessing(false))
                    dispatch(clearCard())
                    dispatch(setBillingType('org'))
                    dispatch(setSeats(1))
                    dispatch(receiveOrg(json))

                    dispatch(receiveCard(
                        '',
                        '',
                        0,
                        0,
                        '',
                        ''
                    ))
                }

                dispatch(fetchOrgUsers(orgId, paidMembers, authToken))

                return Promise.resolve()
            })

/**
 * @param  {string}  authToken
 * @return {Promise}
 */
export const fetchUser = (authToken: string) =>
    (dispatch: Redux.Dispatch) =>
        fetch(`${window.payBaseUrl}user/`, { headers: { 'Auth-Token': authToken } })
            .then(response => response.json())
            .then(json => {
                if (json.customer) {
                    dispatch(setLevel(json.subscription_metadata.level))
                    dispatch(setSubInterval(json.billing_interval))

                    dispatch(receiveCard(
                        json.cardholders_name,
                        json.last_4,
                        json.exp_month,
                        json.exp_year,
                        '\u2022\u2022\u2022',
                        json.brand
                    ))
                } else {
                    dispatch(setLevel('pro'))
                    dispatch(setSubInterval('year'))
                    dispatch(paymentFormChanged(false))
                    dispatch(clearPaymentError())
                    dispatch(setProcessing(false))
                    dispatch(clearCard())
                    dispatch(setBillingType('user'))

                    dispatch(receiveCard(
                        '',
                        '',
                        0,
                        0,
                        '',
                        ''
                    ))
                }

                return Promise.resolve()
            })

/**
 * @param  {string} authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
export const fetchPlans = (authToken: string) => (dispatch: Redux.Dispatch) =>
    fetch(`${window.payBaseUrl}plans/`, { headers: { 'Auth-Token': authToken } })
        .then(response => response.json())
        .then(json => {
            let plans = json.results.map((plan: Billing.Plan) => {
                if (plan.interval === 'year') {
                    plan.amountMonth = plan.amount / 12
                } else {
                    plan.amountMonth = plan.amount
                }

                let level = _.capitalize(plan.metadata.level)
                let price = plan.amountMonth / 100

                plan.title = `${level} - \$${price}/month`

                return plan
            })

            plans.sort((a: Billing.Plan, b: Billing.Plan) => a.metadata.rank - b.metadata.rank)

            dispatch(setPlans(plans.filter((plan: Billing.Plan) => plan.metadata.status === 'live')))

            return Promise.resolve
        })

/**
 * @param  {string} coupon
 * @param  {string} authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
export const fetchCoupon = (coupon: string, authToken: string) => (dispatch: Redux.Dispatch) =>
    fetch(`${window.payBaseUrl}coupons/`, {
            method: 'POST',
            headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon: coupon })
        })
        .then(response => response.json())
        .then(json => {
            if (json.valid) {
                dispatch(setCouponMessage('Coupon code applied!'))

                if (json.amount_off) {
                    dispatch(setCouponAmountOff(json.amount_off))
                } else if (json.percent_off) {
                    dispatch(setCouponPercentOff(json.percent_off))
                }

                if (json.metadata.interval) {
                    dispatch(setSubInterval(json.metadata.interval))
                    dispatch(setCouponInterval(json.metadata.interval))
                }
            } else {
                dispatch(setCouponMessage('Invalid coupon code'))
                dispatch(setCouponAmountOff(0))
                dispatch(setCouponPercentOff(0))
                dispatch(setCouponInterval(null))
            }

            return Promise.resolve
        })

/**
 * @param  {string}  cc
 * @param  {string}  cvc
 * @param  {number}  month
 * @param  {number}  year
 * @return {Promise} - resolve: string, reject: PaymentError
 */
export const createToken = (
    name: string,
    cc: string,
    cvc: string,
    exp_month: number,  // eslint-disable-line camelcase
    exp_year: number  // eslint-disable-line camelcase
) => new Promise((resolve, reject) =>
    Stripe.card.createToken({
        name: name,
        number: cc,
        cvc: cvc,
        exp_month: exp_month,
        exp_year: exp_year
    }, (status, response) => {
        if (response.error) {
            reject(new PaymentError(response.error.message))
        } else {
            resolve(response.id)
        }
    }))

/**
 * @param  {string}  orgId
 * @param  {string}  authToken
 * @return {Promise} - resolve: OrgPaymentResponse, reject: NetworkError
 */
export const fetchOrgPayment = (orgId: string, authToken: string) =>
    fetch(`${window.payBaseUrl}organizations/${orgId}/`, { headers: { 'Auth-Token': authToken } })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            return response.json().then(json =>
                Promise.reject(new NetworkError(json.message)))
        })

/**
 * @param  {string}  orgId
 * @param  {Payment} body
 * @param  {string}  authToken
 * @return {Promise} - resolve: OrgPaymentResponse, reject: NetworkError
 */
export const patchOrgPayment = (orgId: string, body: Billing.PaymentRequest, authToken: string) =>
    fetch(`${window.payBaseUrl}organizations/${orgId}/`, {
        method: 'PATCH',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            return response.json().then(json =>
                Promise.reject(new NetworkError(json.message)))
        })

/**
 * @param  {string}  orgId
 * @param  {Payment} body
 * @param  {string}  authToken
 * @return {Promise} - resolve: OrgPaymentResponse, reject: NetworkError
 */
export const postOrgPayment = (orgId: string, body: Billing.PaymentRequest, authToken: string) =>
    fetch(`${window.payBaseUrl}organizations/${orgId}/`, {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            return response.json().then(json =>
                Promise.reject(new NetworkError(json.message)))
        })

/**
 * [description]
 * @param  {string}        orgId
 * @param  {Array<string>} members
 * @param  {string}        authToken
 * @return {Promise} - resolve: MemberResponse, reject: NetworkError
 */
export const postOrgMembers = (orgId: string, members: Array<string>, authToken: string) =>
    fetch(`${window.payBaseUrl}organizations/${orgId}/members/`, {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_members: members })
    }).then(response => {
        if (response.ok) {
            return response.json()
        }

        return response.json().then(json =>
            Promise.reject(new NetworkError(json.message)))
    })

/**
 * @param  {string}  authToken
 * @return {Promise} - resolve: UserPaymentResponse, reject: NetworkError
 */
export const fetchUserPayment = (authToken: string) =>
    fetch(`${window.payBaseUrl}user/`, { headers: { 'Auth-Token': authToken } })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            return response.json().then(json =>
                Promise.reject(new NetworkError(json.message)))
        })

/**
 * @param  {Payment} body
 * @param  {string}  authToken
 * @return {Promise} - resolve: UserPaymentResponse, reject: NetworkError
 */
export const patchUserPayment = (body: Billing.PaymentRequest, authToken: string) =>
    fetch(`${window.payBaseUrl}user/`, {
        method: 'PATCH',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            return response.json().then(json =>
                Promise.reject(new NetworkError(json.message)))
        })

/**
 * @param  {Payment} body
 * @param  {string}  authToken
 * @return {Promise} - resolve: UserPaymentResponse, reject: NetworkError
 */
export const postUserPayment = (body: Billing.PaymentRequest, authToken: string) =>
    fetch(`${window.payBaseUrl}user/`, {
        method: 'POST',
        headers: { 'Auth-Token': authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }

            return response.json().then(json =>
                Promise.reject(new NetworkError(json.message)))
        })


/**
 * @param  {MessageAction} error
 * @return {Function} - (dispatch: Store.dispatch): void
 */
export const handleError = (error: Billing.MessageAction) =>
    (dispatch: Redux.Dispatch) => {
        dispatch(setProcessing(false))

        if (error instanceof NetworkError) {
            dispatch(setPaymentError(error.message))
        } else if (error instanceof PaymentError) {
            dispatch(setPaymentError(error.message))
        } else {
            dispatch(setPaymentError('Unknown error.'))
        }

        dispatch(clearCard())
    }

/**
 * @param  {string}  orgId
 * @param  {string} token
 * @param  {PaymentResponse} paymentObj
 * @param  {string}  plan
 * @param  {number}  seats
 * @param  {number}  quantity
 * @param  {string}  authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
export const submitOrgPayment = (
    orgId: string,
    token: string,
    paymentObj: Billing.OrgPaymentResponse,
    plan: string,
    seats: number,
    quantity: number,
    paidMembers: Array<string>,
    coupon: string,
    authToken: string
) => (dispatch: Redux.Dispatch) => {
    let body: Billing.OrgPaymentRequest = { plan: plan, seats: seats, quantity: quantity }
    let request = postOrgPayment

    if (token !== null) {
        body.token = token
    }

    if (coupon !== null) {
        body.coupon = coupon
    }

    if (paymentObj.customer) {
        request = patchOrgPayment
    }

    return request(orgId, body, authToken)
        .then(() => postOrgMembers(orgId, paidMembers, authToken))
        .then((paymentObj: Billing.OrgPaymentResponse) => {
            dispatch(setProcessing(false))
            dispatch(clearPaymentError())
            dispatch(paymentFormChanged(false))

            dispatch(setCoupon(''))
            dispatch(setCouponMessage(''))
            dispatch(setCouponAmountOff(0))
            dispatch(setCouponPercentOff(0))
            dispatch(setCouponInterval(null))

            dispatch(setSeats(paymentObj.seats_total))
            dispatch(setLevel(paymentObj.subscription_metadata.level))
            dispatch(setSubInterval(paymentObj.billing_interval))

            dispatch(receiveCard(
                paymentObj.cardholders_name,
                paymentObj.last_4,
                paymentObj.exp_month,
                paymentObj.exp_year,
                '\u2022\u2022\u2022',
                paymentObj.brand
            ))

            dispatch(setPaymentSuccess('Payment successfully processed.'))

            setTimeout(() => {
                dispatch(clearPaymentSuccess())
            }, 5000)

            return Promise.resolve()
        })
        .catch(error => dispatch(handleError(error)))
}

/**
 * @param  {string}  orgId
 * @param  {string} token
 * @param  {PaymentResponse} paymentObj
 * @param  {string}  plan
 * @param  {number}  seats
 * @param  {number}  quantity
 * @param  {string}  authToken
 * @return {Function} - (dispatch: Store.dispatch): Promise
 */
export const submitUserPayment = (
    token: string,
    paymentObj: Billing.UserPaymentResponse,
    plan: string,
    coupon: string,
    authToken: string
) => (dispatch: Redux.Dispatch) => {
    let body: Billing.UserPaymentRequest = { plan: plan }
    let request = postUserPayment

    if (token !== null) {
        body.token = token
    }

    if (coupon !== null) {
        body.coupon = coupon
    }

    if (paymentObj.customer) {
        request = patchUserPayment
    }

    return request(body, authToken)
        .then((paymentObj: Billing.UserPaymentResponse) => {
            dispatch(setProcessing(false))
            dispatch(clearPaymentError())
            dispatch(paymentFormChanged(false))

            dispatch(setCoupon(''))
            dispatch(setCouponMessage(''))
            dispatch(setCouponAmountOff(0))
            dispatch(setCouponPercentOff(0))
            dispatch(setCouponInterval(null))

            dispatch(setLevel(paymentObj.subscription_metadata.level))
            dispatch(setSubInterval(paymentObj.billing_interval))

            dispatch(receiveCard(
                paymentObj.cardholders_name,
                paymentObj.last_4,
                paymentObj.exp_month,
                paymentObj.exp_year,
                '\u2022\u2022\u2022',
                paymentObj.brand
            ))

            dispatch(setPaymentSuccess('Payment successfully processed.'))

            setTimeout(() => {
                dispatch(clearPaymentSuccess())
            }, 5000)

            return Promise.resolve()
        })
        .catch(error => dispatch(handleError(error)))
}
