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

/**
 * @module  actions/billing
 */

export const SET_BILLING_TYPE = 'billing/SET_BILLING_TYPE'
export const SET_PLANS = 'billing/SET_PLANS'
export const SET_LEVEL = 'billing/SET_LEVEL'
export const SET_ORIG_LEVEL = 'billing/SET_ORIG_LEVEL'
export const SET_SEATS = 'billing/SET_SEATS'
export const SET_SUB_INTERVAL = 'billing/SET_SUB_INTERVAL'
export const SET_ORIG_SUB_INTERVAL = 'billing/SET_ORIG_SUB_INTERVAL'
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

/**
 * Set the billing type to <code>'user'</code> or <code>'org'</code>, changes
 * available fields.
 * 
 * @param  {String} billingType - <code>'user'</code> or <code>'org'</code>.
 */
export const setBillingType = (billingType: string) => ({
    type: SET_BILLING_TYPE,
    billingType: billingType
})

/**
 * Set the available plans.
 * 
 * @param  {Billing.Plan[]} plans - Array of Plans to make available.
 */
export const setPlans = (plans: Array<Billing.Plan>) => ({
    type: SET_PLANS,
    plans: plans
})

/**
 * Set processing state. Prevents credit card information from being submitted twice.
 * 
 * @param  {Boolean} processing - Whether credit card information is processing.
 */
export const setProcessing = (processing: boolean) => ({
    type: SET_PROCESSING,
    processing: processing
})

/**
 * Set the plan level. Updates the available plans and current selection.
 * 
 * @param  {String} level - <code>'tour'</code> or <code>'pro'</code>.
 */
export const setLevel = (level: string) => ({
    type: SET_LEVEL,
    level: level
})

/**
 * Set original plan level. Used for determining upgrade/downgrade/cancel logic.
 * 
 * @param  {String} level - <code>'tour'</code> or <code>'pro'</code>.
 */
export const setOrigLevel = (level: string) => ({
    type: SET_ORIG_LEVEL,
    level: level
})

/**
 * Set the number of seats for an organization. Updates the number of fields
 * for organization seats.
 * 
 * @param  {Number} seats - Number of seats.
 */
export const setSeats = (seats: number) => ({
    type: SET_SEATS,
    seats: seats
})

/**
 * Set subscribiption billing interval to <code>'month'</code> or <code>'year'</code>.
 * 
 * @param  {String} interval - <code>'month'</code> or <code>'year'</code>.
 */
export const setSubInterval = (interval: 'month' | 'year') => ({
    type: SET_SUB_INTERVAL,
    interval: interval
})

/**
 * Set original subscribiption billing interval to <code>'month'</code> or <code>'year'</code>.
 * Used for determining upgrade/downgrade/cancel logic.
 * 
 * @param  {String} interval - <code>'month'</code> or <code>'year'</code>.
 */
export const setOrigSubInterval = (interval: 'month' | 'year') => ({
    type: SET_ORIG_SUB_INTERVAL,
    interval: interval
})

/**
 * Sets a coupon code.
 * 
 * @param  {String} coupon - Coupon code.
 */
export const setCoupon = (coupon: string) => ({
    type: SET_COUPON,
    coupon: coupon
})

/**
 * Sets a coupon code for valid/invalid coupons.
 * 
 * @param  {String} message - Coupon message.
 */
export const setCouponMessage = (message: string) => ({
    type: SET_COUPON_MESSAGE,
    message: message
})

/**
 * Applies the dollar amount off determined by the coupon. Pasing 0 clears the amount.
 * 
 * @param  {Number} amount - Dollar amount.
 */
export const setCouponAmountOff = (amount: number) => ({
    type: SET_COUPON_AMOUNT_OFF,
    amount: amount
})

/**
 * Applies the percentage off determined by the coupon. Pasing 0 clears the percentage.
 * 
 * @param  {Number} percent - Percentage.
 */
export const setCouponPercentOff = (percent: number) => ({
    type: SET_COUPON_PERCENT_OFF,
    percent: percent
})

/**
 * Restrict available plan intervals based on coupon metadta.
 * 
 * @param  {String} interval - <code>'month'</code> or <code>'year'</code>.
 */
export const setCouponInterval = (interval: 'month' | 'year') => ({
    type: SET_COUPON_INTERVAL,
    interval: interval
})

/**
 * Sets a user by <code>id</code> to seat number <code>index</code>.
 * 
 * @param  {Number} index - Seat number, 0-indexed.
 * @param  {String} id - User id.
 */
export const setSeatUser = (index: number, id: string) => ({
    type: SET_SEAT_USER,
    index: index,
    id: id
})

/**
 * Removes a user from seat number <code>index</code>.
 * 
 * @param  {Number} index - Seat number, 0-indexed.
 */
export const deleteSeatUser = (index: number) => ({
    type: DELETE_SEAT_USER,
    index: index
})

/**
 * Receive an Org JSON object from the API.
 * 
 * @param  {Any} json - JSON response from the API.
 */
