const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../StayVista/models/listings.js");
const path= require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../StayVista/utils/wrapAsync.js");
const ExpressError = require("../StayVista/utils/ExpressError.js");
const {listingSchema} = require("./schema.js");

const URL = "mongodb://127.0.0.1:27017/StayVista";

main().then(()  =>{
    console.log("connected to DB");
}).catch((err) =>{
    console.log(err);
});

async function main() {
    await mongoose.connect(URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req,res) =>{
    res.send("i am ayan");
});

const validateListing = (req,res,next) =>{
      let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError (400, error);
    }else{
        next();
    }
};




//index route

app.get("/listings", wrapAsync(
    async(req,res) =>{
   const allListings = await Listing.find({});
   res.render("listings/index", {allListings});
}
));

//new Route
app.get("/listings/new", (req,res) =>{
    res.render("listings/new");
});

//show Route
app.get("/listings/:id", wrapAsync(
    async(req,res) =>{
    let {id} = req.params;
    const listing= await Listing.findById(id);
    res.render("listings/show",{listing});
}
));

//Create Route
app.post("/listings", validateListing, wrapAsync(
    async(req,res,next) =>{
    const newListing =new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}
)); 


//Edit Route
app.get("/listings/:id/edit", wrapAsync(
    async(req,res) =>{
    let {id} = req.params;
   const listing = await Listing.findById(id);
   res.render("listings/edit",{listing});
}
));

//update route


// app.put("/listings/:id", async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//   res.redirect(`/listings/${id}`);
// });

app.put("/listings/:id",validateListing, wrapAsync(
    async (req, res) => {
    const { id } = req.params;

  // Find existing listing
  const listing = await Listing.findById(id);

  // Update basic fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // Only update image if provided
  if (req.body.listing.image && req.body.listing.image.url) {
    listing.image = req.body.listing.image;
  }

  await listing.save();
  res.redirect(`/listings/${id}`);
}
));



//Delete Route
app.delete("/listings/:id", wrapAsync(
    async(req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
);








// app.get("/testListing", async (req,res) =>{
// let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "calangute,Goa",
//     country: "India", 
// });

//    await sampleListing.save();
//     console.log("Sample was Saved");
//     res.send("successful testing");
// });


// app.use((err,req,res,next) =>{
//   res.status(404).json({
//     message: "Page not found"
//   })
// });

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page not Found!"));
// });



app.use((err,req,res,next) =>{
    let {status=500, message="something went wrong"} = err;
    res.status(status).render("error.ejs",{message});
  //  res.status(status).send(message);
});


app.listen(8080, ()=> {
    console.log("app is listening to port 8080");
});


