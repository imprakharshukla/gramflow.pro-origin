import { randomBytes, randomUUID } from "crypto";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import Container, { Inject, Service } from "typedi";
import { Logger } from "winston";

@Service()
export default class DocumentService {
  constructor(@Inject("logger") private logger: Logger) {}
  public async generateCSVFile(
    data: any,
    fileName: string,
    headers: string[],
    fields: string[],
  ) {
    const csv = require("csv-writer").createObjectCsvWriter({
      path: `./${fileName}.csv`,
      header: headers.map((header) => ({ id: header, title: header })),
    });

    const records = data.map((record: any) => {
      const obj: any = {};
      fields.forEach((field) => {
        obj[field] = record[field];
      });
      return obj;
    });
    await csv.writeRecords(records);
  }
  public async saveFileToPath(data: any, fileName: string, path: string) {
    const fs = require("fs");
    fs.writeFileSync(`${path}/${fileName}`, data);

    return `${path}/${fileName}`;
  }
  public async deleteFileFromPath(path: string) {
    const fs = require("fs");
    fs.unlink(path, (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return "File deleted successfully";
  }
  public async generatePDFFile(url: string) {
    // visit a website and generate a pdf using playwright
    this.logger.info(`Generating PDF for ${url}`);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("https://checklyhq.com/learn/headless");
    // save pdf to the temp directory, making it OS independent

    const filePath = path.join(
      os.tmpdir(),
      `lable-${randomUUID()}.pdf`,
    );
    // add a delay to ensure the page is fully loaded
    await page.waitForTimeout(3000);
    await page.pdf({ path: filePath });
    this.logger.info(`PDF saved to ${filePath}`);
    await browser.close();
    return filePath;
  }
}
