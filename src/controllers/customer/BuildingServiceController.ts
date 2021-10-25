// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { BuildingService } from '../../entity/BuildingService';


@Controller("/customer/buildingService")
@Docs("docs_customer")
export class BuildingServiceController {
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
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `buildingService.name LIKE :search AND buildingService.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        const [buildingServices, total] = await BuildingService.createQueryBuilder('buildingService')
            .leftJoinAndSelect('buildingService.building', 'building')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('buildingService.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ buildingServices, total });
    }

} // END FILE
