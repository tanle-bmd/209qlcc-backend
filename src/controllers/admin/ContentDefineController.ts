import { ContentDefineService } from './../../services/ContentDefineService';
import { Controller, Post, UseAuth, Res, Response, HeaderParams, BodyParams, Get, PathParams, Req, Request, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { ContentDefine, ContentDefineType } from '../../entity/ContentDefine';
import faker from 'faker'
import { MultipartFile } from '@tsed/multipartfiles';
import CONFIG from '../../../config';


@Controller("/admin/contentDefine")
@Docs("docs_admin")
export class ContentDefineController {
    constructor(
        private contentDefineService: ContentDefineService
    ) { }


    // =====================GET LIST=====================
    @Get('')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async findAll(
        @HeaderParams("token") token: string,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        const contentDefines = await ContentDefine.find()

        return res.sendOK(contentDefines)
    }


    // =====================GET ITEM=====================
    @Get('/type')
    @UseAuth(VerificationJWT)
    @Validator({
        type: Joi.string().required()
    })
    async findOne(
        @HeaderParams("token") token: string,
        @QueryParams("type") type: ContentDefineType,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const content = await ContentDefine.findOneOrThrowOption({
            where: { type }
        })
        return res.sendOK(content)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:contentDefineId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        contentDefine: Joi.required(),
    })
    async update(
        @HeaderParams('token') token: string,
        @Res() res: Response,
        @Req() req: Request,
        @BodyParams("contentDefine") contentDefine: ContentDefine,
        @PathParams("contentDefineId") contentDefineId: number,
    ) {
        await ContentDefine.findOneOrThrowId(+contentDefineId)
        contentDefine.id = contentDefineId
        await contentDefine.save()

        return res.sendOK(contentDefine)
    }


    // =====================UPLOAD IMAGE=====================
    @Post('/upload')
    @UseAuth(VerificationJWT)
    uploadFile(
        @HeaderParams('token') token: string,
        @Res() res: Response,
        @Req() req: Request,
        @MultipartFile('file') file: Express.Multer.File,
    ) {
        file.path = file.path.replace(CONFIG.UPLOAD_DIR, '');
        return res.sendOK(file);
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        contentDefine: Joi.required()
    })
    async create(
        @HeaderParams('token') token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('contentDefine') contentDefine: ContentDefine
    ) {
        await contentDefine.save();
        return res.sendOK(contentDefine)
    }

} // END FILE
