import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    // -----------------------------------------
    // USER ROLE
    // -----------------------------------------

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    profile: {
      age: Number,

      height: Number,

      weight: Number,

      allergies: {
        type: String,
        default: ''
      },

      conditions: {
        type: String,
        default: ''
      },

      currentMedicines: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  'User',
  userSchema
);
