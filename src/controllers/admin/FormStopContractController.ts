// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormStopContract } from '../../entity/FormStopContract';


@Controller("/admin/formStopContract")
@Docs("docs_admin")
export class FormStopContractController {
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
        let where = `formStopContract.note LIKE :search AND formStopContract.isDeleted = false `

        const [formStopContracts, total] = await FormStopContract.createQueryBuilder('formStopContract')
            .leftJoinAndSelect('formStopContract.customer', 'customer')
            .leftJoinAndSelect('formStopContract.contract', 'contract')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formStopContract.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formStopContracts, total });
    }

} // END FILE
