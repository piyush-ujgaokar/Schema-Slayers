const mongoose= require("mongoose");


const connectToDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DataBase connected successfully");
        
    } catch (error) {
        console.log("error in db", error);
        
    }
}

module.exports=connectToDb