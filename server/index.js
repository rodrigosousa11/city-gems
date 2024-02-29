const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
    .connect(process.env.MONGODB)
    .then(() => console.log("Connected to MongoDB"))
    .catch(console.error);

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.listen(3000, () => {
	console.log("Server is running on  http://localhost:3000/");
});