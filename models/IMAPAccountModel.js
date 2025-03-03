const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const IMAPAccountSchema = new mongoose.Schema({
    imapAccountId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    provider: {
        type: String,
        required: true,
        enum: ['GMAIL', 'OUTLOOK', 'YAHOO'],
    },
    accessToken: {
        type: String,
        required: false,
    },
    refreshToken: {
        type: String,
        required: false,
    },
    tokenExpiresAt: {
        type: Date,
        required: false,
    },
    imapHost: {
        type: String,
        required: true,
    },
    imapPort: {
        type: Number,
        required: true,
    },
    imapPassword: {
        type: String,
    },
    imapUsername: {
        type: String,
    },
    tls: {
        type: Boolean,
        required: true,
        default: true,
    },
    authMethod: {
        type: String,
        required: true,
        enum: ['PASSWORD', 'OAUTH'],
    },
}, {
    timestamps: true
})

const IMAPAccountModel = new mongoose.model("imap_accounts", IMAPAccountSchema);
module.exports = IMAPAccountModel;