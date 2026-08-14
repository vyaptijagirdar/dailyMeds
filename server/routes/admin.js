import express from 'express';

import User from '../models/User.js';
import Report from '../models/Report.js';
import Product from '../models/Product.js';
import Machine from '../models/Machine.js';
import Order from '../models/Order.js';

import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();


/* =========================================================
   ADMIN AUTH MIDDLEWARE
========================================================= */

router.use(auth);
router.use(adminOnly);


/* =========================================================
   ADMIN OVERVIEW / STATS
========================================================= */

router.get('/stats', async (req, res) => {

  try {

    const [

      totalUsers,

      totalReports,

      totalProducts,

      totalMachines,

      totalOrders,

      paidOrders,

      activeMachines,

      lowStockProducts

    ] = await Promise.all([

      User.countDocuments(),

      Report.countDocuments(),

      Product.countDocuments({
        active: true
      }),

      Machine.countDocuments(),

      Order.countDocuments(),

      Order.countDocuments({
        paymentStatus: 'paid'
      }),

      Machine.countDocuments({
        status: 'online'
      }),

      Product.countDocuments({
        active: true,
        stock: {
          $lte: 10
        }
      })

    ]);


    /* ---------------------------------------------
       Revenue
    --------------------------------------------- */

    const revenueResult =
      await Order.aggregate([

        {
          $match: {
            paymentStatus: 'paid'
          }
        },

        {
          $group: {

            _id: null,

            total: {
              $sum: '$total'
            }

          }
        }

      ]);


    const revenue =
      revenueResult.length
        ? revenueResult[0].total
        : 0;


    res.json({

      stats: {

        totalUsers,

        totalReports,

        totalProducts,

        totalMachines,

        totalOrders,

        paidOrders,

        activeMachines,

        lowStockProducts,

        revenue

      }

    });

  } catch (error) {

    console.error(
      'Admin stats error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load admin statistics'

    });

  }

});


/* =========================================================
   USERS
========================================================= */

router.get('/users', async (req, res) => {

  try {

    const users =
      await User.find()

        .select(
          '-passwordHash'
        )

        .sort({
          createdAt: -1
        });


    res.json({
      users
    });

  } catch (error) {

    console.error(
      'Admin users error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load users'

    });

  }

});


/* =========================================================
   REPORTS
========================================================= */

router.get('/reports', async (req, res) => {

  try {

    const reports =
      await Report.find()

        .populate(
          'user',
          'name email'
        )

        .sort({
          createdAt: -1
        })

        .select(
          '-filePath'
        );


    res.json({
      reports
    });

  } catch (error) {

    console.error(
      'Admin reports error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load reports'

    });

  }

});


/* =========================================================
   PRODUCTS
========================================================= */

router.get('/products', async (req, res) => {

  try {

    const products =
      await Product.find()

        .sort({
          name: 1
        });


    res.json({
      products
    });

  } catch (error) {

    console.error(
      'Admin products error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load products'

    });

  }

});


/* =========================================================
   MACHINES
========================================================= */

router.get('/machines', async (req, res) => {

  try {

    const machines =
      await Machine.find()

        .populate(
          'inventory.product'
        )

        .sort({
          createdAt: -1
        });


    res.json({
      machines
    });

  } catch (error) {

    console.error(
      'Admin machines error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load machines'

    });

  }

});


/* =========================================================
   ORDERS
========================================================= */

router.get('/orders', async (req, res) => {

  try {

    const orders =
      await Order.find()

        .populate(
          'user',
          'name email'
        )

        .populate(
          'machine',
          'machineId location status'
        )

        .populate(
          'items.product',
          'name sku price'
        )

        .sort({
          createdAt: -1
        });


    res.json({
      orders
    });

  } catch (error) {

    console.error(
      'Admin orders error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load orders'

    });

  }

});


/* =========================================================
   INVENTORY
========================================================= */

router.get('/inventory', async (req, res) => {

  try {

    const machines =
      await Machine.find()

        .populate(
          'inventory.product'
        );


    const inventory = [];


    for (
      const machine of machines
    ) {

      for (
        const item of machine.inventory
      ) {

        if (!item.product) {
          continue;
        }


        inventory.push({

          machineId:
            machine.machineId,

          location:
            machine.location,

          machineStatus:
            machine.status,

          productId:
            item.product._id,

          productName:
            item.product.name,

          sku:
            item.product.sku,

          quantity:
            item.quantity,

          price:
            item.product.price

        });

      }

    }


    res.json({
      inventory
    });

  } catch (error) {

    console.error(
      'Admin inventory error:',
      error
    );

    res.status(500).json({

      message:
        'Could not load inventory'

    });

  }

});


/* =========================================================
   RECENT ORDERS
========================================================= */

router.get(
  '/recent-orders',
  async (req, res) => {

    try {

      const orders =
        await Order.find()

          .populate(
            'user',
            'name email'
          )

          .populate(
            'machine',
            'machineId location'
          )

          .sort({
            createdAt: -1
          })

          .limit(10);


      res.json({
        orders
      });

    } catch (error) {

      console.error(
        'Recent orders error:',
        error
      );

      res.status(500).json({

        message:
          'Could not load recent orders'

      });

    }

  }
);


/* =========================================================
   RECENT USERS
========================================================= */

router.get(
  '/recent-users',
  async (req, res) => {

    try {

      const users =
        await User.find()

          .select(
            '-passwordHash'
          )

          .sort({
            createdAt: -1
          })

          .limit(10);


      res.json({
        users
      });

    } catch (error) {

      console.error(
        'Recent users error:',
        error
      );

      res.status(500).json({

        message:
          'Could not load recent users'

      });

    }

  }
);


export default router;
