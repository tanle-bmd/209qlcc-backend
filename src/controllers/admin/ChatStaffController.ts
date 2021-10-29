// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { ChatStaff } from '../../entity/ChatStaff';
import { Staff } from '../../entity/Staff';
import { paginate } from '../../util/helper';


@Controller("/admin/chatStaff")
@Docs("docs_admin")
export class ChatStaffController {
    constructor() { }


    // =====================GET LIST=====================
    @Get('/staffs')
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
        let where = `staff.isDeleted = false`

        if (search) {
            where += ` AND staff.name LIKE :search`
        }

        const staffs = await Staff.createQueryBuilder('staff')
            .leftJoinAndSelect('staff.receiverChats', 'receiverChats')
            .select("staff.*")
            .addSelect("IFNULL( MAX(receiverChats.id), 0)", 'maxId')
            .where(where, { search: `%${search}%` })
            .offset((page - 1) * limit)
            .limit(limit)
            .groupBy('staff.id')
            .having('maxId <> 0')
            .orderBy({ 'maxId': "DESC" })
            .getRawMany()

        const pagination = paginate(staffs, limit, page)

        return res.sendOK({ staffs: pagination, total: staffs.length });
    }


    // =====================GET LIST=====================
    @Get('/message')
    @UseAuth(VerificationJWT)
    @Validator({
        page: Joi.number().min(0),
        limit: Joi.number().min(0),
        receiverId: Joi.required()
    })
    async getMessage(
        @HeaderParams("token") token: string,
        @QueryParams("page") page: number = 1,
        @QueryParams("limit") limit: number = 0,
        @QueryParams('receiverId') receiverId: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `(senderStaff.id = ${req.staff.id} OR receiverStaff.id = ${req.staff.id}) 
        AND (senderStaff.id = ${receiverId} OR receiverStaff.id = ${receiverId})`
        const [messages, total] = await ChatStaff.createQueryBuilder('chatStaff')
            .leftJoinAndSelect('chatStaff.senderStaff', 'senderStaff')
            .leftJoinAndSelect('chatStaff.receiverStaff', 'receiverStaff')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('chatStaff.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ messages, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        chatStaff: Joi.required(),
        receiverId: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("chatStaff") chatStaff: ChatStaff,
        @BodyParams('receiverId') receiverId: number,
    ) {
        chatStaff.senderStaff = req.staff
        if (receiverId) await chatStaff.assignReceiverStaff(receiverId)
        await chatStaff.save()
        return res.sendOK(chatStaff)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:chatStaffId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        chatStaff: Joi.required(),
        chatStaffId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("chatStaff") chatStaff: ChatStaff,
        @PathParams("chatStaffId") chatStaffId: number,
    ) {
        await ChatStaff.findOneOrThrowId(chatStaffId)
        chatStaff.id = +chatStaffId
        await chatStaff.save()

        return res.sendOK(chatStaff)
    }

} // END FILE
