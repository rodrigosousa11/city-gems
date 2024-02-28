const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());

mongoose
    .connect(process.env.MONGODB)
    .then(() => console.log("Connected to MongoDB"))
    .catch(console.error);

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});