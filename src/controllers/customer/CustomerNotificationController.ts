// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { CustomerNotification } from '../../entity/CustomerNotification';


@Controller("/customer/customerNotification")
@Docs("docs_customer")
export class CustomerNotificationController {
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
        @QueryParams('buildingId') buildingId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `customerNotification.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        const [customerNotifications, total] = await CustomerNotification.createQueryBuilder('customerNotification')
            .leftJoinAndSelect('customerNotification.building', 'building')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('customerNotification.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ customerNotifications, total });
    }

} // END FILE
