import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const products = [
  {
    name: 'Vitamin B12 Supplement',
    category: 'Vitamin',
    description:
      'Vitamin B12 supplement. Product selection should be reviewed with a qualified healthcare professional when a low laboratory value is present.',
    price: 120,
    unit: 'pack',
    supportedParameters: [
      'Vitamin B12',
      'B12'
    ],
    safetyNote:
      'Do not use automated report analysis as a substitute for professional medical advice.'
  },

  {
    name: 'Vitamin D Supplement',
    category: 'Vitamin',
    description:
      'Vitamin D supplement option for discussion when a report contains a low Vitamin D result.',
    price: 150,
    unit: 'pack',
    supportedParameters: [
      'Vitamin D',
      '25-OH Vitamin D',
      '25-Hydroxy Vitamin D'
    ],
    safetyNote:
      'Vitamin D products vary in strength. Use only according to the product label or professional advice.'
  },

  {
    name: 'Magnesium Supplement',
    category: 'Mineral',
    description:
      'Magnesium supplement option.',
    price: 140,
    unit: 'pack',
    supportedParameters: [
      'Magnesium'
    ],
    safetyNote:
      'Check the product label and discuss use with a healthcare professional when appropriate.'
  },

  {
    name: 'ORS',
    category: 'OTC',
    description:
      'Oral rehydration solution product.',
    price: 25,
    unit: 'sachet',
    supportedParameters: [],
    safetyNote:
      'Follow the package instructions. Seek medical care for severe or persistent symptoms.'
  },

  {
    name: 'Paracetamol',
    category: 'OTC',
    description:
      'Common over-the-counter pain and fever medicine.',
    price: 30,
    unit: 'pack',
    supportedParameters: [],
    safetyNote:
      'Use only according to the package label or advice from a qualified healthcare professional. Check for contraindications and duplicate paracetamol-containing products.'
  }
];


async function seed() {

  try {

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      'Connected to MongoDB'
    );

    await Product.deleteMany({});

    await Product.insertMany(
      products
    );

    console.log(
      `Inserted ${products.length} products`
    );

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error(
      'Seed failed:',
      error
    );

    process.exit(1);

  }
}


seed();