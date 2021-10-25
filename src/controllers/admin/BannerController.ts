// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Banner } from '../../entity/Banner';
import { MultipartFile } from '@tsed/multipartfiles';
import Jimp from 'jimp';
import CONFIG from '../../../config';


@Controller("/admin/banner")
@Docs("docs_admin")
export class BannerController {
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
        let where = `banner.title LIKE :search AND banner.isDeleted = false `

        const [banners, total] = await Banner.createQueryBuilder('banner')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('banner.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ banners, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        banner: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("banner") banner: Banner,
    ) {
        await banner.save()
        return res.sendOK(banner)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:bannerId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        banner: Joi.required(),
        bannerId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("banner") banner: Banner,
        @PathParams("bannerId") bannerId: number,
    ) {
        await Banner.findOneOrThrowId(bannerId)
        banner.id = +bannerId
        await banner.save()

        return res.sendOK(banner)
    }


    // =====================DELETE=====================
    @Post('/:bannerId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("bannerId") bannerId: number,
    ) {
        let banner = await Banner.findOneOrThrowId(bannerId)
        await banner.remove()
        return res.sendOK(banner)
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
