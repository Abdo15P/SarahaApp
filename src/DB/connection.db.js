import mongoose from "mongoose";
const connectDB=async ()=>{

    try{
        const uri=process.env.DB_URI
        const result= await mongoose.connect(uri,{
            serverSelectionTimeoutMS:30000
        })
        // console.log(result.model)
    }catch(error){
        // console.log("failed to connect",error)
    }
}
export default connectDB