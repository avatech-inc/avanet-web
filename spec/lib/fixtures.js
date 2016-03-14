
export const ORG = { _id: 'orgtest', name: 'Testing' }

export const ORGMEMBERS = [{
    _id: 'orgusertest',
    user: {
        _id: 'orgusertest',
        fullName: 'Testing'
    }
}]

export const ORGPAYMENT = {
    created: 'Tue, 23 Feb 2016 23:43:10 GMT',
    id: 'orgtest',
    name: 'Testing'
}

export const ORGPAYMENTRESPONSE = {
    created: 'Tue, 23 Feb 2016 23:43:10 GMT',
    id: 'orgtest',
    name: 'Testing',
    customer: true,
    paid_members_hacky: ORGMEMBERS,
    seats_available: 0,
    seats_total: 5,
    seats_used: 5,
    billing_interval: 'year',
    exp_month: 2,
    exp_year: 2020,
    last_4: '4242',
    subscription_metadata: {
        level: 'tour'
    }
}

export const USERPAYMENT = {
    created: 'Tue, 23 Feb 2016 23:43:10 GMT',
    name: 'Testing'
}

export const USERPAYMENTRESPONSE = {
    created: 'Tue, 23 Feb 2016 23:43:10 GMT',
    name: 'Testing',
    customer: true,
    billing_interval: 'year',
    exp_month: 2,
    exp_year: 2020,
    last_4: '4242',
    subscription_metadata: {
        level: 'tour'
    }
}

/* eslint-disable max-len */
export const PLANSRESPONSE = { results: [
    { amount: 6000, created: 1456426075, currency: 'usd', id: 'tour-yearly-usd', interval: 'year', interval_count: 1, livemode: false, metadata: { level: 'tour' }, name: 'Avanet Tour Yearly USD', object: 'plan', statement_descriptor: null, trial_period_days: null },
    { amount: 900, created: 1456426045, currency: 'usd', id: 'tour-monthly-usd', interval: 'month', interval_count: 1, livemode: false, metadata: { level: 'tour' }, name: 'Avanet Tour Monthly USD', object: 'plan', statement_descriptor: null, trial_period_days: null },
    { amount: 1700, created: 1444515260, currency: 'usd', id: 'pro-monthly-usd', interval: 'month', interval_count: 1, livemode: false, metadata: { level: 'pro' }, name: 'Avanet Pro Monthly USD', object: 'plan', statement_descriptor: 'AVANET', trial_period_days: null },
    { amount: 12000, created: 1444515233, currency: 'usd', id: 'pro-yearly-usd', interval: 'year', interval_count: 1, livemode: false, metadata: { level: 'pro' }, name: 'Avanet Pro Yearly USD', object: 'plan', statement_descriptor: 'AVANET', trial_period_days: null },
] }
/* eslint-enable max-len */

export const STRIPE = {
    id: 'tok_17kjkRAP9aZuwv8r1fiVRRsz',
    object: 'token',
    card: {
        id: 'card_17kjkRAP9aZuwv8riBHzrH5s',
        object: 'card',
        address_city: null,
        address_country: null,
        address_line1: null,
        address_line1_check: null,
        address_line2: null,
        address_state: null,
        address_zip: null,
        address_zip_check: null,
        brand: 'Visa',
        country: 'US',
        cvc_check: 'unchecked',
        dynamic_last4: null,
        exp_month: 6,
        exp_year: 2018,
        funding: 'credit',
        last4: '4242',
        metadata: {},
        name: null,
        tokenization_method: null
    },
    client_ip: '24.11.61.137',
    created: 1456962679,
    livemode: false,
    type: 'card',
    used: false
}

export const ORGPAYREQUEST = {
    plan: 'pro-monthly-usd',
    seats: 5,
    quantity: 5,
    token: 'token'
}

export const USERPAYREQUEST = {
    plan: 'pro-monthly-usd',
    token: 'token'
}

export const APIMOCKS = (url, opts) => {
    switch (url) {

    case 'http://mock/orgs/orgtest/members':
        return ORGMEMBERS

    case 'http://mock/organizations/orgtest/members/':
        return ORGPAYMENTRESPONSE

    case 'http://mock/organizations/orgtest/':
        switch (opts.method) {

        case 'POST':
        case 'PATCH':
            return ORGPAYMENTRESPONSE
        default:
            return ORGPAYMENT
        }

        break
    case 'http://mock/organizations/nonexistent/':
        return {
            status: 404,
            body: { message: 'Not Found' }
        }
    case 'http://mock/organizations/badrequest/':
        return {
            status: 400,
            body: { message: 'Test Error' }
        }
    case 'http://mock/user/':
        switch (opts.method) {

        case 'POST':
        case 'PATCH':
            return USERPAYMENTRESPONSE
        default:
            return USERPAYMENT
        }

        break
    case 'http://mock/plans/':
        return PLANSRESPONSE

    default:
        throw 'Unhandled URL: ' + url
    }
}
