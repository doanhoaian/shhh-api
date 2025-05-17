require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const errorMid = require("./middlewares/error.middleware");

app.use(cors());
app.use(bodyParser.json());


app.use(errorMid);

const PORT = process.env.PGPORT || 5432;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is runing on port ${PORT}`);
});