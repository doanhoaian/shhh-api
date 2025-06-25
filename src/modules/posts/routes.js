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
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed (.jpg, .jpeg, .png, .webp)"));
        }
    }
});

const authMid = require('../../middlewares/auth.middleware');
const validateMid = require('../../middlewares/validate.middleware');
const limitMid = require('../../middlewares/limit.middleware');

const { createPostSchema } = require('./schema');
const { createPost, getFeedIds, getFeedContent } = require('./controller');

router.post(
    '/create',
    authMid(),
    upload.array('images', 8),
    validateMid(createPostSchema),
    createPost
);

router.get(
    '/feed/ids',
    authMid(),
    getFeedIds
);

router.post(
    '/feed/content',
    authMid(),
    getFeedContent
);

module.exports = router;