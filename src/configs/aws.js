require("dotenv").config();
const { SESClient } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION || 'ap-southeast-1',
});

module.exports = sesClient;