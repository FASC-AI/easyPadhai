import puppeteer from 'puppeteer';
import { enqueueTask } from './concurrentQueue.js';

/**
 * Generate PDF and send it via response, using concurrency queue
 * @param {Object} params
 * @param {string} params.htmlContent
 * @param {import('express').Response} params.res
 * @param {string} params.fileName
 * @param {Object} [params.options]
 */
export async function generatePDF({
  htmlContent,
  res,
  fileName = 'document.pdf',
  options = {},
}) {
  return enqueueTask(async () => {
    const {
      format = 'A4',
      printBackground = true,
      margin = { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    } = options;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format,
      printBackground,
      margin,
    });

    await browser.close();

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return res.end(pdfBuffer);
  });
}
