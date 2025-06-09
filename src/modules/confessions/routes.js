const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed (.jpg, .jpeg, .png, .webp)"));
        }
    }
});

const authMid = require('../../middlewares/auth.middleware');
const validateMid = require('../../middlewares/validate.middleware');
const limitMid = require('../../middlewares/limit.middleware');

const { createConfessionSchema } = require('./schema');
const { createConfession } = require('./controller');

router.post(
    '/create',
    authMid(),
    upload.array('images', 5),
    validateMid(createConfessionSchema),
    createConfession
);

module.exports = router;