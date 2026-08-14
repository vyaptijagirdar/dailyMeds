import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  originalName:String,
  mimeType:String,
  filePath:String,
  status:{type:String,enum:['uploaded','analyzed','review_required'],default:'uploaded'},
  findings:[{parameter:String,value:String,unit:String,referenceRange:String,status:String}],
  summary:String,
  disclaimer:String
},{timestamps:true});
export default mongoose.model('Report',reportSchema);
