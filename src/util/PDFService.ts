// IMPORT LIBRARY
import { Service } from "@tsed/common";
import fs from "fs";
import path from "path"
import { PDFDocument, PDFPageDrawImageOptions } from "pdf-lib";
import { decode as atob, encode as btoa } from "base-64";
import { SignPosition } from "../entity-request/SignPosition";
import CONFIG from "../../config";

// IMPORT CUSTOM


@Service()
export class PDFService {

    public async signPdf(
        customerSignPosition: SignPosition,
        staffSignPosition: SignPosition,
        customerSignImage: string,
        staffSignImage: string,
        originPdf: string
    ) {
        //pdf buffer

        console.log('`${CONFIG.UPLOAD_DIR}/${originPdf}`:', `${CONFIG.UPLOAD_DIR}/${originPdf}`)
        const pdfFileBase64 = fs.readFileSync(`${CONFIG.UPLOAD_DIR}/${originPdf}`, {
            encoding: 'base64'
        })
        const pdfFileArrayBuffer = this._base64ToArrayBuffer(pdfFileBase64);
        const pdfDoc = await PDFDocument.load(pdfFileArrayBuffer);
        const pages = pdfDoc.getPages();
        //end pdf buffer


        let staffSignBase64, customerSignBase64 = null, staffSignArrayBuffer = null, customerSignArrayBuffer = null

        //sign staff
        if (staffSignImage) {
            staffSignBase64 = fs.readFileSync(`${CONFIG.UPLOAD_DIR}/${staffSignImage}`, {
                encoding: 'base64'
            })
            staffSignArrayBuffer = this._base64ToArrayBuffer(staffSignBase64);
            const staffPage = pages[staffSignPosition.page - 1];
            const signatureImage = await pdfDoc.embedPng(staffSignArrayBuffer);
            staffPage.drawImage(signatureImage, {
                x: staffSignPosition.x, y: staffSignPosition.y,
                width: 200,
                height: 200
            });
        }
        //--end sign staff

        //sign customer 
        if (customerSignImage) {
            customerSignBase64 = fs.readFileSync(`${CONFIG.UPLOAD_DIR}/${customerSignImage}`, {
                encoding: 'base64'
            })
            customerSignArrayBuffer = this._base64ToArrayBuffer(customerSignBase64);
            const customerPage = pages[customerSignPosition.page - 1];
            const signatureImage = await pdfDoc.embedPng(customerSignArrayBuffer);
            customerPage.drawImage(signatureImage, {
                x: customerSignPosition.x, y: customerSignPosition.y,
                width: 200,
                height: 200
            });
        }
        //--end sign customer

        // save pdf
        const pdfBytes = await pdfDoc.save();
        const pdfBase64 = this._uint8ToBase64(pdfBytes);
        const newPath = `signed/signed_${Date.now()}.pdf`
        const outFilePdf = path.resolve(`${CONFIG.UPLOAD_DIR}/${newPath}`)
        fs.writeFileSync(outFilePdf, pdfBase64, {
            encoding: 'base64'
        })
        //--end save pdf

        return newPath
    }

    private _uint8ToBase64 = (u8Arr) => {
        const CHUNK_SIZE = 0x8000; //arbitrary number
        let index = 0;
        const length = u8Arr.length;
        let result = "";
        let slice;
        while (index < length) {
            slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return btoa(result);
    };

    private _base64ToArrayBuffer = (base64) => {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    };

} //END FILE
