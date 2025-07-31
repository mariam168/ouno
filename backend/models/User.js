const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isActivated: { 
        type: Boolean,
        default: false,
    },
    activationToken: String,
    activationTokenExpire: Date,
    resetPasswordToken: String, 
    resetPasswordExpire: Date, 
    wishlist: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' 
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { 
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex'); 
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

    return resetToken; 
};
UserSchema.methods.getActivationToken = function () {
    const activationToken = crypto.randomBytes(20).toString('hex');
    this.activationToken = crypto
        .createHash('sha256')
        .update(activationToken)
        .digest('hex');
    this.activationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; 
    return activationToken;
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = User;