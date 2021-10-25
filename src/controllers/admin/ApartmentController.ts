// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Apartment } from '../../entity/Apartment';


@Controller("/admin/apartment")
@Docs("docs_admin")
export class ApartmentController {
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
        @QueryParams('status') status: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `apartment.code LIKE :search AND apartment.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        if (status) {
            where += ` AND apartment.status = '${status}'`
        }

        const [apartments, total] = await Apartment.createQueryBuilder('apartment')
            .leftJoinAndSelect('apartment.building', 'building')
            .leftJoinAndSelect('apartment.buildingServices', 'buildingServices')
            .leftJoinAndSelect('apartment.customer', 'customer')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('apartment.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ apartments, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        apartment: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("apartment") apartment: Apartment,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('buildingServiceIds', Number) buildingServiceIds: number[],
    ) {
        if (buildingId) await apartment.assignBuilding(buildingId)
        if (buildingServiceIds && buildingServiceIds.length) {
            await apartment.assignBuildingServices(buildingServiceIds)
        }
        await apartment.save()
        return res.sendOK(apartment)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:apartmentId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        apartment: Joi.required(),
        apartmentId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("apartment") apartment: Apartment,
        @PathParams("apartmentId") apartmentId: number,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('buildingServiceIds', Number) buildingServiceIds: number[],
    ) {
        await Apartment.findOneOrThrowId(apartmentId)

        apartment.id = +apartmentId
        if (buildingId) await apartment.assignBuilding(buildingId)

        if (buildingServiceIds && buildingServiceIds.length) {
            await apartment.assignBuildingServices(buildingServiceIds)
        }
        if (buildingServiceIds && buildingServiceIds.length == 0) {
            apartment.buildingServices = []
        }

        await apartment.save()

        return res.sendOK(apartment)
    }


    // =====================DELETE=====================
    @Post('/:apartmentId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("apartmentId") apartmentId: number,
    ) {
        let apartment = await Apartment.findOneOrThrowId(apartmentId)
        apartment.isDeleted = true
        await apartment.save()
        return res.sendOK(apartment)
    }

} // END FILE
