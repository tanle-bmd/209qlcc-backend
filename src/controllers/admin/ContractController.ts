// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Contract, ContractStatus } from '../../entity/Contract';
import { MultipartFile } from '@tsed/multipartfiles';
import CONFIG from '../../../config';


@Controller("/admin/contract")
@Docs("docs_admin")
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
        @QueryParams("search") search: string = "",
        @QueryParams('customerId') customerId: number,
        @QueryParams('type') type: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `CONCAT(contract.name, ' ', customer.code, ' ', customer.name ) LIKE :search AND contract.isDeleted = false `

        if (customerId) {
            where += ` AND customer.id = ${customerId}`
        }

        if (type) {
            where += ` AND contract.type = '${type}'`
        }

        const [contracts, total] = await Contract.createQueryBuilder('contract')
            .leftJoinAndSelect('contract.customer', 'customer')
            .leftJoinAndSelect('contract.createdStaff', 'createdStaff')
            .leftJoinAndSelect('contract.building', 'building')
            .leftJoinAndSelect('contract.apartment', 'apartment')
            .where(where, { search: `%${search}%` })
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
        @QueryParams('value') value: string,
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


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        contract: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("contract") contract: Contract,
        @BodyParams('customerId') customerId: number,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('apartmentId') apartmentId: number,
    ) {
        if (customerId) await contract.assignCustomer(customerId)
        if (buildingId) await contract.assignBuilding(buildingId)
        if (apartmentId) await contract.assignApartment(apartmentId)
        contract.createdStaff = req.staff
        await contract.generateCode()
        await contract.save()
        return res.sendOK(contract)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:contractId/sent')
    @UseAuth(VerificationJWT)
    @Validator({
        contractId: Joi.number().required()
    })
    async sent(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("contractId") contractId: number,
    ) {
        const contract = await Contract.findOneOrThrowId(contractId)
        contract.isSent = true
        await contract.save()

        return res.sendOK(contract)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:contractId/complete')
    @UseAuth(VerificationJWT)
    @Validator({
        contractId: Joi.number().required()
    })
    async complete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("contractId") contractId: number,
    ) {
        const contract = await Contract.findOneOrThrowId(contractId)
        contract.status = ContractStatus.Complete
        await contract.save()

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
        @BodyParams('customerId') customerId: number,
    ) {
        await Contract.findOneOrThrowId(contractId)
        contract.id = +contractId
        if (customerId) await contract.assignCustomer(customerId)
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


    // =====================DELETE=====================
    @Post('/:contractId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("contractId") contractId: number,
    ) {
        let contract = await Contract.findOneOrThrowId(contractId)
        contract.isDeleted = true
        await contract.save()
        return res.sendOK(contract)
    }




} // END FILE
