import 'dotenv/config';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';

const ADMIN_EMAIL =
  'admin@dailymeds.com';

const ADMIN_PASSWORD =
  'Admin@123';

const ADMIN_NAME =
  'DailyMeds Admin';


async function createAdmin() {

  try {

    await mongoose.connect(
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/dailymeds'
    );

    console.log(
      'MongoDB connected'
    );


    const existing =
      await User.findOne({
        email: ADMIN_EMAIL
      });


    if (existing) {

      existing.role = 'admin';

      await existing.save();

      console.log(
        '✅ Existing user promoted to admin'
      );

    } else {

      const passwordHash =
        await bcrypt.hash(
          ADMIN_PASSWORD,
          12
        );


      await User.create({

        name:
          ADMIN_NAME,

        email:
          ADMIN_EMAIL,

        passwordHash,

        role:
          'admin'

      });


      console.log(
        '✅ Admin account created'
      );
    }


    console.log('');
    console.log(
      'Admin Email:',
      ADMIN_EMAIL
    );

    console.log(
      'Admin Password:',
      ADMIN_PASSWORD
    );

    console.log('');


    await mongoose.disconnect();

  } catch (error) {

    console.error(
      '❌ Could not create admin:',
      error
    );

    process.exit(1);
  }
}


createAdmin();