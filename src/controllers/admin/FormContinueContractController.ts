// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormContinueContract } from '../../entity/FormContinueContract';


@Controller("/admin/formContinueContract")
@Docs("docs_admin")
export class FormContinueContractController {
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
        let where = `formContinueContract.note LIKE :search AND formContinueContract.isDeleted = false `

        const [formContinueContracts, total] = await FormContinueContract.createQueryBuilder('formContinueContract')
            .leftJoinAndSelect('formContinueContract.customer', 'customer')
            .leftJoinAndSelect('formContinueContract.contract', 'contract')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formContinueContract.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formContinueContracts, total });
    }

} // END FILE
