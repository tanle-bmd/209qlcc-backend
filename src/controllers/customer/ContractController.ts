// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, Post, BodyParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Contract } from '../../entity/Contract';
import { MultipartFile } from '@tsed/multipartfiles';
import CONFIG from '../../../config';


@Controller("/customer/contract")
@Docs("docs_customer")
export class ContractController {
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
        @QueryParams('type') type: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `contract.isDeleted = false 
        AND customer.id = ${req.customer.id}
        AND contract.isSent = true`

        if (type) {
            where += ` AND contract.type = '${type}'`
        }

        const [contracts, total] = await Contract.createQueryBuilder('contract')
            .leftJoinAndSelect('contract.customer', 'customer')
            .leftJoinAndSelect('contract.createdStaff', 'createdStaff')
            .leftJoinAndSelect('contract.building', 'building')
            .leftJoinAndSelect('contract.apartment', 'apartment')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('contract.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ contracts, total });
    }


    // =====================METHOD=====================
    @Get('/:contractId')
    @UseAuth(VerificationJWT)
    @Validator({})
    async method(
        @HeaderParams("token") token: string,
        @Res() res: Response,
        @Req() req: Request,
        @PathParams("contractId") contractId: number,
    ) {
        const contract = await Contract.createQueryBuilder('contract')
            .leftJoinAndSelect('contract.customer', 'customer')
            .leftJoinAndSelect('contract.createdStaff', 'createdStaff')
            .leftJoinAndSelect('contract.building', 'building')
            .leftJoinAndSelect('contract.apartment', 'apartment')
            .where(`contract.id = ${contractId}`)
            .orderBy('contract.id', 'DESC')
            .getOne()

        return res.sendOK(contract)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:contractId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        contract: Joi.required(),
        contractId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("contract") contract: Contract,
        @PathParams("contractId") contractId: number,
    ) {
        await Contract.findOneOrThrowId(contractId)
        contract.id = +contractId
        await contract.save()

        return res.sendOK(contract)
    }


    // =====================UPLOAD IMAGE=====================
    @Post('/upload')
    @UseAuth(VerificationJWT)
    uploadFile(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @MultipartFile('file') file: Express.Multer.File,
    ) {
        file.path = file.path.replace(CONFIG.UPLOAD_DIR, '');
        return res.sendOK(file)
    }


} // END FILE
