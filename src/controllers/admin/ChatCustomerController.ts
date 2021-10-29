// IMPORT LIBRARY
import { Controller, UseAuth, Req, Get, Res, Response, HeaderParams, PathParams, QueryParams, BodyParams, Post } from '@tsed/common';
import Joi from '@hapi/joi';
import { Docs } from '@tsed/swagger';
import { Request } from 'express';


// IMPORT CUSTOM
import { Validator } from '../../middleware/validator/Validator';
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { ChatCustomer } from '../../entity/ChatCustomer';
import { Customer } from '../../entity/Customer';
import { paginate } from '../../util/helper';
import { ChatCustomerService } from '../../services/ChatCustomerService';
import { EventCustomerNotification } from '../../entity/CustomerNotification';
import { Firebase, MessageSend } from '../../util/firebase';


@Controller("/admin/chatCustomer")
@Docs("docs_admin")
export class ChatCustomerController {
    constructor(
        private chatCustomerService: ChatCustomerService,
    ) { }


    // =====================GET LIST=====================
    @Get('/customers')
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
        let where = `customer.isDeleted = false`

        if (search) {
            where += ` AND customer.name LIKE :search`
        }

        const customers = await Customer.createQueryBuilder('customer')
            .select("customer.*")
            .addSelect("IFNULL( MAX(chatCustomers.id), 0)", 'maxId')
            .leftJoin('customer.chatCustomers', 'chatCustomers')
            .where(where, { search: `%${search}%` })
            .offset((page - 1) * limit)
            .limit(limit)
            .groupBy('customer.id')
            .having('maxId <> 0')
            .orderBy({ 'maxId': "DESC", 'customer.messagePending': 'DESC' })
            .getRawMany()

        const pagination = paginate(customers, limit, page)

        return res.sendOK({ customers: pagination, total: customers.length });
    }


    // =====================GET ITEM=====================
    @Get('/customers/:customerId')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0)
    })
    async findOne(
        @HeaderParams("token") token: string,
        @QueryParams("page") page: number = 1,
        @QueryParams("limit") limit: number = 0,
        @PathParams('customerId') customerId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `chatCustomer.isDeleted = false AND customer.id = ${customerId}`

        const [chatCustomers, total] = await ChatCustomer.createQueryBuilder('chatCustomer')
            .leftJoinAndSelect('chatCustomer.customer', 'customer')
            .leftJoinAndSelect('chatCustomer.staff', 'staff')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('chatCustomer.id', 'DESC')
            .getManyAndCount()

        const customer = await Customer.findOneOrThrowId(customerId, null, '')
        customer.messagePending = 0
        await customer.save()

        return res.sendOK({ chatCustomers: chatCustomers.reverse(), total });
    }



    // =====================GET ITEM=====================
    @Post('/customers/:customerId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async deleteAll(
        @HeaderParams("token") token: string,
        @PathParams('customerId') customerId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `chatCustomer.isDeleted = false AND customer.id = ${customerId}`

        const chatCustomers = await ChatCustomer.createQueryBuilder('chatCustomer')
            .leftJoinAndSelect('chatCustomer.customer', 'customer')
            .where(where)
            .getMany()

        await ChatCustomer.remove(chatCustomers)

        return res.sendOK(null);
    }


    // =====================CREATE ITEM=====================
    @Post('/customers/:customerId')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("content") content: string,
        @PathParams('customerId') customerId: number,
    ) {
        const customer = await Customer.findOneOrThrowId(customerId, null, '')
        const chat = await this.chatCustomerService.createChatSenderAdmin(customer, content, req.staff)
        const message: MessageSend = {
            title: `Tin nhắn mới`,
            body: `Nhân viên vừa nhắn tin cho bạn.`,
            data: { type: EventCustomerNotification.ChatCustomer }
        }
        await Firebase.send({ message, tokens: [customer.fcmToken] })

        return res.sendOK(chat)
    }

} // END FILE
