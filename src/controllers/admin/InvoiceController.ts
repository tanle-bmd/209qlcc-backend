// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';


// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Invoice } from '../../entity/Invoice';
import { InvoiceDetail } from '../../entity/InvoiceDetail';
import { getFromToDate } from '../../util/helper';


@Controller("/admin/invoice")
@Docs("docs_admin")
export class InvoiceController {
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
        @QueryParams('buildingId') buildingId: number,
        @QueryParams('apartmentId') apartmentId: number,
        @QueryParams('customerId') customerId: number,
        @QueryParams('from') from: Date,
        @QueryParams('to') to: Date,
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `CONCAT (apartment.code, building.name ) LIKE :search AND invoice.isDeleted = false `

        if (buildingId) {
            where += ` AND building.id = ${buildingId}`
        }

        if (apartmentId) {
            where += ` AND apartment.id = ${apartmentId}`
        }

        if (customerId) {
            where += ` AND customer.id = ${customerId}`
        }

        if (from && to) {
            const { start, end } = getFromToDate(from, to)
            where += ` AND invoice.createdAt BETWEEN ${start} AND ${end}`
        }

        const [invoices, total] = await Invoice.createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.building', 'building')
            .leftJoinAndSelect('invoice.apartment', 'apartment')
            .leftJoinAndSelect('invoice.invoiceDetails', 'invoiceDetails')
            .leftJoinAndSelect('invoice.customer', 'customer')
            .where(where, { search: `%${search}%` })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('invoice.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ invoices, total });
    }


    // =====================CREATE ITEM=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        invoice: Joi.required(),
        buildingId: Joi.required(),
        apartmentId: Joi.required(),
    })
    async create(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("invoice") invoice: Invoice,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('customerId') customerId: number,
        @BodyParams('apartmentId') apartmentId: number,
        @BodyParams('details', InvoiceDetail) details: InvoiceDetail[],
    ) {
        if (buildingId) await invoice.assignBuilding(buildingId)
        if (apartmentId) await invoice.assignApartment(apartmentId)
        if (customerId) await invoice.assignCustomer(customerId)

        if (details && details.length) {
            await InvoiceDetail.save(details)
            invoice.invoiceDetails = details
        }

        await invoice.save()

        return res.sendOK(invoice)
    }


    // =====================UPDATE ITEM=====================
    @Post('/:invoiceId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        invoice: Joi.required(),
        invoiceId: Joi.number().required()
    })
    async update(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @BodyParams("invoice") invoice: Invoice,
        @PathParams("invoiceId") invoiceId: number,
        @BodyParams('buildingId') buildingId: number,
        @BodyParams('customerId') customerId: number,
        @BodyParams('apartmentId') apartmentId: number,
        @BodyParams('details', InvoiceDetail) details: InvoiceDetail[],
    ) {
        await Invoice.findOneOrThrowId(invoiceId)
        invoice.id = +invoiceId

        if (buildingId) await invoice.assignBuilding(buildingId)
        if (apartmentId) await invoice.assignApartment(apartmentId)
        if (customerId) await invoice.assignCustomer(customerId)
        if (details && details.length) {
            await InvoiceDetail.save(details)
            invoice.invoiceDetails = details
        }

        await invoice.save()

        return res.sendOK(invoice)
    }


    // =====================DELETE=====================
    @Post('/:invoiceId/delete')
    @UseAuth(VerificationJWT)
    @Validator({
    })
    async delete(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @PathParams("invoiceId") invoiceId: number,
    ) {
        let invoice = await Invoice.findOneOrThrowId(invoiceId)
        invoice.isDeleted = true
        await invoice.save()
        return res.sendOK(invoice)
    }

} // END FILE
