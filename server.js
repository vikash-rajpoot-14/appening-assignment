const mongoose = require('mongoose');
const express = require('express');
const auth = require("./userRoutes/auth");

const app = express();
app.use(express.json());
const port = 5000;

const DB = "mongodb://localhost:27017";
mongoose.
    connect(DB, () => {
        console.log("connected to mongoose")
    })

app.post('/signup', auth.signUp)
app.post('/login', auth.login)
app.use(auth.restrictTo(['admin']));

app.get('/getUsers', auth.getUsers)

const server = app.listen(port, () => {
    console.log("listening on port " + port)
})