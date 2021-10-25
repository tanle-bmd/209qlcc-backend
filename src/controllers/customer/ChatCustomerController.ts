// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { ChatCustomer } from '../../entity/ChatCustomer';
import { ChatCustomerService } from '../../services/ChatCustomerService';


@Controller("/customer/chatCustomer")
@Docs("docs_customer")
export class ChatCustomerController {
    constructor(
        private chatCustomerService: ChatCustomerService,
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
        @Req() req: Request,
        @Res() res: Response
    ) {
        const { chatCustomers, total } = await this.chatCustomerService
            .getManyAndCount({ page, limit, customer: req.customer })

        return res.sendOK({ chatCustomers, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        content: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("content") content: string,
    ) {
        const chat = await this.chatCustomerService.createChatSenderCustomer(req.customer, content)
        // OneSignal.pushNotificationAll({
        //     content: `${req.customer.name} vừa gửi 1 tin nhắn.`,
        //     heading: 'TIN NHAN MOI',
        //     url: 'chat/index',
        //     data: {
        //         type: 'CUSTOMER',
        //         customerId: req.customer.id,
        //         message: content
        //     }
        // })
        return res.sendOK(chat)
    }
} // END FILE
