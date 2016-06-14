/* global describe, it, expect, beforeAll, afterAll, beforeEach, afterEach */

import fetchMock from 'fetch-mock'

import { unselectedItems, filterUndefinedItems } from '../../src/modules/user/billing'
import { billingStore } from '../../src/js/stores/billing'
import * as fixtures from './fixtures'
import * as actions from '../../src/js/actions/billing'

describe('unselectedItems', () => {
    it('returns all items when no items are selected', () => {
        let items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
        let selection = []

        expect(unselectedItems(items, selection, 0)).toEqual([
            { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }
        ])
    })

    it('returns only the current selection when all items are selected', () => {
        let items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
        let selection = ['a', 'b', 'c', 'd']

        expect(unselectedItems(items, selection, 0)).toEqual([{ id: 'a' }])
    })

    it('returns the unselected items and the current selection', () => {
        let items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
        let selection = ['a', 'b']

        expect(unselectedItems(items, selection, 1)).toEqual([
            { id: 'b' }, { id: 'c' }, { id: 'd' }
        ])
    })
})

describe('filterUndefinedItems', () => {
    it('returns all items that are not undefined', () => {
        expect(filterUndefinedItems([undefined, undefined, 'string', '0', ''])).toEqual(['string', '0', ''])
    })
})

describe('billing api', () => {
    beforeAll(() => {
        fetchMock.mock(url => true, fixtures.APIMOCKS)
    })

    afterEach(() => {
        fetchMock.reset()
    })

    it('fetches an organization payment information', done => {
        actions.fetchOrgPayment('orgtest', 'token').then(response => {
            expect(response.id).toBe('orgtest')

            done()
        })
    })

    it('posts an organization payment information', done => {
        actions.postOrgPayment('orgtest', fixtures.ORGPAYREQUEST, 'token').then(response => {
            expect(response.customer).toBe(true)

            done()
        })
    })

    it('patches an organization payment information', done => {
        actions.patchOrgPayment('orgtest', fixtures.ORGPAYREQUEST, 'token').then(response => {
            expect(response.customer).toBe(true)

            done()
        })
    })

    it('raises an error when the organization does not exist', done => {
        actions.fetchOrgPayment('nonexistent', fixtures.ORGPAYREQUEST, 'token').catch(error => {
            expect(error.message).toBe('Not Found')

            done()
        })
    })

    it('raises an error when the posted organization does not exist', done => {
        actions.postOrgPayment('nonexistent', fixtures.ORGPAYREQUEST, 'token').catch(error => {
            expect(error.message).toBe('Not Found')

            done()
        })
    })

    it('raises an error when the patched organization does not exist', done => {
        actions.patchOrgPayment('nonexistent', fixtures.ORGPAYREQUEST, 'token').catch(error => {
            expect(error.message).toBe('Not Found')

            done()
        })
    })

    it('raises an error when the org api returns a bad response', done => {
        actions.fetchOrgPayment('badrequest', fixtures.ORGPAYREQUEST, 'token').catch(error => {
            expect(error.message).toBe('Test Error')

            done()
        })
    })

    it('raises an error when the org api returns a bad response on post', done => {
        actions.postOrgPayment('badrequest', fixtures.ORGPAYREQUEST, 'token').catch(error => {
            expect(error.message).toBe('Test Error')

            done()
        })
    })

    it('raises an error when the org api returns a bad response on patch', done => {
        actions.patchOrgPayment('badrequest', fixtures.ORGPAYREQUEST, 'token').catch(error => {
            expect(error.message).toBe('Test Error')

            done()
        })
    })

    it('fetches a user payment information', done => {
        actions.fetchUserPayment('token').then(response => {
            expect(response.name).toBe('Testing')

            done()
        })
    })

    it('posts an user payment information', done => {
        actions.postUserPayment(fixtures.USERPAYREQUEST, 'token').then(response => {
            expect(response.customer).toBe(true)

            done()
        })
    })

    it('patches an user payment information', done => {
        actions.patchUserPayment(fixtures.USERPAYREQUEST, 'token').then(response => {
            expect(response.customer).toBe(true)

            done()
        })
    })
})

