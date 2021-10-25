import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';
import { Like, Raw } from 'typeorm';

import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Customer } from '../../entity/Customer';
import { Password } from '../../util/password';
import { Apartment } from '../../entity/Apartment';

@Controller("/admin/customer")
@Docs("docs_admin")
export class CustomerController {
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
        @QueryParams("page") page: number,
        @QueryParams("limit") limit: number,
        @QueryParams("search") search: string = "",
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `CONCAT(customer.name, customer.phone, customer.email) LIKE :search AND customer.isDeleted = false`

        const [customers, total] = await Customer.createQueryBuilder('customer')
            .leftJoinAndSelect('customer.apartments', 'apartments', 'apartments.isDeleted = false')
            .leftJoinAndSelect('apartments.building', 'building')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('customer.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ customers, total })
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        customer: Joi.required()
    })
    async create(
        @HeaderParams('token') token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams('customer') customer: Customer,
        @BodyParams('apartmentId') apartmentId: number,
    ) {
        if (apartmentId) await customer.assignApartment(apartmentId)
        if (customer.password) {
            customer.password = await Password.hash(customer.password)
        }
        await customer.generateCode()
        await customer.save();
        return res.sendOK(customer)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:customerId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        customer: Joi.required(),
        customerId: Joi.number().required()
    })
    async update(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @BodyParams("customer") customer: Customer,
        @PathParams("customerId") customerId: number,
        @BodyParams('apartmentId') apartmentId: number,
    ) {
        await Customer.findOneOrThrowId(+customerId)
        customer.id = customerId
        if (apartmentId) await customer.assignApartment(apartmentId)
        await customer.save()

        return res.sendOK(customer, 'Cập nhật thành công!')
    }

    // =====================GET ITEM=====================
    @Get('/:customerId')
    @UseAuth(VerificationJWT)
    @Validator({
        customerId: Joi.number().required(),
    })
    async findOne(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams("token") token: string,
        @PathParams("customerId") customerId: number,

    ) {
        const customer = await Customer.findOneOrThrowId(+customerId)

        return res.sendOK(customer)
    }


    // =====================RESET PASSWORD=====================
    @Post('/:customerId/update/password')
    @UseAuth(VerificationJWT)
    @Validator({
        customerId: Joi.number().required(),
        password: Joi.string().required()
    })
    async updatePassword(
        @Req() req: Request,
        @Res() res: Response,
        @HeaderParams('token') token: string,
        @PathParams('customerId') customerId: number,
        @BodyParams('password') password: string
    ) {
        const customer = await Customer.findOneOrThrowId(+customerId);
        customer.password = await Password.hash(password)
        await customer.save()

        return res.sendOK(customer, 'Cập nhật thành công.')
    }




} // END FILE
