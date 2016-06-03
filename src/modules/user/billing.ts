/* eslint-disable spaced-comment */

/// <reference path='../../definitions/angular.d.ts' />
/// <reference path='../../definitions/lodash.d.ts' />
/// <reference path='../../js/types/billing.ts' />

import { range } from 'lodash'

import { CardRecord, OrgRecord, billingStore } from '../../js/stores/billing'
import * as actions from '../../js/actions/billing'

const _ = { range: range }

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
export const unselectedItems = (
    items: Array<Billing.Ided>,
    selected: Array<string>,
    selectionIndex: number
) => items.filter(
    item => (item.id === selected[selectionIndex] || selected.indexOf(item.id) === -1)
)

/**
 * Returns an array from an array of strings `items` which are not undefined.
 *
 * @param  {Array<string>} items
 * @return {Array<string>}
 */
export const filterUndefinedItems = (items: Array<string>) =>
    items.filter(item => typeof item !== 'undefined')

/**
 * Returns a formatted credit card number with only the last 4 digits displayed.
 * 
 * @param  {string} brand
 * @param  {string} last4
 * @return {string}
 */
export const formatLast4 = (last4: string, brand: string): string => {
    if (brand === 'Visa' || brand === 'MasterCard' || brand === 'Discover' || brand === 'JCB') {
        return '\u2022\u2022\u2022\u2022 ' +
               '\u2022\u2022\u2022\u2022 ' +
               '\u2022\u2022\u2022\u2022 ' +
               last4
    } else if (brand === 'American Express') {
        return '\u2022\u2022\u2022\u2022 ' +
               '\u2022\u2022\u2022\u2022\u2022\u2022 ' +
               '\u2022' +
               last4
    } else if (brand === 'Diners Club') {
        return '\u2022\u2022\u2022\u2022 ' +
               '\u2022\u2022\u2022\u2022\u2022\u2022 ' +
               last4
    }

    return '\u2022\u2022\u2022\u2022 ' +
           '\u2022\u2022\u2022\u2022 ' +
           '\u2022\u2022\u2022\u2022 ' +
           last4
}

/**
 * Returns the Font-Awesome icon string for Stripe card brand strings.
 *
 * @param {strip} stripeBrand
 * @returns {string}
 */
export const cardBrandIcon = (stripeBrand: string): string => {
    switch (stripeBrand) {

    case 'Visa':
        return 'visa'

    case 'MasterCard':
        return 'mastercard'

    case 'American Express':
        return 'amex'

    case 'Discover':
        return 'discover'

    case 'Diners Club':
        return 'diners-club'

    case 'JCB':
        return 'jcb'

    default:
        return ''
    }
}

/**
 * Returns an input mask for Stripe card brand strings.
 *
 * @param {strip} stripeBrand
 * @returns {string}
 */
export const cardBrandMask = (stripeBrand: string): string => {
    switch (stripeBrand) {

    case 'Visa':
        return '8888 8888 8888 8888'

    case 'MasterCard':
        return '8888 8888 8888 8888'

    case 'American Express':
        return '8888 888888 88888'

    case 'Discover':
        return '8888 8888 8888 8888'

    case 'Diners Club':
        return '8888 888888 8888'

    case 'JCB':
        return '8888 8888 8888 8888'

    default:
        return '8888 8888 8888 8888'
    }
}

