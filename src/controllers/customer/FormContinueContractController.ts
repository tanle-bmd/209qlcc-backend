// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { FormContinueContract } from '../../entity/FormContinueContract';


@Controller("/customer/formContinueContract")
@Docs("docs_customer")
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
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formContinueContract.isDeleted = false 
        AND customer.id = ${req.customer.id}`

        const [formContinueContracts, total] = await FormContinueContract.createQueryBuilder('formContinueContract')
            .leftJoinAndSelect('formContinueContract.contract', 'contract')
            .leftJoinAndSelect('formContinueContract.customer', 'customer')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formContinueContract.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formContinueContracts, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formContinueContract: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formContinueContract") formContinueContract: FormContinueContract,
        @BodyParams('contractId') contractId: number,
    ) {
        if (contractId) await formContinueContract.assignContract(contractId)
        formContinueContract.customer = req.customer
        await formContinueContract.save()
        return res.sendOK(formContinueContract)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formContinueContractId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        formContinueContract: Joi.required(),
        formContinueContractId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formContinueContract") formContinueContract: FormContinueContract,
        @PathParams("formContinueContractId") formContinueContractId: number,
    ) {
        await FormContinueContract.findOneOrThrowId(formContinueContractId)
        formContinueContract.id = +formContinueContractId
        await formContinueContract.save()

        return res.sendOK(formContinueContract)
    }

} // END FILE
