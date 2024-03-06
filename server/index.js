const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRouter = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
    .connect(process.env.MONGODB)
    .then(() => console.log("Connected to MongoDB"))
    .catch(console.error);

app.use("/auth", authRouter);

app.listen(3000, () => {
	console.log("Server is running on  http://localhost:3000/");
});