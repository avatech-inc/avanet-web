
/// <reference path='../../../node_modules/immutable/dist/immutable.d.ts'/>
/// <reference path='../../definitions/immutable-overrides.d.ts'/>

module Billing {
    export interface Ided {
        id: string;
    }

    export interface User {
        id: string;
        fullName: string;
    }

    export interface CardAction {
        type: string;
        name?: string;
        last_4?: string;
        exp_month?: number;
        exp_year?: number;
        cvc?: string;
        brand?: string;
    }

    export interface FetchAction {
        type: string;
        token?: string;
        json?: any;
    }

    export interface MessageAction {
        type: string;
        message?: string;
    }

    export interface BillingAction {
        type: string;
        plans?: Array<Plan>;
        billingType?: string;
        level?: string;
        seats?: number;
        interval?: string;
        index?: number;
        id?: string;
        message?: string;
        processing?: boolean;
        name?: string;
        last_4?: string;
        exp_month?: number;
        exp_year?: number;
        cvc?: string;
        brand?: string;
        changed?: boolean;
    }

    export interface PaymentRequest {
        plan: string;
        token?: string;
    }

    export interface OrgPaymentRequest extends PaymentRequest {
        seats: number;
        quantity: number;
    }

    export interface UserPaymentRequest extends PaymentRequest {
    }

    interface PlanMetadata {
        level: string;
    }

    export interface PaymentResponse {
        id: string;
        customer: boolean;
        billing_interval: 'month' | 'year';
        subscription_metadata: PlanMetadata;
        cardholders_name: string;
        last_4: string;
        exp_month: number;
        exp_year: number;
        brand: string;
        paid_members_hacky: Array<string>;
    }

    export interface UserPaymentResponse extends PaymentResponse {
        fullName: string;
        email: string;
        email_normalized: string;
        userType: string;
    }

    export interface OrgPaymentResponse extends PaymentResponse {
        name: string;
        seats_available: number;
        seats_total: number;
        seats_used: number;
    }

    export interface Plan {
        id: string;
        title: string;
        amount: number;
        amountMonth: number;
        currency: string;
        interval: 'month' | 'year';
        metadata: PlanMetadata;
    }

    export interface Org {
        id: string;
        name: string;
        users?: Immutable.List<User>;        
    }

    export interface UserResponse {
        _id: string;
        user: UserPaymentResponse;
    }

    export interface Card {
        name?: string;
        last_4?: string;
        exp_month?: number;
        exp_year?: number;
        cvc?: string;
        brand: string;
    }

    export interface StateRecord {
        plans: Immutable.List<Plan>;
        level: string;
        interval: 'month' | 'year';
        changed: boolean;
        error: string;
        success: string;
        processing: boolean;
        type: 'user' | 'org';
        card: Card;
        org: Org;
        seats: number;
        seatUsers: Immutable.List<string>;
    }

    export interface Scope extends angular.IScope {
        state: any;
        billingType: 'user' | 'org';
        props: {
            seatArray: Array<number>,
            months: Array<number>,
            years: Array<number>,
            orgs: any
        };
        name: string;
        cc: string;
        ccFormat: string;
        ccOptions: any;
        exp_month: string;
        exp_year: string;
        cvc: string;
        brandlogo: string;
        level: string;
        seats: number;
        interval: 'month' | 'year';
        seatUsers: Array<string>;
        plans: Array<Plan>;
        total: number;
        orgUsers: Array<User>;
        error: string;
        success: string;
        processing: boolean;
        org: Org;
        getUnselectedUsers(index: number): Array<Ided>;
        changeLevel(level: string): void;
        changeOrg(org: Org): void;
        changeSeats(seats: number): void;
        changeInterval(interval: 'month' | 'year'): void;
        setSeatUser(index: number, id: string): void;
        deleteSeatUser(index: number): void;
        changePayment(value: any, field: string): void;
        saveBilling(
            name: string,
            cc: string,
            cvc: string,
            exp_month: string,
            exp_year: string
        ): void;
    }
}
