import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { auth } from './middleware/auth.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';
import Report from './models/Report.js';
import Product from './models/Product.js';
import Machine from './models/Machine.js';
import Order from './models/Order.js';

import productRoutes from './routes/products.js';

import { extractTextFromFile } from './services/reportText.js';
import { analyzeReportText } from './services/reportAnalyzer.js';
import {
  generateHealthExplanation
} from './services/aiHealth.js';


/* =========================================================
   PATHS / UPLOADS
========================================================= */

const __dirname =
  path.dirname(
    fileURLToPath(import.meta.url)
  );

const uploadDir =
  path.join(
    __dirname,
    'uploads'
  );

fs.mkdirSync(
  uploadDir,
  { recursive: true }
);


/* =========================================================
   MULTER
========================================================= */

const storage =
  multer.diskStorage({

    destination:
      uploadDir,

    filename:
      (req, file, cb) => {

        const safeName =
          file.originalname.replace(
            /[^a-zA-Z0-9._-]/g,
            '_'
          );

        cb(
          null,
          Date.now() +
            '-' +
            safeName
        );
      }
  });


const upload =
  multer({

    storage,

    limits: {
      fileSize:
        10 * 1024 * 1024
    },

    fileFilter:
      (req, file, cb) => {

        const allowed = [
          'application/pdf',
          'image/jpeg',
          'image/png'
        ];

        cb(
          null,
          allowed.includes(
            file.mimetype
          )
        );
      }
  });


/* =========================================================
   APP
========================================================= */

const app =
  express();


app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173'
  })
);


app.use(
  express.json()
);
app.use(
  '/api/admin',
  adminRoutes
);


app.use(
  '/uploads',
  express.static(uploadDir)
);


/* =========================================================
   HEALTH
========================================================= */

app.get(
  '/api/health',
  (req, res) => {

    res.json({
      ok: true,
      service: 'DailyMeds API'
    });

  }
);


/* =========================================================
   AUTH - REGISTER
========================================================= */

app.post(
  '/api/auth/register',
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body;


      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            'Name, email and password are required'

        });

      }


      if (
        password.length < 6
      ) {

        return res.status(400).json({

          message:
            'Password must be at least 6 characters'

        });

      }


      const normalizedEmail =
        email.toLowerCase();


      const exists =
        await User.findOne({
          email:
            normalizedEmail
        });


      if (exists) {

        return res.status(409).json({

          message:
            'Email already registered'

        });

      }


      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      const user =
        await User.create({

          name,

          email:
            normalizedEmail,

          passwordHash,

          // New users are ALWAYS normal users.
          role:
            'user'

        });


      const token =
        jwt.sign(

          {
            userId:
              user._id,

            role:
              user.role
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              '7d'
          }

        );


      res.status(201).json({

        token,

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          profile:
            user.profile

        }

      });

    } catch (e) {

      console.error(
        'Registration failed:',
        e
      );

      res.status(500).json({

        message:
          'Registration failed'

      });

    }

  }
);


/* =========================================================
   AUTH - LOGIN
========================================================= */

app.post(
  '/api/auth/login',
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      const user =
        await User.findOne({

          email:
            email?.toLowerCase()

        });


      if (
        !user ||
        !(
          await bcrypt.compare(
            password || '',
            user.passwordHash
          )
        )
      ) {

        return res.status(401).json({

          message:
            'Invalid email or password'

        });

      }


      /*
       * Existing users created before the
       * role field was added will behave
       * as normal users.
       */

      const role =
        user.role || 'user';


      const token =
        jwt.sign(

          {
            userId:
              user._id,

            role

          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              '7d'
          }

        );


      res.json({

        token,

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role,

          profile:
            user.profile

        }

      });

    } catch (e) {

      console.error(
        'Login failed:',
        e
      );

      res.status(500).json({

        message:
          'Login failed'

      });

    }

  }
);


/* =========================================================
   CURRENT USER
========================================================= */

app.get(
  '/api/me',
  auth,
  async (req, res) => {

    res.json({

      user:
        req.user

    });

  }
);


/* =========================================================
   UPDATE PROFILE
========================================================= */

app.put(
  '/api/me/profile',
  auth,
  async (req, res) => {

    try {

      const allowed = [

        'age',

        'height',

        'weight',

        'allergies',

        'conditions',

        'currentMedicines'

      ];


      for (
        const key of allowed
      ) {

        if (
          req.body[key] !== undefined
        ) {

          req.user.profile[key] =
            req.body[key];

        }

      }


      await req.user.save();


      res.json({

        profile:
          req.user.profile

      });

    } catch (error) {

      console.error(
        'Profile update failed:',
        error
      );

      res.status(500).json({

        message:
          'Could not update profile'

      });

    }

  }
);


/* =========================================================
   REPORT UPLOAD
========================================================= */