export const Billing = [
    '$scope',
    '$http',
    '$stateParams',
    'Global',

    (
        $scope: Billing.Scope,
        $http: angular.IHttpService,
        $stateParams: Billing.StateParams,
        global: any   // todo: add some definitions/sanity to the globals
    ) => {
        const authToken: string = (<any>$http.defaults.headers.common)['Auth-Token']

        let state = billingStore.getState()
        let props = {
            seatArray: _.range(1, 50),
            months: _.range(1, 13),
            years: _.range(new Date().getFullYear(), new Date().getFullYear() + 50),
            orgs: global.user.organizations.map((org: any) => ({ id: org._id, name: org.name }))
        }

        // Display something besides $NaN/ to get the UI up and running.
        // Other $scope variables don't display directly, so they can load asynchronously.
        $scope.interval = 'year'
        $scope.total = 0

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
        }

        let update = () => {
            state = billingStore.getState()

            let billingType: 'user' | 'org' = state.get('type')
            let level: string = state.get('level')
            let origLevel: string = state.get('origLevel')
            let seats: number = state.get('seats')
            let interval: 'month' | 'year' = state.get('interval')
            let coupon: string = state.get('coupon')
            let couponMessage: string = state.get('couponMessage')
            let couponAmountOff: number = state.get('couponAmountOff')
            let couponPercentOff: number = state.get('couponPercentOff')
            let couponInterval: 'month' | 'year' = state.get('couponInterval')
            let success: string = state.get('success')
            let error: string = state.get('error')
            let processing: boolean = state.get('processing')
            let card: CardRecord = state.get('card')
            let showBilling = true
            let saveMessage = "billing.start_membership"

            let seatUsers: Array<string> = state.get('seatUsers').toArray()
            let org: OrgRecord = state.get('org')
            let orgUsers: Array<Billing.User> = []

            if (billingType === 'org') {
                if (org !== null) {
                    orgUsers = org.get('users').toArray().map((user: Billing.User) => ({
                        id: user.id,
                        fullName: user.fullName
                    }))
                }
            }

            let planObj: Billing.Plan = state.get('plans')
                .find((plan: Billing.Plan) => (
                    plan.interval === interval &&
                    plan.metadata.level === level
                ))

            let total = 0

            if (planObj) {
                total = planObj.amountMonth * seats

                if (interval === 'year') {
                    total = planObj.amountMonth * seats * 12

                    $scope.savings = null
                } else if (interval === 'month') {
                    let planYearObj: Billing.Plan = state.get('plans')
                        .find((plan: Billing.Plan) => (
                            plan.interval === 'year' &&
                            plan.metadata.level === level
                        ))

                    $scope.savings = Math.round((1 - (planYearObj.amountMonth / planObj.amountMonth)) * 100)
                }

                if (couponAmountOff) {
                    total = total - couponAmountOff
                } else if (couponPercentOff) {
                    total = total * (1 - (couponPercentOff / 100))
                }
            }

            let brand: string = card.get('brand')

            if (card.get('last_4') !== null) {
                let last4: string = card.get('last_4')

                if (last4 && last4.length === 4) {
                    last4 = formatLast4(last4, brand)
                }

                $scope.name = card.get('name')
                $scope.cc = last4
                $scope.exp_month = card.get('exp_month')
                $scope.exp_year = card.get('exp_year')
                $scope.cvc = card.get('cvc')

                billingStore.dispatch(actions.clearCard())
            }

            if (origLevel !== 'rec' && total === 0) {
                showBilling = false
            }

            if (origLevel === 'rec') {
                saveMessage = "billing.start_membership"
            } else if (origLevel === 'tour' && level === 'pro') {
                saveMessage = "billing.upgrade_membership"
            } else if (origLevel === 'pro' && level === 'tour') {
                saveMessage = "billing.downgrade_membership"
            } else if (origLevel === level) {
                saveMessage = "billing.save_membership"
            }

            $scope.plans = state.get('plans')
                .filter((plan: Billing.Plan) => plan.interval === $scope.interval)
                .filter((plan: Billing.Plan) => (
                    plan.metadata.level === 'pro' ||
                    billingType !== 'org'
                ))
                .toArray()

            $scope.ccFormat = cardBrandMask(brand)
            $scope.brandlogo = cardBrandIcon(brand)
            $scope.billingType = billingType
            $scope.level = level
            $scope.seats = seats
            $scope.interval = interval
            $scope.coupon = coupon
            $scope.couponMessage = couponMessage
            $scope.couponInterval = couponInterval
            $scope.total = total
            $scope.error = error
            $scope.success = success
            $scope.processing = processing
            $scope.showBilling = showBilling
            $scope.saveMessage = saveMessage

            if (billingType === 'org') {
                $scope.seatUsers = seatUsers
                $scope.orgUsers = orgUsers
            }
        }

        $scope.props = props
        $scope.$evalAsync(update)

        billingStore.subscribe(() => $scope.$evalAsync(update))

        let stateType = 'user'

        if (typeof $stateParams.orgId !== 'undefined') {
            stateType = 'org'
        }

        billingStore.dispatch(actions.setCoupon(''))
        billingStore.dispatch(actions.setCouponMessage(''))
        billingStore.dispatch(actions.setCouponAmountOff(0))
        billingStore.dispatch(actions.setCouponPercentOff(0))
        billingStore.dispatch(actions.setCouponInterval(null))

        billingStore.dispatch(actions.setBillingType(stateType))
        billingStore.dispatch(actions.fetchPlans(authToken))

        if (stateType === 'org') {
            billingStore.dispatch(actions.fetchOrg($stateParams.orgId, authToken))
        } else if (stateType === 'user') {
            billingStore.dispatch(actions.setSeats(1))
            billingStore.dispatch(actions.fetchUser(authToken))
        }

        $scope.getUnselectedUsers = index => unselectedItems(
            $scope.orgUsers,
            $scope.seatUsers,
            index
        )

        $scope.changeLevel = level => billingStore.dispatch(actions.setLevel(level))
        $scope.changeOrg = org => billingStore.dispatch(actions.fetchOrg(org.id, authToken))
        $scope.changeSeats = seats => billingStore.dispatch(actions.setSeats(seats))

        $scope.changeInterval = interval => {
            billingStore.dispatch(actions.setSubInterval(interval))
        }

        $scope.setSeatUser = (index, id) => billingStore.dispatch(actions.setSeatUser(index, id))
        $scope.deleteSeatUser = index => billingStore.dispatch(actions.deleteSeatUser(index))

        $scope.changeCoupon = coupon => {
            billingStore.dispatch(actions.setCoupon(coupon))

            if (coupon === '') {
                billingStore.dispatch(actions.setCouponMessage(''))
                billingStore.dispatch(actions.setCouponAmountOff(0))
                billingStore.dispatch(actions.setCouponPercentOff(0))
                billingStore.dispatch(actions.setCouponInterval(null))
            } else {
                billingStore.dispatch(actions.fetchCoupon(coupon, authToken))
            }
        }

        $scope.changePayment = (value, field) => {
            // Determine card type
            if (field === 'cc') {
                let cc = value || ''

                if (cc.indexOf('\u2022') === -1) {
                    billingStore.dispatch(actions.setCardBrand(Stripe.card.cardType(cc)))
                }
            }

            // Clear payment information when changing for the first time
            if (!state.get('changed')) {
                let emptyCard = [
                    field === 'name' ? value : '',
                    field === 'cc' ? value : '',
                    field === 'exp_month' ? value : 0,
                    field === 'exp_year' ? value : 0,
                    field === 'cvc' ? value : '',
                    ''
                ]

                billingStore.dispatch(actions.receiveCard.apply(this, emptyCard))
            }

            billingStore.dispatch(actions.clearPaymentError())
            billingStore.dispatch(actions.paymentFormChanged(true))
        }

        $scope.cancelBilling = () => {
            let billingType: 'user' | 'org' = state.get('type')
            let planObj: Billing.Plan = state.get('plans')
                .find((plan: Billing.Plan) => (
                    plan.interval === state.get('interval') &&
                    plan.metadata.level === state.get('level')
                ))

            if (state.get('processing')) return

            billingStore.dispatch(actions.setProcessing(true))
            billingStore.dispatch(actions.clearPaymentError())

            // Resolve the Stripe token to null unless the payment form has changed.
            let tokenPromise = Promise.resolve(null)

            Promise.all([
                tokenPromise,
                actions.fetchUserPayment(authToken)
            ]).then((values: [string, Billing.UserPaymentResponse]) =>
                billingStore.dispatch(actions.submitUserPayment(
                    values[0],
                    values[1],
                    planObj.id,
                    null,
                    authToken
                ))).catch(error => billingStore.dispatch(actions.handleError(error)))
        }

        $scope.saveBilling = (name, cc, cvc, expMonth, expYear) => {
            let billingType: 'user' | 'org' = state.get('type')
            let planObj: Billing.Plan = state.get('plans')
                .find((plan: Billing.Plan) => (
                    plan.interval === state.get('interval') &&
                    plan.metadata.level === state.get('level')
                ))
            let coupon: string = state.get('coupon')

            if (state.get('processing')) return

            billingStore.dispatch(actions.setProcessing(true))
            billingStore.dispatch(actions.clearPaymentError())

            // Resolve the Stripe token to null unless the payment form has changed.
            let tokenPromise = Promise.resolve(null)

            if (state.get('changed')) {
                tokenPromise = actions.createToken(
                    name,
                    cc,
                    cvc,
                    parseInt(expMonth, 10),
                    parseInt(expYear, 10)
                )
            }

            if (billingType === 'org') {
                let orgId: string = state.get('org').get('id')
                let seats: number = state.get('seats')
                let paidMembers: Array<string> = filterUndefinedItems(state.get('seatUsers').toArray()) // eslint-disable-line max-len

                Promise.all([
                    tokenPromise,
                    actions.fetchOrgPayment(orgId, authToken)
                ]).then((values: [string, Billing.OrgPaymentResponse]) =>
                    billingStore.dispatch(actions.submitOrgPayment(
                        orgId,
                        values[0],
                        values[1],
                        planObj.id,
                        seats,
                        paidMembers.length,
                        paidMembers,
                        coupon,
                        authToken
                    ))).catch(error => billingStore.dispatch(actions.handleError(error)))
            } else if (billingType === 'user') {
                Promise.all([
                    tokenPromise,
                    actions.fetchUserPayment(authToken)
                ]).then((values: [string, Billing.UserPaymentResponse]) =>
                    billingStore.dispatch(actions.submitUserPayment(
                        values[0],
                        values[1],
                        planObj.id,
                        coupon,
                        authToken
                    ))).catch(error => billingStore.dispatch(actions.handleError(error)))
            }
        }
    }
]
