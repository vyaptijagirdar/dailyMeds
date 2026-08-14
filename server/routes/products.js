import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();


// GET ALL ACTIVE PRODUCTS

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({
      active: true
    }).sort({
      category: 1,
      name: 1
    });

    res.json({
      products
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Unable to load products'
    });

  }
});


export default router;