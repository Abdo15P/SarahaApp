import mongoose from "mongoose";
export let genderEnum={male:"male",female:"female"}
export let roleEnum={user:"user",admin:"admin"}
export let providerEnum={system:"system",google:"google"}
const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true, minLength:2,
        maxLength:[20,"first name max length is 20 chars"]},
    lastName:{
        type:String,required:true, minLength:2,
        maxLength:[20,"first name max length is 20 chars"]},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:function(){
        return this.provider===providerEnum.system? true:false
    }},
    oldPassowrds:[String],
    forgotPasswordOtp:String,
    gender:{type:String,enum:{values:Object.values(genderEnum),message:`only ${Object.values(genderEnum)}`},default:genderEnum.male},
    role:{type:String,enum:{values:Object.values(roleEnum),message:`only ${Object.values(roleEnum)}`},default:roleEnum.user},
    phone:{type:String,required:function(){
        return this.provider===providerEnum.system? true:false
    }},
    provider:{type:String,enum:{values:Object.values(providerEnum)},default:providerEnum.system},
    confirmEmail:{type:Date},
    confirmEmailOtp:String,
    otpStartTime:String,
    otpCount:Number,
    picture:{secure_url:String,public_id:String},
    coverImages:[{secure_url:String,public_id:String}],
    deletedAt: Date,
    deletedBy:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    restoredAt: Date,
    restoredBy:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    changeCredentialsTime: Date
},
{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},

})
userSchema.virtual("fullName").set(function(value){
    const [firstName,lastName]=value?.split(" ") || []
    this.set({firstName,lastName})
}).get(function(){
    return this.firstName + " " +this.lastName
})
userSchema.virtual('messages',{
    localField:"_id",
    foreignField:"recieverId",
    ref:"Message"
})
export const UserModel=mongoose.models.User  || mongoose.model("User",userSchema)
UserModel.syncIndexes()