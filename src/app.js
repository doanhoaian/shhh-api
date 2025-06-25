require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const errorMid = require('./middlewares/error.middleware');

const userRoutes = require('./modules/users/routes');
const otpRoutes = require('./modules/otps/routes');
const postRoutes = require('./modules/posts/routes');
const meRoutes = require('./modules/me/routes');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/otps', otpRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/me', meRoutes);

app.use(errorMid);

const PORT = process.env.NODE_PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is runing on port ${PORT}`);
});