app.post(
  '/api/reports',
  auth,
  upload.single('report'),
  async (req, res) => {

    if (!req.file) {

      return res.status(400).json({

        message:
          'PDF/JPG/PNG report is required'

      });

    }


    const report =
      await Report.create({

        user:
          req.user._id,

        originalName:
          req.file.originalname,

        mimeType:
          req.file.mimetype,

        filePath:
          req.file.path,

        status:
          'uploaded'

      });


    res.status(201).json({

      report: {

        id:
          report._id,

        name:
          report.originalName,

        status:
          report.status

      }

    });

  }
);


/* =========================================================
   REPORT ANALYSIS
========================================================= */

app.post(
  '/api/reports/:id/analyze',
  auth,
  async (req, res) => {

    try {

      const report =
        await Report.findOne({

          _id:
            req.params.id,

          user:
            req.user._id

        });


      if (!report) {

        return res.status(404).json({

          message:
            'Report not found'

        });

      }


      /* ---------------------------------------------
         Extract text
      --------------------------------------------- */

      const extractedText =
        await extractTextFromFile({

          path:
            report.filePath,

          mimetype:
            report.mimeType

        });


      /* ---------------------------------------------
         Existing analyzer
      --------------------------------------------- */

      const analysis =
        analyzeReportText(
          extractedText
        );


      /* ---------------------------------------------
         AI explanation
      --------------------------------------------- */

      let aiHealth = {

        enabled:
          false,

        summary:
          analysis.summary,

        explanations:
          []

      };


      try {

        aiHealth =
          await generateHealthExplanation({

            findings:
              analysis.findings,

            summary:
              analysis.summary,

            profile:
              req.user.profile

          });

      } catch (aiError) {

        console.error(
          'AI health explanation failed:',
          aiError.message
        );

        /*
         * AI failure should NOT break
         * the existing report analyzer.
         */

        aiHealth = {

          enabled:
            false,

          summary:
            analysis.summary,

          explanations:
            []

        };

      }


      /* ---------------------------------------------
         Save analysis
      --------------------------------------------- */

      report.status =
        'review_required';


      report.summary =
        analysis.summary;


      report.findings =
        analysis.findings;


      await report.save();


      /* ---------------------------------------------
         Response
      --------------------------------------------- */

      res.json({

        report,

        analysis,

        aiHealth

      });

    } catch (e) {

      console.error(
        'Report analysis failed:',
        e
      );

      res.status(500).json({

        message:
          'Could not analyze this report. Make sure the file is readable and try again.'

      });

    }

  }
);


/* =========================================================
   GET REPORTS
========================================================= */

app.get(
  '/api/reports',
  auth,
  async (req, res) => {

    const reports =
      await Report.find({

        user:
          req.user._id

      })

      .sort({
        createdAt:
          -1
      })

      .select(
        '-filePath'
      );


    res.json({
      reports
    });

  }
);


/* =========================================================
   PRODUCTS
========================================================= */

app.get(
  '/api/products',
  async (req, res) => {

    res.json({

      products:
        await Product.find({
          active:
            true
        })

        .sort({
          name:
            1
        })

    });

  }
);


/* =========================================================
   MACHINES
========================================================= */

app.get(
  '/api/machines/:machineId',
  async (req, res) => {

    const machine =
      await Machine.findOne({

        machineId:
          req.params.machineId

      })

      .populate(
        'inventory.product'
      );


    if (!machine) {

      return res.status(404).json({

        message:
          'Machine not found'

      });

    }


    res.json({
      machine
    });

  }
);


/* =========================================================
   ORDERS
========================================================= */

app.post(
  '/api/orders',
  auth,
  async (req, res) => {

    try {

      const {
        machineId,
        items,
        idempotencyKey
      } = req.body;


      if (
        !machineId ||
        !Array.isArray(items) ||
        !items.length
      ) {

        return res.status(400).json({

          message:
            'Machine and items are required'

        });

      }


      if (idempotencyKey) {

        const existing =
          await Order.findOne({

            user:
              req.user._id,

            idempotencyKey

          });


        if (existing) {

          return res.json({
            order:
              existing
          });

        }

      }


      const machine =
        await Machine.findOne({

          machineId

        })

        .populate(
          'inventory.product'
        );


      if (
        !machine ||
        machine.status !== 'online'
      ) {

        return res.status(400).json({

          message:
            'Machine unavailable'

        });

      }


      const products =
        await Product.find({

          _id: {
            $in:
              items.map(
                i =>
                  i.productId
              )
          },

          active:
            true

        });


      const normalized = [];


      for (
        const item of items
      ) {

        const p =
          products.find(

            x =>
              String(x._id) ===
              String(item.productId)

          );


        if (
          !p ||
          !Number.isInteger(
            item.quantity
          ) ||
          item.quantity < 1
        ) {

          return res.status(400).json({

            message:
              'Invalid product or quantity'

          });

        }


        normalized.push({

          product:
            p._id,

          quantity:
            item.quantity,

          price:
            p.price

        });

      }


      const total =
        normalized.reduce(

          (sum, i) =>
            sum +
            i.price *
            i.quantity,

          0

        );


      const order =
        await Order.create({

          user:
            req.user._id,

          machine:
            machine._id,

          items:
            normalized,

          total,

          idempotencyKey,

          dispenseStatus:
            'waiting_payment'

        });


      res.status(201).json({

        order

      });

    } catch (e) {

      console.error(
        'Order creation failed:',
        e
      );

      res.status(500).json({

        message:
          'Could not create order'

      });

    }

  }
);


