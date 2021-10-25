// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Building, BuildingStatus } from '../../entity/Building';
import { BuildingImage } from '../../entity/BuildingImage';
import { Staff } from '../../entity/Staff';
import { MultipartFile } from '@tsed/multipartfiles';
import Jimp from 'jimp';
import CONFIG from '../../../config';


@Controller("/admin/building")
@Docs("docs_admin")
export class BuildingController {
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
        @QueryParams('status') status: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `building.name LIKE :search AND building.isDeleted = false `

        if (status) {
            where += ` AND building.status = '${status}'`
        }

        const [buildings, total] = await Building.createQueryBuilder('building')
            .leftJoinAndSelect('building.buildingImages', 'buildingImages')
            .leftJoinAndSelect('building.staffs', 'staffs')
            .leftJoinAndSelect('staffs.role', 'role')
            .leftJoinAndSelect('building.apartments', 'apartments', 'apartments.isDeleted = false')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('building.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ buildings, total });
    }



    // =====================GET LIST=====================
    @Get('/:buildingId')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0)
    })
    async findOne(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingId") buildingId: number,
    ) {
        let where = `building.id = ${buildingId}`

        const building = await Building.createQueryBuilder('building')
            .leftJoinAndSelect('building.staffs', 'staffs')
            .leftJoinAndSelect('staffs.role', 'role')
            .leftJoinAndSelect('building.buildingImages', 'buildingImages')
            .leftJoinAndSelect('building.apartments', 'apartments', 'apartments.isDeleted = false')
            .where(where)
            .getOne()

        return res.sendOK(building);
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        building: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("building") building: Building,
        @BodyParams('images', String) images: string[],
    ) {
        if (images && images.length) {
            await building.assignImages(images)
        }

        await building.save()

        return res.sendOK(building)
    }


    // =====================UPDATE ITEM=====================
    @Get('/:buildingId/staffs')
    @UseAuth(VerificationJWT)
    @Validator({
        buildingId: Joi.number().required()
    })
    async getStaffs(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingId") buildingId: number,
    ) {
        let where = `staff.isDeleted = false
        AND buildings.id = ${buildingId}`
        const staffs = await Staff.createQueryBuilder('staff')
            .leftJoinAndSelect('staff.buildings', 'buildings')
            .leftJoinAndSelect('staff.role', 'role')
            .where(where)
            .orderBy('staff.id', 'DESC')
            .getMany()

        return res.sendOK(staffs)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:buildingId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        building: Joi.required(),
        buildingId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("building") building: Building,
        @PathParams("buildingId") buildingId: number,
        @BodyParams('images', String) images: string[],
    ) {
        await Building.findOneOrThrowId(buildingId)
        building.id = +buildingId

        // Handle images
        if (images && images.length) {
            await building.assignImages(images)
        }
        if (images && images.length == 0) building.buildingImages = []

        await building.save()

        return res.sendOK(building)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:buildingId/status/open')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async open(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingId") buildingId: number,
    ) {
        const building = await Building.findOneOrThrowId(buildingId)
        building.status = BuildingStatus.Open
        await building.save()

        return res.sendOK(building)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:buildingId/status/close')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async close(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingId") buildingId: number,
    ) {
        const building = await Building.findOneOrThrowId(buildingId)
        building.status = BuildingStatus.Close
        await building.save()

        return res.sendOK(building)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:buildingId/staff/add')
    @UseAuth(VerificationJWT)
    @Validator({
        buildingId: Joi.number().required()
    })
    async addStaff(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingId") buildingId: number,
        @BodyParams('staffIds', Number) staffIds: number[],
    ) {
        const building = await Building.findOneOrThrowId(buildingId, {
            relations: ['staffs']
        })

        const staffs = await Staff.createQueryBuilder('staff')
            .where(`staff.id IN (:...staffIds)`, { staffIds })
            .getMany()

        building.staffs = staffs
        await building.save()

        return res.sendOK(building)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:buildingId/staff/remove')
    @UseAuth(VerificationJWT)
    @Validator({
        buildingId: Joi.number().required()
    })
    async removeStaff(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("buildingId") buildingId: number,
        @BodyParams('staffId') staffId: number,
    ) {
        const building = await Building.findOneOrThrowId(buildingId, {
            relations: ['staffs']
        })

        const staff = await Staff.findOneOrThrowId(staffId, null, '')

        const staffs = building.staffs

        const indexOfStaff = staffs.findIndex(s => s.id == staffId)

        if (indexOfStaff != -1) {
            staffs.splice(indexOfStaff, 1)
        }

        building.staffs = staffs
        await building.save()

        return res.sendOK(building)
    }


    // =====================UPLOAD IMAGE=====================
    @Post('/upload')
    @UseAuth(VerificationJWT)
    async uploadFile(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @MultipartFile('file') file: Express.Multer.File,
    ) {
        const image = await Jimp.read(file.path)
        image.resize(700, Jimp.AUTO);
        image.quality(80)
        image.writeAsync(file.path)

        file.path = file.path.replace(CONFIG.UPLOAD_DIR, '');

        return res.sendOK(file)
    }

} // END FILE
