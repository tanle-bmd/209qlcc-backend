// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, Post, BodyParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import JWT, { AuthType } from '../../middleware/auth/strategy/JWT';
import { CustomerService } from '../../services/CustomerService';
import { CustomerUpdate } from '../../entity-request/CustomerUpdate';
import { Password } from '../../util/password';
import { Customer } from '../../entity/Customer';
import { getCurrentTimeInt, randomString } from '../../util/helper';
import { MailService } from '../../services/MailService';
import { MultipartFile } from '@tsed/multipartfiles';
import Jimp from 'jimp';
import CONFIG from '../../../config';


@Controller("/customer/auth")
@Docs("docs_customer")
export class AuthController {
    constructor(
        private mailService: MailService,
        private customerService: CustomerService,
    ) { }


    // =====================LOGIN=====================
    @Post('/login')
    @Validator({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
    async login(
        @HeaderParams("version") version: string,
        @BodyParams('email') email: string,
        @BodyParams('password') password: string,
        @BodyParams('fcmToken') fcmToken: string,
        @Res() res: Response
    ) {
        const customer = await this.customerService.login(email, password);
        if (fcmToken) {
            customer.fcmToken = fcmToken
            await customer.save()
        }
        const token = JWT.sign({ id: customer.id, type: AuthType.Customer });

        return res.sendOK({ token })
    }


    // =====================PROFILE=====================
    @Get('/profile')
    @UseAuth(VerificationJWT)
    async getInfo(
        @HeaderParams("version") version: string,
        @HeaderParams("token") token: string,
        @HeaderParams("fcmToken") fcmToken: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        let where = `customer.id = ${req.customer.id}`
        const customer = await Customer.createQueryBuilder('customer')
            .leftJoinAndSelect('customer.apartments', 'apartments', 'apartments.isDeleted = false')
            .leftJoinAndSelect('apartments.building', 'building')
            .where(where)
            .getOne()

        if (fcmToken) {
            customer.fcmToken = fcmToken
            await customer.save()
        }

        return res.sendOK(customer)
    }


    // =====================UPDATE PROFILE=====================
    @Post('/profile')
    @UseAuth(VerificationJWT)
    async updateInfo(
        @HeaderParams("token") token: string,
        @HeaderParams("version") version: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("customer") customerUpdate: CustomerUpdate,
    ) {
        const customer = customerUpdate.toCustomer()
        customer.id = req.customer.id

        await customer.save()

        return res.sendOK(customer)
    }


    // =====================UPDATE PASSWORD=====================
    @Post('/password/update')
    @UseAuth(VerificationJWT)
    @Validator({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    })
    async changePassword(
        @HeaderParams("version") version: string,
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('oldPassword') oldPassword: string,
        @BodyParams('newPassword') newPassword: string,
    ) {
        const { customer } = req;

        await this.customerService.validatePassword(customer, oldPassword)

        if (oldPassword == newPassword) {
            return res.sendClientError('M???t kh???u m???i kh??ng ???????c tr??ng m???t kh???u c??')
        }

        // Update password
        customer.password = await Password.hash(newPassword);
        await customer.save();

        return res.sendOK(customer, 'C???p nh???t m???t kh???u th??nh c??ng');
    }


    // =====================FORGOT=====================
    @Post('/password/forgot')
    @Validator({
        email: Joi.required(),
    })
    async forgot(
        @HeaderParams("version") version: string,
        @BodyParams("email") email: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const customer = await Customer.findOne({ where: { email } })
        if (!customer) {
            return res.sendClientError('Email kh??ng t???n t???i')
        }

        const resetCode = randomString(6)
        customer.resetCode = resetCode
        await customer.save()

        this.mailService.sendMailLinkReset(resetCode, customer)

        return res.sendOK({}, 'Vui l??ng ki???m tra email v?? truy c???p v??o ???????ng link x??c nh???n.')
    }


    // =====================CONFIRM FORGOT=====================
    @Post('/password/forgot/confirm')
    @Validator({
        resetCode: Joi.required(),
    })
    async reForgot(
        @HeaderParams("version") version: string,
        @BodyParams("resetCode") resetCode: string,
        @BodyParams('newPassword') newPassword: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {

        const customer = await Customer.findOne({ where: { resetCode } })
        if (!customer) {
            return res.sendClientError("M?? d??ng ????? thay ?????i m???t kh???u")
        }

        customer.password = await Password.hash(newPassword)
        customer.resetCode = ''
        await customer.save()

        // this.mailService.sendMailReset(newPassword, customer)

        return res.sendOK(customer)
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
