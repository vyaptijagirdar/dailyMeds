import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export async function extractTextFromFile(file) {
  if (file.mimetype === 'application/pdf') {
    const buffer = await fs.readFile(file.path);

    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    const worker = await createWorker('eng');

    try {
      const { data } = await worker.recognize(file.path);
      return data.text || '';
    } finally {
      await worker.terminate();
    }
  }

  throw new Error('Unsupported report type');
}