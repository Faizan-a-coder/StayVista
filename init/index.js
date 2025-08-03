const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const URL = "mongodb://127.0.0.1:27017/StayVista";

main().then(()  =>{
    console.log("connected to DB");
}).catch((err) =>{
    console.log(err);
});


async function main() {
    await mongoose.connect(URL);
};

const initDB = async() =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "688e3d26ad11db853919df2c"
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();

