const express = require('express');
const router = express.Router();

const authMid = require('../../middlewares/auth.middleware');

const { getUserInteractions } = require('./controller');

router.post(
    '/interactions',
    authMid(),
    getUserInteractions
);

module.exports = router;