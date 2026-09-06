
import mongoose from "mongoose";

const protectionSchema = new mongoose.Schema({
    clerkId: {type: String},
    termsAccepted: {type:Boolean, default:false},
    termsAcceptedAt: {type: Date},
     createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
    
},{timestamps: true});

const Protection = mongoose.model("Protection", protectionSchema);
export default Protection;