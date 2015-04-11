var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    Schema = mongoose.Schema;


var couponSchema = new Schema({
    price: { type: Number },
    code: { type: String },
    used: { type: Boolean, default: false }
});
mongoose.model('OrderCoupon', couponSchema);

var schema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    email:  { type: String },
    //name: { type: String },
    // organization: { type: String },
    // title: { type: String },
    // proType: { type: String },

    // billing_address: { type: String },
    // billing_address2: { type: String },
    // billing_city: { type: String },
    // billing_state: { type: String },
    // billing_postal: { type: String },
    // billing_country: { type: String },

    // shipping_address: { type: String },
    // shipping_address2: { type: String },
    // shipping_city: { type: String },
    // shipping_state: { type: String },
    // shipping_postal: { type: String },
    // shipping_country: { type: String },

    // quantity: { type: Number },
    // shipping: { type: Number },
    // total: { type: Number },
    // paid: { type: Number },

    order: { type: Schema.Types.Mixed },

    last4: { type: String },
    cardType: { type: String },
    stripeCustomerId: { type: String },
    stripeChargeId: { type: String },

    coupon: { type: String }
});

mongoose.model('Order', schema);