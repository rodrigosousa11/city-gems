const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const poiRouter = require("./routes/poi");

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
    .connect(process.env.MONGODB)
    .then(() => console.log("Connected to MongoDB"))
    .catch(console.error);

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/poi", poiRouter);

app.listen(3000, () => {
	console.log("Server is running on  http://localhost:3000/");
});