/* =========================================================
   DEMO PAYMENT
========================================================= */

app.post(
  '/api/orders/:id/pay-demo',
  auth,
  async (req, res) => {

    const order =
      await Order.findOne({

        _id:
          req.params.id,

        user:
          req.user._id

      });


    if (!order) {

      return res.status(404).json({

        message:
          'Order not found'

      });

    }


    order.paymentStatus =
      'paid';


    order.dispenseStatus =
      'queued';


    await order.save();


    res.json({
      order
    });

  }
);


/* =========================================================
   DEMO DISPENSING
========================================================= */

app.post(
  '/api/orders/:id/dispense-demo',
  auth,
  async (req, res) => {

    const order =
      await Order.findOne({

        _id:
          req.params.id,

        user:
          req.user._id

      });


    if (!order) {

      return res.status(404).json({

        message:
          'Order not found'

      });

    }


    if (
      order.paymentStatus !==
      'paid'
    ) {

      return res.status(400).json({

        message:
          'Payment required'

      });

    }


    order.dispenseStatus =
      'dispensing';


    await order.save();


    setTimeout(
      async () => {

        try {

          await Order.findByIdAndUpdate(

            order._id,

            {
              dispenseStatus:
                'dispensed'
            }

          );

        } catch {

          // Demo only
        }

      },

      1500

    );


    res.json({
      order
    });

  }
);


/* =========================================================
   PRODUCT ROUTES
========================================================= */

app.use(
  '/api/products',
  productRoutes
);


/* =========================================================
   SEED DATA
========================================================= */

async function seed() {

  console.log(
    'Checking DailyMeds seed data...'
  );


  const products = [

    {
      sku:
        'PARA-500',

      name:
        'Paracetamol',

      category:
        'OTC medicine',

      price:
        2,

      unitLabel:
        'tablet',

      safetyNote:
        'Use according to label or pharmacist/clinician advice.'
    },

    {
      sku:
        'B12-001',

      name:
        'Vitamin B12',

      category:
        'Supplement',

      price:
        4,

      unitLabel:
        'tablet',

      safetyNote:
        'Need and dose depend on product and clinical context.'
    },

    {
      sku:
        'D3-001',

      name:
        'Vitamin D3',

      category:
        'Supplement',

      price:
        5,

      unitLabel:
        'tablet',

      safetyNote:
        'Do not infer high-dose treatment from a lab result alone.'
    },

    {
      sku:
        'MAG-001',

      name:
        'Magnesium',

      category:
        'Supplement',

      price:
        4,

      unitLabel:
        'tablet',

      safetyNote:
        'Different magnesium salts contain different elemental magnesium amounts.'
    }

  ];


  /*
   * IMPORTANT:
   *
   * Your Product schema uses sku,
   * so seed using Product.updateOne.
   */

  for (
    const p of products
  ) {

    await Product.updateOne(

      {
        sku:
          p.sku
      },

      {
        $setOnInsert:
          p
      },

      {
        upsert:
          true
      }

    );

  }


  const machine =
    await Machine.findOne({

      machineId:
        'DM-DEMO-001'

    });


  if (!machine) {

    const ps =
      await Product.find({

        sku: {
          $in:
            products.map(
              p =>
                p.sku
            )
        }

      });


    await Machine.create({

      machineId:
        'DM-DEMO-001',

      location:
        'College Demo Lab',

      inventory:
        ps.map(
          p => ({

            product:
              p._id,

            quantity:
              100

          })

        )

    });

  }


  console.log(
    '✅ Seed data ready'
  );

}


/* =========================================================
   DATABASE + SERVER
========================================================= */

const port =
  process.env.PORT ||
  5000;


console.log(
  'Connecting to MongoDB...'
);


mongoose.connect(

  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/dailymeds'

)

.then(
  async () => {

    console.log(
      '✅ MongoDB connected'
    );


    try {

      await seed();

    } catch (error) {

      console.error(
        '❌ Seed failed:',
        error.message
      );

      process.exit(1);

    }


    app.listen(

      port,

      () => {

        console.log(
          `DailyMeds API running on http://localhost:${port}`
        );

      }

    );

  }

)

.catch(
  err => {

    console.error(
      '\n❌ MongoDB connection failed:'
    );

    console.error(
      err.message
    );

    process.exit(1);

  }
);