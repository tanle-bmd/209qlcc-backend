// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, Post, BodyParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { StaffService } from '../../services/StaffService';
import JWT, { AuthType } from '../../middleware/auth/strategy/JWT';
import { Staff } from '../../entity/Staff';
import { MultipartFile } from '@tsed/multipartfiles';
import Jimp from 'jimp';
import CONFIG from '../../../config';


@Controller("/admin/auth")
@Docs("docs_admin")
export class AuthController {
    constructor(
        private staffService: StaffService,
    ) { }


    // =====================LOGIN=====================
    @Post('/login')
    @Validator({
        username: Joi.string().required(),
        password: Joi.string().required()
    })
    async login(
        @BodyParams('username') username: string,
        @BodyParams('password') password: string,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        const staff = await this.staffService.login(username, password);
        const token = JWT.sign({ id: staff.id, type: AuthType.Staff });

        return res.sendOK({ token })
    }


    // =====================PROFILE=====================
    @Get('/profile')
    @UseAuth(VerificationJWT)
    async getInfo(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
    ) {
        let where = `staff.id = ${req.staff.id}`
        const staff = await Staff.createQueryBuilder('staff')
            .leftJoinAndSelect('staff.role', 'role')
            .leftJoinAndSelect('role.permissions', 'permissions')
            .leftJoinAndSelect('staff.buildings', 'buildings', 'buildings.isDeleted = false')
            .where(where)
            .getOne()

        return res.sendOK(staff)
    }


    // =====================PROFILE=====================
    @Post('/profile')
    @UseAuth(VerificationJWT)
    async updateProfile(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @BodyParams('profile') profile: Staff,
    ) {
        profile.id = req.staff.id
        await profile.save()

        return res.sendOK(profile)
    }


    // =====================UPDATE PASSWORD=====================
    @Post('/password/update')
    @UseAuth(VerificationJWT)
    @Validator({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    })
    async changePassword(
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('oldPassword') oldPassword: string,
        @BodyParams('newPassword') newPassword: string,
        @HeaderParams("token") token: string,
    ) {
        const { staff } = req;

        await this.staffService.changePassword({ staff, oldPassword, newPassword })

        return res.sendOK(staff, 'Cập nhật mật khẩu thành công');
    }


    // =====================GET PERMISSION=====================
    @Get('/profile/permission')
    @UseAuth(VerificationJWT)
    async getPermission(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
    ) {
        const { id } = req.staff;
        const permissions = await this.staffService.getPermission(id);

        return res.sendOK(permissions);
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
