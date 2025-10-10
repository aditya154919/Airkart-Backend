const mongoose = require("mongoose");

require("dotenv").config();

exports.connect = () =>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(() =>{
        console.log("DB connected succesfully");
    })
    .catch((error) =>{
        console.log("DB connect nhi huwa");
        console.log(error);
        process.exit(1)
    })
}