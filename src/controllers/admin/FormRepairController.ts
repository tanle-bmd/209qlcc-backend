// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { FormRepair, FormRepairStatus } from '../../entity/FormRepair';
import { Staff } from '../../entity/Staff';
import { getCurrentTimeInt } from '../../util/helper';


@Controller("/admin/formRepair")
@Docs("docs_admin")
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
        @QueryParams('buildingId') buildingId: number,
        @QueryParams('apartmentId') apartmentId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formRepair.title LIKE :search AND formRepair.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        if (apartmentId) {
            where += ` AND apartment.id = ${apartmentId}`
        }

        const [formRepairs, total] = await FormRepair.createQueryBuilder('formRepair')
            .leftJoinAndSelect('formRepair.customer', 'customer')
            .leftJoinAndSelect('formRepair.building', 'building')
            .leftJoinAndSelect('formRepair.apartment', 'apartment')
            .leftJoinAndSelect('formRepair.assignedStaff', 'assignedStaff')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formRepair.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formRepairs, total });
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formRepairId/assignStaff')
    @UseAuth(VerificationJWT)
    @Validator({
        formRepairId: Joi.number().required()
    })
    async assignStaff(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('staffId') staffId: number,
        @PathParams("formRepairId") formRepairId: number,
    ) {
        const formRepair = await FormRepair.findOneOrThrowId(formRepairId)
        const staff = await Staff.findOneOrThrowId(staffId, null, '')
        formRepair.assignedStaff = staff
        formRepair.status = FormRepairStatus.Processing
        formRepair.assignAt = getCurrentTimeInt()
        await formRepair.save()

        return res.sendOK(formRepair)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formRepairId/complete')
    @UseAuth(VerificationJWT)
    @Validator({
        formRepairId: Joi.number().required()
    })
    async complete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formRepairId") formRepairId: number,
    ) {
        const formRepair = await FormRepair.findOneOrThrowId(formRepairId)
        formRepair.status = FormRepairStatus.Complete
        formRepair.completeAt = getCurrentTimeInt()
        await formRepair.save()

        return res.sendOK(formRepair)
    }

} // END FILE
