// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormTransferSoon } from '../../entity/FormTransferSoon';


@Controller("/customer/formTransferSoon")
@Docs("docs_customer")
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
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formTransferSoon.isDeleted = false 
        AND customer.id = ${req.customer.id}`

        const [formTransferSoons, total] = await FormTransferSoon.createQueryBuilder('formTransferSoon')
            .leftJoinAndSelect('formTransferSoon.contract', 'contract')
            .leftJoinAndSelect('formTransferSoon.customer', 'customer')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formTransferSoon.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formTransferSoons, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formTransferSoon: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formTransferSoon") formTransferSoon: FormTransferSoon,
        @BodyParams('contractId') contractId: number,
    ) {
        if (contractId) await formTransferSoon.assignContract(contractId)
        formTransferSoon.customer = req.customer
        await formTransferSoon.save()
        return res.sendOK(formTransferSoon)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formTransferSoonId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        formTransferSoon: Joi.required(),
        formTransferSoonId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formTransferSoon") formTransferSoon: FormTransferSoon,
        @PathParams("formTransferSoonId") formTransferSoonId: number,
    ) {
        await FormTransferSoon.findOneOrThrowId(formTransferSoonId)
        formTransferSoon.id = +formTransferSoonId
        await formTransferSoon.save()

        return res.sendOK(formTransferSoon)
    }

} // END FILE
