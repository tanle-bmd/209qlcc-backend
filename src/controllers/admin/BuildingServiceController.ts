// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { BuildingService } from '../../entity/BuildingService';


@Controller("/admin/buildingService")
@Docs("docs_admin")
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


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        buildingService: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("buildingService") buildingService: BuildingService,
        @BodyParams('buildingId') buildingId: number,
    ) {
        if (buildingId) await buildingService.assignBuilding(buildingId)
        await buildingService.save()

        return res.sendOK(buildingService)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:buildingServiceId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        buildingService: Joi.required(),
        buildingServiceId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("buildingService") buildingService: BuildingService,
        @PathParams("buildingServiceId") buildingServiceId: number,
        @BodyParams('buildingId') buildingId: number,
    ) {
        await BuildingService.findOneOrThrowId(buildingServiceId)
        buildingService.id = +buildingServiceId
        if (buildingId) await buildingService.assignBuilding(buildingId)
        await buildingService.save()

        return res.sendOK(buildingService)
    }


    // =====================DELETE=====================
    @Post('/:buildingServiceId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingServiceId") buildingServiceId: number,
    ) {
        let buildingService = await BuildingService.findOneOrThrowId(buildingServiceId)
        buildingService.isDeleted = true
        await buildingService.save()
        return res.sendOK(buildingService)
    }

} // END FILE
