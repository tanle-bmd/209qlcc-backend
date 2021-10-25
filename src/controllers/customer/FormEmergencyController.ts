// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { FormEmergency } from '../../entity/FormEmergency';


@Controller("/customer/formEmergency")
@Docs("docs_customer")
export class FormEmergencyController {
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
        let where = `formEmergency.title LIKE :search 
        AND formEmergency.isDeleted = false 
        AND customer.id = ${req.customer.id}`

        const [formEmergencies, total] = await FormEmergency.createQueryBuilder('formEmergency')
            .leftJoinAndSelect('formEmergency.customer', 'customer')
            .leftJoinAndSelect('formEmergency.assignedStaff', 'assignedStaff')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formEmergency.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formEmergencies, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formEmergency: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formEmergency") formEmergency: FormEmergency,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('apartmentId') apartmentId: number,
    ) {
        formEmergency.customer = req.customer
        if (buildingId) await formEmergency.assignBuilding(buildingId)
        if (apartmentId) await formEmergency.assignApartment(apartmentId)
        await formEmergency.save()
        return res.sendOK(formEmergency)
    }


    // =====================DELETE=====================
    @Post('/:formEmergencyId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formEmergencyId") formEmergencyId: number,
    ) {
        let formEmergency = await FormEmergency.findOneOrThrowId(formEmergencyId)
        formEmergency.isDeleted = true
        await formEmergency.save()
        return res.sendOK(formEmergency)
    }


    // =====================RATE=====================
    @Post('/:formEmergencyId/rate')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async rate(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formEmergencyId") formEmergencyId: number,
        @BodyParams('star') star: number,
        @BodyParams('comment') comment: string,
    ) {
        let formEmergency = await FormEmergency.findOneOrThrowId(formEmergencyId)
        formEmergency.rateStar = star
        formEmergency.rateComment = comment
        await formEmergency.save()
        return res.sendOK(formEmergency)
    }


} // END FILE
