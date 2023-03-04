const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
// create product schema
const productSchema = new mongoose.Schema({
    title: {
        type:String,
        required:[true,"product title is required"],
        minlength:[3,"minimum length of should be three"],
        trim : true,

        validate:{
            validator: function (v){
                return v.length === 10
            },
            message : (props)=> `${props.value} is not a valid title`,
        },

    },
    price : {
        type:Number,
        required:true,
        trim:true,
        min:200,
        max:1500,
    },
    rating : {
        type:Number,
        required:true,
        trim:true,
    },
    description:
    {
        type: String,
        required:true,
        trim:true,

    },
    phone :{
        type : String,
        required: [true,"phone number is required"],
        validate:{
            validator: function(v){
                return /\d{3}-\d{3}-\d{2}/.test(v);

            },
            message: (props)=>`${props.value} is not a valid phone number`,
            
        },

    },
    createdAt:{
        type: Date,
        default:Date.now
    }

});

//create product model
const Product = mongoose.model("Product",productSchema);

const connectDB = async ()=>{
try{

    await mongoose.connect("mongodb://127.0.0.1:27017/textProductDB");
    console.log("db is connected");
}catch(error){
    console.log("db is not  connected");
    console.log(error.message);
    process.exit(1);

}

};
app.listen(port,async()=>{
    console.log(`server is running at http://localhost:${port}`);
    await connectDB();
});

app.get("/",(req,res)=>{
    res.send("welcome to home page");
});

app.post("/products", async (req,res)=>{
    try{
        //get data form request body
      

        const newProduct = new Product({
            title:req.body.title,
            price : req.body.price,
            rating : req.body.rating,
            description:req.body.description,
            phone: req.body.phone,
           
        });
        const productData = await newProduct.save();
         res.status(201).send(productData);
        
    }catch(error){
        res.status(500).send({message:error.message});
    }

});



app.get("/products", async (req,res)=>{
    try{
        const price = req.query.price;
        const rating = req.query.rating;
        let products;
        if(price && rating){
         products = await Product.find({$or:[{price :{$lt:price}} , {rating :{$gt:rating}}],
        });

        }else{
             products = await Product.find();
        }
  
       if(products){
        res.status(200).send({
            success : true,
            message: "return all products",
            data : products,
        });
       }else{
        res.status(404).send({
            success : false,
            message : "product not found",
        });


       }

    } catch(error){
        res.status(500).send({message:error.message});

    }

});

app.get("/products/:id", async (req,res)=>{
    try{
        const id = req.params.id;
       const product = await Product.findOne({ _id: id});
 
       if(product){
        res.status(200).send({
            success : true,
            message: "return single product",
            data : product,
        });
      }else{
        res.status(404).send({
            success : false,
            message : "products was not deleted",
        });

       }

    } catch(error){
        res.status(500).send({message:error.message});

    }

});

app.delete("/products/:id", async (req,res)=>{
   try{
    const id = req.params.id;
    const product = await Product.findByIdAndDelete({_id: id});
    if(product){
        res.status(200).send({
            success : true,
            message: "deleted singlae product",
            data : product,
        });
      }else{
        res.status(404).send({
            success : false,
            message : "products was not deleted",
        });
    }
   } catch(error){
    res.status(500).send({message:error.message});

   }

});

app.put("/products/:id", async (req,res)=>{
    try{
        const id = req.params.id;

        const updatedproduct = await Product.findByIdAndUpdate(
            { _id:id},
            {
                $set :{
                    title: req.body.title,
                    description: req.body.description,
                    rating : req.body.rating,
                    price :req.body.price,
         
        },
    },
    {new :true}
    
    );

    
    if(updatedproduct){
        res.status(200).send({
            success : true,
            message: "updated singlae product",
            data : updatedproduct,
        });
      }else{
        res.status(404).send({
            success : false,
            message : "product was not deleted",
        });
    }

    }catch(error){
        res.status(500).send({message:error.message});

    }
    
});


