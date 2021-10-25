// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Banner } from '../../entity/Banner';


@Controller("/customer/banner")
@Docs("docs_customer")
export class BannerController {
    constructor() { }


    // =====================GET LIST=====================
    @Get('')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0)
    })
    async findAll(
        @HeaderParams("token") token: string,
        @QueryParams("page") page: number = 1,
        @QueryParams("limit") limit: number = 0,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `banner.isDeleted = false `

        const [banners, total] = await Banner.createQueryBuilder('banner')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('banner.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ banners, total });
    }

} // END FILE
