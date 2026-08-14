import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineId:{type:String,unique:true,required:true},
  name:{type:String,default:'DailyMeds Vending Machine'},
  location:String,
  status:{type:String,enum:['online','offline'],default:'online'},
  inventory:[{product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},quantity:Number}]
},{timestamps:true});
export default mongoose.model('Machine',machineSchema);
