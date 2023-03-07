const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
let ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");



// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    let images = [];
  
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
  
    const product = await Product.create(req.body);
  
    res.status(201).json({
      success: true,
      product,
    });
  });
  
//Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    let resultPerPage = 8;
    let productsCount = await Product.countDocuments();
  
    let apiFeature = new ApiFeatures(Product.find(), req.query).search();
      
  
    let products = await apiFeature.query;
  
    let filteredProductsCount = products.length;
  
    apiFeature.pagination(resultPerPage);
     
   //products = await apiFeature.query;
  
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  });
// exports.getAllProducts = catchAsyncErrors(async (req, res, next)=>{
//     let resultPerPage = 8;
//     const products = await Product.find();
//     res.status(200).json({
//         success:true,
//         products,
//         resultPerPage,
//     })
// })

//Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async(req,res, next)=>{
    const products = await Product.find();
    res.status(200).json({
        success:true,
        products,
    })
})


//Get Product Details
exports.getProductDetails = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
       return next(new ErrorHander("Product not found",404))
    }
    res.status(200).json({
        success:true,
        product,
    })
}
)


//Update Products -- Admin

exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("Product not found",404));
    }

    //Images Start Here
    let images = [];

    if(typeof req.body.image==="string"){
        image.push(req.body.images);
    }else{
        images = req.body.images;
    }

    if(images !== undefined){
        //Deleting Images From Cloudinary
        for(let i=0; i<product.images.length; i++){
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks=[];

        for(let i=0; i<images.length;i++){
            const result = await cloudinary.v2.uploader.upload(images[i],{
                folder:"products",
            })

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            })
        }
        req.body.images = imagesLinks;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        product,
        productCount,
    })
})

//Delete Product

exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHander("Product not found",404));
    }

    //Delete Images From Cloudinary
    for(let i=0; i<product.images.length; i++){
        const result = await cloudinary.v2.uploader.destroy(
            product.images[i].public_id
        );
    }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product Delete SuccessFully"
    })
    
})

















// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHander("Product not found",404));
    }
    res.status(200).json({
        success: true,
        reviews:product.reviews
    })
})
// Delete Review
exports.deleteReview = catchAsyncErrors(async(req, res, next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHander("Product not found",404));
    }
    const reviews = product.reviews.filter(
        (rev) =>rev._id.toString() !== req.query.id.toString()
    )
    let avg = 0;

    reviews.forEach((rev)=>{
        avg += rev.rating;
    })

    let ratings =0;

    if(reviews.length===0){
        ratings =0;
    }else{
     ratings = avg/reviews.length;
    }
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews
        },
        {
            new: true,
            runValidators:true,
            useFindAndModify:false
        }
    )

  
    res.status(200).json({
        success: ture
    })
})
















