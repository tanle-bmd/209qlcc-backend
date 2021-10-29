// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, Post, BodyParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { SignPosition } from '../../entity-request/SignPosition';
import { PDFService } from '../../util/PDFService';


@Controller("/public/pdf")
@Docs("docs_public")
export class PdfController {
    constructor() { }


    // =====================GET LIST=====================
    @Post('')
    @Validator({
    })
    async findAll(
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('customerSignPosition') customerSignPosition: SignPosition,
        @BodyParams('staffSignPosition') staffSignPosition: SignPosition,
        @BodyParams('customerSignImage') customerSignImage: string,
        @BodyParams('staffSignImage') staffSignImage: string,
        @BodyParams('originPdf') originPdf: string,
    ) {
        const pdFService = new PDFService()

        const file = await pdFService.signPdf(
            customerSignPosition,
            staffSignPosition,
            customerSignImage,
            staffSignImage,
            originPdf
        )

        return res.sendOK({ file });
    }

} // END FILE
