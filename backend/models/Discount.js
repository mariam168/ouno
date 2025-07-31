const mongoose = require('mongoose');
const discountSchema = mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Discount code is required.'],
        unique: true,
        uppercase: true,
        trim: true
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    fixedAmount: {
        type: Number,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required.']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required.']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

discountSchema.pre('save', function (next) {
    if ((this.percentage != null && this.fixedAmount != null) || (this.percentage == null && this.fixedAmount == null)) {
        return next(new Error('Either percentage or fixedAmount must be provided, but not both.'));
    }
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        return next(new Error('End date must be after start date.'));
    }
    next();
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;