describe('billing store', () => {
    let state
    let unsubscribe

    beforeAll(() => {
        unsubscribe = billingStore.subscribe(() => state = billingStore.getState())

        fetchMock.mock(url => true, fixtures.APIMOCKS)
    })

    afterAll(() => {
        unsubscribe()
    })

    beforeEach(() => {
        billingStore.dispatch(actions.resetStore())
    })

    afterEach(() => {
        fetchMock.reset()
    })

    it('sets the level', () => {
        billingStore.dispatch(actions.setLevel('pro'))

        expect(state.get('level')).toBe('pro')
    })

    it('sets the number of seats', () => {
        billingStore.dispatch(actions.setSeats(3))

        expect(state.get('seats')).toBe(3)
        expect(state.get('seatUsers').size).toBe(3)
    })

    it('sets the interval', () => {
        billingStore.dispatch(actions.setSubInterval('year'))

        expect(state.get('interval')).toBe('year')
    })

    it('sets seats as undefined by default', () => {
        billingStore.dispatch(actions.setSeats(3))

        expect(state.get('seatUsers').toArray()).toEqual([undefined, undefined, undefined])
    })

    it('sets a user to a seat by index', () => {
        billingStore.dispatch(actions.setSeats(3))
        billingStore.dispatch(actions.setSeatUser(2, 'test'))

        expect(state.get('seatUsers').toArray()).toEqual([undefined, undefined, 'test'])
    })

    it('clips seatUsers when seats is reduced', () => {
        billingStore.dispatch(actions.setSeats(3))
        billingStore.dispatch(actions.setSeatUser(2, 'test'))
        billingStore.dispatch(actions.setSeats(2))

        expect(state.get('seatUsers').toArray()).toEqual([undefined, undefined])
    })

    it('fails to set a user to a seat when the index is greater than seats', () => {
        billingStore.dispatch(actions.setSeats(2))
        billingStore.dispatch(actions.setSeatUser(3, 'test'))

        expect(state.get('seatUsers').toArray()).toEqual([undefined, undefined])
    })

    it('shifts seats up when user seat is deleted', () => {
        billingStore.dispatch(actions.setSeats(2))
        billingStore.dispatch(actions.setSeatUser(1, 'test'))

        expect(state.get('seatUsers').toArray()).toEqual([undefined, 'test'])

        billingStore.dispatch(actions.deleteSeatUser(0))

        expect(state.get('seatUsers').toArray()).toEqual(['test', undefined])
    })

    it('sets the seats to the number of new users', done => {
        actions.fetchOrgUsers('orgtest', [], 'token')(billingStore.dispatch).then(() => {
            expect(state.get('seats')).toBe(1)

            done()
        })
    })

    it('defaults the org to null', () => {
        expect(state.get('org')).toBe(null)
    })

    it('ignores received users before organization is set', () => {
        billingStore.dispatch(actions.receiveOrgUsers(fixtures.ORGMEMBERS))

        expect(state.get('org')).toBe(null)
    })

    it('sets the org with empty users when received', () => {
        billingStore.dispatch(actions.receiveOrg(fixtures.ORG))

        expect(state.get('org').get('name')).toBe('Testing')
        expect(state.get('org').get('users').toArray()).toEqual([])
    })

    it('resets the state when new non-customer org is received', done => {
        billingStore.dispatch(actions.setLevel('tour'))
        billingStore.dispatch(actions.setSubInterval('month'))

        actions.fetchOrg('orgtest')(billingStore.dispatch).then(() => {
            expect(state.get('level')).toBe('pro')
            expect(state.get('interval')).toBe('year')
            expect(state.get('org').get('users').toArray()).toEqual([])

            done()
        })
    })

    it('sets the org users when received', () => {
        billingStore.dispatch(actions.receiveOrg(fixtures.ORG))
        billingStore.dispatch(actions.receiveOrgUsers(fixtures.ORGMEMBERS.map(user => ({ id: user._id, fullName: user.user.fullName }))))

        expect(state.get('org').get('users').toArray()).toEqual([
            { id: 'orgusertest', fullName: 'Testing' }
        ])
    })

    it('replaces the org when a new org is fetched', done => {
        actions.fetchOrg('orgtest', 'token')(billingStore.dispatch).then(() => {
            expect(state.get('org').get('name')).toBe('Testing')
            expect(state.get('org').get('users').toArray()).toEqual([])

            done()
        })
    })

    it('replaces the org users when new users are fetched', done => {
        billingStore.dispatch(actions.receiveOrg(fixtures.ORG))

        actions.fetchOrgUsers('orgtest', [], 'token')(billingStore.dispatch).then(() => {
            expect(state.get('org').get('name')).toBe('Testing')
            expect(state.get('org').get('users').toArray()).toEqual([
                { id: 'orgusertest', fullName: 'Testing' }
            ])

            done()
        })
    })

    it('posts a new payment when org customer is false', done => {
        actions.submitOrgPayment(
            'orgtest',
            'tok_17kjkRAP9aZuwv8r1fiVRRsz',
            fixtures.ORGPAYMENT,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(fetchMock.calls()['matched'][0][1].method).toBe('POST')

            done()
        })
    })

    it('patches a payment when org customer is true', done => {
        actions.submitOrgPayment(
            'orgtest',
            'tok_17kjkRAP9aZuwv8r1fiVRRsz',
            fixtures.ORGPAYMENTRESPONSE,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(fetchMock.calls()['matched'][0][1].method).toBe('PATCH')

            done()
        })
    })

    it('excludes the token when token is null', done => {
        actions.submitOrgPayment(
            'orgtest',
            null,
            fixtures.ORGPAYMENTRESPONSE,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(JSON.parse(fetchMock.lastOptions().body).token).toBe(undefined)

            done()
        })
    })

    it('sets an error when posting a new payment to a nonexistent org', done => {
        actions.submitOrgPayment(
            'nonexistent',
            'tok_17kjkRAP9aZuwv8r1fiVRRsz',
            fixtures.ORGPAYMENT,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(state.get('error')).toBe('Not Found')

            done()
        })
    })

    it('sets an error when patching a payment to a nonexistent org', done => {
        actions.submitOrgPayment(
            'nonexistent',
            'tok_17kjkRAP9aZuwv8r1fiVRRsz',
            fixtures.ORGPAYMENTRESPONSE,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(state.get('error')).toBe('Not Found')

            done()
        })
    })

    it('finishes processing when the request completes', done => {
        actions.submitOrgPayment(
            'orgtest',
            'tok_17kjkRAP9aZuwv8r1fiVRRsz',
            fixtures.ORGPAYMENT,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(state.get('processing')).toBe(false)

            done()
        })
    })

    it('sets an error', () => {
        billingStore.dispatch(actions.setPaymentError('error'))

        expect(state.get('error')).toBe('error')
    })

    it('clears an error', () => {
        billingStore.dispatch(actions.setPaymentError('error'))
        billingStore.dispatch(actions.clearPaymentError())

        expect(state.get('error')).toBe(null)
    })

    it('clears any errors when the request succeeds', done => {
        expect(state.get('error')).toBe(null)

        billingStore.dispatch(actions.setPaymentError('error'))

        expect(state.get('error')).toBe('error')

        actions.submitOrgPayment(
            'orgtest',
            'tok_17kjkRAP9aZuwv8r1fiVRRsz',
            fixtures.ORGPAYMENT,
            'pro-monthly-usd',
            5,
            0,
            [],
            'token'
        )(billingStore.dispatch).then(() => {
            expect(state.get('error')).toBe(null)

            done()
        })
    })

    it('sets last 4, year, month, and cvc', () => {
        billingStore.dispatch(actions.receiveCard('Testing', '4023', 1, 2018, '123'))

        expect(state.get('card').get('name')).toBe('Testing')
        expect(state.get('card').get('last_4')).toBe('4023')
        expect(state.get('card').get('exp_month')).toBe(1)
        expect(state.get('card').get('exp_year')).toBe(2018)
        expect(state.get('card').get('cvc')).toBe('123')
    })

    it('clears last 4, year, month, and cvc', () => {
        billingStore.dispatch(actions.receiveCard('Testing', '4023', 1, 2018, '123'))
        billingStore.dispatch(actions.clearCard())

        expect(state.get('card').get('name')).toBe(null)
        expect(state.get('card').get('last_4')).toBe(null)
        expect(state.get('card').get('exp_month')).toBe(null)
        expect(state.get('card').get('exp_year')).toBe(null)
        expect(state.get('card').get('cvc')).toBe(null)
    })

    it('allows last 4, year, month, and cvc to be blank', () => {
        billingStore.dispatch(actions.receiveCard('', '', 0, 0, ''))

        expect(state.get('card').get('name')).toBe('')
        expect(state.get('card').get('last_4')).toBe('')
        expect(state.get('card').get('exp_month')).toBe(0)
        expect(state.get('card').get('exp_year')).toBe(0)
        expect(state.get('card').get('cvc')).toBe('')
    })

    it('fetches a list of plans', done => {
        actions.fetchPlans('token')(billingStore.dispatch).then(() => {
            expect(state.get('plans').get(0).amount).toBe(6000)
            expect(state.get('plans').get(0).amountMonth).toBe(500)
            expect(state.get('plans').get(0).title).toBe('Premium - $5/month')

            done()
        })
    })
})
