export const receiveOrg = (json: any) => ({
    type: RECEIVE_ORG,
    json: json
})

/**
 * Receive an Org Users JSON object from the API.
 * 
 * @param  {Any} json - JSON response from the API.
 */
export const receiveOrgUsers = (json: any) => ({
    type: RECEIVE_ORG_USERS,
    json: json
})

/**
 * Reset the store to a blank state. Used for testing.
 */
export const resetStore = () => ({
    type: RESET
})

/**
 * Set credit card brand.
 * 
 * @param  {String} brand
 */
export const setCardBrand = (brand: string) => ({
    type: SET_CARD_BRAND,
    brand: brand
})

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

/**
 * Clear card details from state.
 */
export const clearCard = () => ({
    type: CLEAR_CARD
})

/**
 * Set the form to dirty so we know to save it.
 * 
 * @param  {Boolean} changed
 */
export const paymentFormChanged = (changed: boolean) => ({
    type: PAYMENT_FORM_CHANGED,
    changed: changed
})

/**
 * Display payment status success message.
 * 
 * @param  {String} message - Message to display.
 */
export const setPaymentSuccess = (message: string) => ({
    type: SET_PAYMENT_SUCCESS,
    message: message
})

/**
 * Clear payment success message.
 */
export const clearPaymentSuccess = () => ({
    type: CLEAR_PAYMENT_SUCCESS
})

/**
 * Display payment status error message.
 * 
 * @param  {String} message - Message to display.
 */
export const setPaymentError = (message: string) => ({
    type: SET_PAYMENT_ERROR,
    message: message
})

/**
 * Clear payment error message.
 */
export const clearPaymentError = () => ({
    type: CLEAR_PAYMENT_ERROR
})

export class PaymentError {
    message: string;

    /**
     * @constructs PaymentError
     * @description Used for relaying payment error messages.
     * 
     * @param  {string} message
     */
    constructor(message: string) {
        this.message = message
    }
}

export class NetworkError {
    message: string;

    /**
     * @constructs NetworkError
     * @description Used for relaying network error messages.
     * 
     * @param  {string} message
     */
    constructor(message: string) {
        this.message = message
    }
}

/**
 * Fetch org payment users from the API.
 * 
 * @param  {String}  orgId
 * @param  {String}  authToken
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
 * Fetch org payment info from the API.
 * 
 * @param  {String}  orgId
 * @param  {String}  authToken
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
                    dispatch(setOrigLevel(json.subscription_metadata.level))
                    dispatch(setOrigSubInterval(json.billing_interval))

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
 * Fetch user payment info from the API.
 * 
 * @param  {String}  authToken
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
                    dispatch(setOrigLevel(json.subscription_metadata.level))
                    dispatch(setOrigSubInterval(json.billing_interval))

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
 * Fetch available plans from the API.
 * 
 * @param  {String} authToken
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

                if (level === 'Tour') {
                    level = 'Premium'
                }

                if (price) {
                    plan.title = `${level} - \$${price}/month`
                } else {
                    plan.title = `${level} - Free`
                }

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
                dispatch(setCouponMessage('billing.coupon_applied'))

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
                dispatch(setCouponMessage('billing.coupon_invalid'))
                dispatch(setCouponAmountOff(0))
                dispatch(setCouponPercentOff(0))
                dispatch(setCouponInterval(null))
            }

            return Promise.resolve
        })

/**
 * Create CC token with Stripe.
 *
 * @param  {String}  cc
 * @param  {String}  cvc
 * @param  {Number}  month
 * @param  {Number}  year
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
 * Fetch org payment from the API.
 * 
 * @param  {String}  orgId
 * @param  {String}  authToken
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
 * Patch org payment to the API.
 * 
 * @param  {String}  orgId
 * @param  {Payment} body
 * @param  {String}  authToken
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
 * Post org payment to the API.
 * 
 * @param  {String}  orgId
 * @param  {Payment} body
 * @param  {String}  authToken
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
 * Post paying org members to the API.
 * 
 * @param  {String}        orgId
 * @param  {Array<string>} members
 * @param  {String}        authToken
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
 * Fetch user payment from the API.
 * 
 * @param  {String}  authToken
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
 * Patch user payment to the API.
 * 
 * @param  {Payment} body
 * @param  {String}  authToken
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
 * Post user payment to the API.
 * 
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
 * Handle NetworkError or Payment error.
 * 
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

            dispatch(setPaymentSuccess('Updated membership.'))

            setTimeout(() => {
                dispatch(clearPaymentSuccess())
            }, 5000)

            return Promise.resolve()
        })
        .catch(error => dispatch(handleError(error)))
}

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

            dispatch(setPaymentSuccess('Updated membership.'))

            setTimeout(() => {
                dispatch(clearPaymentSuccess())
            }, 5000)

            return Promise.resolve()
        })
        .catch(error => dispatch(handleError(error)))
}
