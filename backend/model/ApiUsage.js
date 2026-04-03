import mongoose, { Mongoose } from "mongoose";

const ApiSchema = new mongoose.Schema({
     date: {type:String, require:true, unique:true},
     requestCount: {type:Number, default:0 },
     lastUpdated:{type:Date, default: Date.now}
})
const ApiUsage = mongoose.model('ApiUsage', ApiSchema)

export default ApiUsage;