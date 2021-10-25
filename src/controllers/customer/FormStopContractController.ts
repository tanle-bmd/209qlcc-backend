// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormStopContract } from '../../entity/FormStopContract';


@Controller("/customer/formStopContract")
@Docs("docs_customer")
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
        let where = `formStopContract.note LIKE :search 
        AND formStopContract.isDeleted = false 
        AND customer.id = ${req.customer.id}`

        const [formStopContracts, total] = await FormStopContract.createQueryBuilder('formStopContract')
            .leftJoinAndSelect('formStopContract.contract', 'contract')
            .leftJoinAndSelect('formStopContract.customer', 'customer')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formStopContract.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formStopContracts, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formStopContract: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formStopContract") formStopContract: FormStopContract,
        @BodyParams('contractId') contractId: number,
    ) {
        if (contractId) await formStopContract.assignContract(contractId)
        formStopContract.customer = req.customer
        await formStopContract.save()
        return res.sendOK(formStopContract)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formStopContractId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        formStopContract: Joi.required(),
        formStopContractId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formStopContract") formStopContract: FormStopContract,
        @PathParams("formStopContractId") formStopContractId: number,
    ) {
        await FormStopContract.findOneOrThrowId(formStopContractId)
        formStopContract.id = +formStopContractId
        await formStopContract.save()

        return res.sendOK(formStopContract)
    }

} // END FILE
