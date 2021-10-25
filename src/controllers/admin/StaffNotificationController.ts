// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { StaffNotification } from '../../entity/StaffNotification';
import { MultipartFile } from '@tsed/multipartfiles';
import Jimp from 'jimp';
import CONFIG from '../../../config';


@Controller("/admin/staffNotification")
@Docs("docs_admin")
export class StaffNotificationController {
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
        let where = `staffNotification.title LIKE :search AND staffNotification.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        const [staffNotifications, total] = await StaffNotification.createQueryBuilder('staffNotification')
            .leftJoinAndSelect('staffNotification.staffs', 'staffs')
            .leftJoinAndSelect('staffNotification.building', 'building')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('staffNotification.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ staffNotifications, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        staffNotification: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("staffNotification") staffNotification: StaffNotification,
        @BodyParams('staffIds', Number) staffIds: number[],
        @BodyParams('buildingId') buildingId: number,
    ) {
        if (staffIds && staffIds.length) await staffNotification.assignStaff(staffIds)
        if (buildingId) await staffNotification.assignBuilding(buildingId)
        await staffNotification.save()
        return res.sendOK(staffNotification)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:staffNotificationId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        staffNotification: Joi.required(),
        staffNotificationId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("staffNotification") staffNotification: StaffNotification,
        @PathParams("staffNotificationId") staffNotificationId: number,
        @BodyParams('staffIds', Number) staffIds: number[],
    ) {
        if (staffIds && staffIds.length) await staffNotification.assignStaff(staffIds)
        await StaffNotification.findOneOrThrowId(staffNotificationId)
        staffNotification.id = +staffNotificationId
        await staffNotification.save()

        return res.sendOK(staffNotification)
    }


    // =====================DELETE=====================
    @Post('/:staffNotificationId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("staffNotificationId") staffNotificationId: number,
    ) {
        let staffNotification = await StaffNotification.findOneOrThrowId(staffNotificationId)
        staffNotification.isDeleted = true
        await staffNotification.save()
        return res.sendOK(staffNotification)
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
