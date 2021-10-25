// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { FormStaffSupport } from '../../entity/FormStaffSupport';


@Controller("/admin/formStaffSupport")
@Docs("docs_admin")
export class FormStaffSupportController {
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
        @QueryParams('isMine') isMine: boolean = false,
        @QueryParams('isAnother') isAnother: boolean = false,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formStaffSupport.title LIKE :search AND formStaffSupport.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        if (isMine) {
            where += ` AND staff.id = ${req.staff.id}`
        }

        if (isAnother) {
            where += ` AND staff.id <> ${req.staff.id}`
        }

        const [formStaffSupports, total] = await FormStaffSupport.createQueryBuilder('formStaffSupport')
            .leftJoinAndSelect('formStaffSupport.staff', 'staff')
            .leftJoinAndSelect('formStaffSupport.building', 'building')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formStaffSupport.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formStaffSupports, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formStaffSupport: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formStaffSupport") formStaffSupport: FormStaffSupport,
        @BodyParams('buildingId') buildingId: number,
    ) {
        if (buildingId) await formStaffSupport.assignBuilding(buildingId)
        formStaffSupport.staff = req.staff
        await formStaffSupport.save()
        return res.sendOK(formStaffSupport)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:formStaffSupportId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        formStaffSupport: Joi.required(),
        formStaffSupportId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formStaffSupport") formStaffSupport: FormStaffSupport,
        @PathParams("formStaffSupportId") formStaffSupportId: number,
        @BodyParams('buildingId') buildingId: number,
    ) {
        await FormStaffSupport.findOneOrThrowId(formStaffSupportId)
        formStaffSupport.id = +formStaffSupportId
        if (buildingId) await formStaffSupport.assignBuilding(buildingId)
        await formStaffSupport.save()

        return res.sendOK(formStaffSupport)
    }


    // =====================DELETE=====================
    @Post('/:formStaffSupportId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formStaffSupportId") formStaffSupportId: number,
    ) {
        let formStaffSupport = await FormStaffSupport.findOneOrThrowId(formStaffSupportId)
        formStaffSupport.isDeleted = true
        await formStaffSupport.save()
        return res.sendOK(formStaffSupport)
    }

} // END FILE
