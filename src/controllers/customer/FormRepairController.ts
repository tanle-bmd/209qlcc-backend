// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { FormRepair } from '../../entity/FormRepair';


@Controller("/customer/formRepair")
@Docs("docs_customer")
export class FormRepairController {
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
        let where = `formRepair.title LIKE :search 
        AND formRepair.isDeleted = false 
        AND customer.id = ${req.customer.id}`

        const [formRepairs, total] = await FormRepair.createQueryBuilder('formRepair')
            .leftJoinAndSelect('formRepair.customer', 'customer')
            .leftJoinAndSelect('formRepair.assignedStaff', 'assignedStaff')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formRepair.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formRepairs, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formRepair: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formRepair") formRepair: FormRepair,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('apartmentId') apartmentId: number,
    ) {
        formRepair.customer = req.customer
        if (buildingId) await formRepair.assignBuilding(buildingId)
        if (apartmentId) await formRepair.assignApartment(apartmentId)
        await formRepair.save()
        return res.sendOK(formRepair)
    }


    // =====================DELETE=====================
    @Post('/:formRepairId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formRepairId") formRepairId: number,
    ) {
        let formRepair = await FormRepair.findOneOrThrowId(formRepairId)
        formRepair.isDeleted = true
        await formRepair.save()
        return res.sendOK(formRepair)
    }


    // =====================RATE=====================
    @Post('/:formRepairId/rate')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async rate(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formRepairId") formRepairId: number,
        @BodyParams('star') star: number,
        @BodyParams('comment') comment: string,
    ) {
        let formRepair = await FormRepair.findOneOrThrowId(formRepairId)
        formRepair.rateStar = star
        formRepair.rateComment = comment

        await formRepair.save()
        return res.sendOK(formRepair)
    }

} // END FILE
