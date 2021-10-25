// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormEmergency, FormEmergencyStatus } from '../../entity/FormEmergency';
import { Staff } from '../../entity/Staff';
import { getCurrentTimeInt } from '../../util/helper';


@Controller("/admin/formEmergency")
@Docs("docs_admin")
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
        @QueryParams('buildingId') buildingId: number,
        @QueryParams('apartmentId') apartmentId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formEmergency.title LIKE :search AND formEmergency.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        if (apartmentId) {
            where += ` AND apartment.id = ${apartmentId}`
        }

        const [formEmergencies, total] = await FormEmergency.createQueryBuilder('formEmergency')
            .leftJoinAndSelect('formEmergency.customer', 'customer')
            .leftJoinAndSelect('formEmergency.building', 'building')
            .leftJoinAndSelect('formEmergency.apartment', 'apartment')
            .leftJoinAndSelect('formEmergency.assignedStaff', 'assignedStaff')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formEmergency.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formEmergencies, total });
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formEmergencyId/assignStaff')
    @UseAuth(VerificationJWT)
    @Validator({
        formEmergencyId: Joi.number().required()
    })
    async assignStaff(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('staffId') staffId: number,
        @PathParams("formEmergencyId") formEmergencyId: number,
    ) {
        const formEmergency = await FormEmergency.findOneOrThrowId(formEmergencyId)
        const staff = await Staff.findOneOrThrowId(staffId, null, '')
        formEmergency.assignedStaff = staff
        formEmergency.status = FormEmergencyStatus.Processing
        formEmergency.assignAt = getCurrentTimeInt()
        await formEmergency.save()

        return res.sendOK(formEmergency)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formEmergencyId/complete')
    @UseAuth(VerificationJWT)
    @Validator({
        formEmergencyId: Joi.number().required()
    })
    async complete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formEmergencyId") formEmergencyId: number,
    ) {
        const formEmergency = await FormEmergency.findOneOrThrowId(formEmergencyId)
        formEmergency.status = FormEmergencyStatus.Complete
        formEmergency.completeAt = getCurrentTimeInt()
        await formEmergency.save()

        return res.sendOK(formEmergency)
    }

} // END FILE
