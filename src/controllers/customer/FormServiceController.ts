// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { FormService } from '../../entity/FormService';


@Controller("/customer/formService")
@Docs("docs_customer")
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
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `formService.title LIKE :search 
        AND formService.isDeleted = false 
        AND customer.id = ${req.customer.id}`

        const [formServices, total] = await FormService.createQueryBuilder('formService')
            .leftJoinAndSelect('formService.customer', 'customer')
            .leftJoinAndSelect('formService.buildingService', 'buildingService')
            .leftJoinAndSelect('formService.assignedStaff', 'assignedStaff')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('formService.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ formServices, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        formService: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("formService") formService: FormService,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('apartmentId') apartmentId: number,
    ) {
        formService.customer = req.customer
        if (buildingId) await formService.assignBuilding(buildingId)
        if (apartmentId) await formService.assignApartment(apartmentId)
        await formService.save()
        return res.sendOK(formService)
    }


    // =====================DELETE=====================
    @Post('/:formServiceId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formServiceId") formServiceId: number,
    ) {
        let formService = await FormService.findOneOrThrowId(formServiceId)
        formService.isDeleted = true
        await formService.save()
        return res.sendOK(formService)
    }


    // =====================RATE=====================
    @Post('/:formServiceId/rate')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async rate(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("formServiceId") formServiceId: number,
        @BodyParams('star') star: number,
        @BodyParams('comment') comment: string,
    ) {
        let formService = await FormService.findOneOrThrowId(formServiceId)
        formService.rateStar = star
        formService.rateComment = comment
        await formService.save()
        return res.sendOK(formService)
    }

} // END FILE
