import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  machine:{type:mongoose.Schema.Types.ObjectId,ref:'Machine',required:true},
  items:[{product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},quantity:Number,price:Number}],
  total:Number,
  paymentStatus:{type:String,enum:['pending','paid','failed'],default:'pending'},
  dispenseStatus:{type:String,enum:['waiting_payment','queued','dispensing','dispensed','failed'],default:'waiting_payment'},
  idempotencyKey:String
},{timestamps:true});

export default mongoose.model('Order',orderSchema);
