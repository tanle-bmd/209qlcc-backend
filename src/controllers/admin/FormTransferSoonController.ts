// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormTransferSoon } from '../../entity/FormTransferSoon';


@Controller("/admin/formTransferSoon")
@Docs("docs_admin")
export class FormTransferSoonController {
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
        @QueryParams("search") search: string = "",
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formTransferSoon.note LIKE :search AND formTransferSoon.isDeleted = false `

        const [formTransferSoons, total] = await FormTransferSoon.createQueryBuilder('formTransferSoon')
            .leftJoinAndSelect('formTransferSoon.contract', 'contract')
            .leftJoinAndSelect('formTransferSoon.customer', 'customer')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formTransferSoon.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formTransferSoons, total });
    }

} // END FILE
