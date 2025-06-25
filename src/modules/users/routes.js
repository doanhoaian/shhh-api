const express = require("express");
const router = express.Router();

const limitMid = require('../../middlewares/limit.middleware');
const authMid = require("../../middlewares/auth.middleware");
const validateMid = require("../../middlewares/validate.middleware");

const { authUserSchema, resetPasswordSchema } = require("./schema");
const { checkEmailExists, getAuthUser, loginOrRegisterUser, getAllAliases, resetPassword, getAllSchools, updateUserAlias, updateUserSchool } = require('./controller');
const { updateUserAliasSchema, updateUserSchoolSchema } = require('./schema');

router.get('/aliases',
    authMid(),
    getAllAliases
);
router.get('/schools',
    authMid(),
    getAllSchools
);

router.post('/auth/check-email',
    limitMid({ windowSec: 60, maxRequests: 10 }),
    checkEmailExists
);
router.post('/auth/sync',
    authMid(),
    validateMid(authUserSchema),
    getAuthUser
);
router.post('/auth/login-or-register',
    authMid(),
    validateMid(authUserSchema),
    loginOrRegisterUser
);

router.patch('/auth/reset-password',
    limitMid({ windowSec: 60, maxRequests: 5 }),
    validateMid(resetPasswordSchema),
    resetPassword
);
router.patch('/update-alias',
    authMid(),
    validateMid(updateUserAliasSchema),
    updateUserAlias
);
router.patch('/update-school',
    authMid(),
    validateMid(updateUserSchoolSchema),
    updateUserSchool
);


module.exports = router;