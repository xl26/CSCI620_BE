const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/user');
const user_routes = require('./routes/user');
const inventory_routes = require('./routes/inventory');
const user_auth = require("./middleware/user-auth");

require('dotenv').config();


const app = express();
app.use(express.json());

const port = 3001;
const uri = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const connection = mongoose.connection;
connection.once("open", () => {
    console.log('Connected to Mongo DB!!!')
})

app.get("/usersList",  async (req,res) =>{
    const users = await User.find().lean()
    console.log(users)
    res.send(users)
})

app.use(user_routes);
app.use(inventory_routes);



app.post("/welcome", user_auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.listen(port, () =>{
    console.log(`App listenting at http://localhost${port}`);
})