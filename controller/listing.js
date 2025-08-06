// const { isLoggedIn, isOwner } = require("../middleware");
const Listing = require("../models/listings");
const wrapAsync = require("../utils/wrapAsync");

module.exports.index = async(req,res) =>{
   const allListings = await Listing.find({});
   res.render("listings/index", {allListings});
};

module.exports.renderNewForm = (req,res) =>{
    res.render("listings/new.ejs");
} ;

module.exports.showListing=  async(req,res) =>{
    let {id} = req.params;
    const listing= await Listing.findById(id).
    populate({path:"reviews",
        populate: {
        path: "author",
    },
})
.populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
       return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
}

module.exports.createListing = async (req, res, next) => {
  
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
      const url = req.file.path;
      const filename = req.file.filename;
      newListing.image = { url, filename };
    } else {
      //  Manually apply default image
      newListing.image = {
        url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        filename: "default.jpg"
      };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    next(err);
  }
};




module.exports.renderEditForm =  async(req,res) =>{
    let {id} = req.params;
   const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit",{listing, originalImageUrl});
}



// module.exports.updateListing =  async (req, res) => {
//     const { id } = req.params;

//   // Find existing listing
//   const listing = await Listing.findById(id);
//   // Update basic fields
//   listing.title = req.body.listing.title;
//   listing.description = req.body.listing.description;
//   listing.price = req.body.listing.price;
//   listing.location = req.body.listing.location;
//   listing.country = req.body.listing.country;
//   // Only update image if provided
//   if (req.body.listing.image && req.body.listing.image.url) {
//     listing.image = req.body.listing.image;
//   }

//   await listing.save();
//   req.flash("success", "Listing Updated");
//   res.redirect(`/listings/${id}`);
// }


module.exports.updateListing = async (req,res) => {
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

  if(typeof req.file !== "undefined"){
  let url= req.file.path;
  let filename= req.file.filename;
  listing.image = {url, filename};
  await listing.save();
  }
 
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
;}

module.exports.destroyListing=  async(req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}





