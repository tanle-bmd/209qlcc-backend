// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormService, FormServiceStatus } from '../../entity/FormService';
import { Staff } from '../../entity/Staff';
import { getCurrentTimeInt } from '../../util/helper';


@Controller("/admin/formService")
@Docs("docs_admin")
export class FormServiceController {
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
        let where = `formService.title LIKE :search AND formService.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        if (apartmentId) {
            where += ` AND apartment.id = ${apartmentId}`
        }

        const [formServices, total] = await FormService.createQueryBuilder('formService')
            .leftJoinAndSelect('formService.customer', 'customer')
            .leftJoinAndSelect('formService.building', 'building')
            .leftJoinAndSelect('formService.apartment', 'apartment')
            .leftJoinAndSelect('formService.assignedStaff', 'assignedStaff')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formService.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formServices, total });
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formServiceId/assignStaff')
    @UseAuth(VerificationJWT)
    @Validator({
        formServiceId: Joi.number().required()
    })
    async assignStaff(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('staffId') staffId: number,
        @PathParams("formServiceId") formServiceId: number,
    ) {
        const formService = await FormService.findOneOrThrowId(formServiceId)
        const staff = await Staff.findOneOrThrowId(staffId, null, '')
        formService.assignedStaff = staff
        formService.status = FormServiceStatus.Processing
        formService.assignAt = getCurrentTimeInt()
        await formService.save()

        return res.sendOK(formService)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formServiceId/complete')
    @UseAuth(VerificationJWT)
    @Validator({
        formServiceId: Joi.number().required()
    })
    async complete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formServiceId") formServiceId: number,
    ) {
        const formService = await FormService.findOneOrThrowId(formServiceId)
        formService.status = FormServiceStatus.Complete
        formService.completeAt = getCurrentTimeInt()
        await formService.save()

        return res.sendOK(formService)
    }


} // END FILE
