// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { CustomerNotification, EventCustomerNotification } from '../../entity/CustomerNotification';
import { Firebase, MessageSend } from '../../util/firebase';
import { CustomerNotificationService } from '../../services/CustomerNotificationService';


@Controller("/admin/customerNotification")
@Docs("docs_admin")
export class CustomerNotificationController {
    constructor(
        private customerNotificationService: CustomerNotificationService,
    ) { }


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
        let where = `customerNotification.title LIKE :search 
        AND customerNotification.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        const [customerNotifications, total] = await CustomerNotification.createQueryBuilder('customerNotification')
            .leftJoinAndSelect('customerNotification.building', 'building')
            .leftJoinAndSelect('customerNotification.customer', 'customer')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('customerNotification.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ customerNotifications, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        customerNotification: Joi.required(),
        buildingId: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("customerNotification") customerNotification: CustomerNotification,
        @BodyParams('buildingId') buildingId: number,
    ) {
        if (buildingId) await customerNotification.assignBuilding(buildingId)
        await customerNotification.save()

        // Send notification
        this.customerNotificationService.sendNotificationToBuilding(buildingId, customerNotification)

        return res.sendOK(customerNotification)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:customerNotificationId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        customerNotification: Joi.required(),
        customerNotificationId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("customerNotification") customerNotification: CustomerNotification,
        @PathParams("customerNotificationId") customerNotificationId: number,
        @BodyParams('buildingId') buildingId: number,
    ) {
        await CustomerNotification.findOneOrThrowId(customerNotificationId)
        customerNotification.id = +customerNotificationId
        if (buildingId) await customerNotification.assignBuilding(buildingId)
        await customerNotification.save()

        return res.sendOK(customerNotification)
    }


    // =====================DELETE=====================
    @Post('/:customerNotificationId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("customerNotificationId") customerNotificationId: number,
    ) {
        let customerNotification = await CustomerNotification.findOneOrThrowId(customerNotificationId)
        customerNotification.isDeleted = true
        await customerNotification.save()
        return res.sendOK(customerNotification)
    }

} // END FILE
