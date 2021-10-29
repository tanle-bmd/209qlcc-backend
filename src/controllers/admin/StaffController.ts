import { RoleService } from './../../services/RoleService';
// IMPORT LIBRARY
import { Controller, Post, UseAuth, Req, Request, Res, Response, HeaderParams, BodyParams, Get, PathParams, QueryParams } from '@tsed/common';
import { Docs } from '@tsed/swagger';
import Joi from '@hapi/joi';
import { Raw } from 'typeorm';

// IMPORT CUSTOM
import { VerificationJWT } from '../../middleware/auth/VerificationJWT';
import { Validator } from '../../middleware/validator/Validator';
import { Staff } from '../../entity/Staff';
import { MultipartFile } from '@tsed/multipartfiles';
import config from '../../../config';
import { StaffService } from '../../services/StaffService';
import JWT, { AuthType } from '../../middleware/auth/strategy/JWT';

import { Role, RoleName } from '../../entity/Role';
import { StaffUpdate } from '../../entity-request/StaffUpdate';
import { Password } from '../../util/password';
import CONFIG from '../../../config';

@Controller("/admin/staff")
@Docs("docs_admin")
export class StaffController {
    constructor(
        private staffService: StaffService,
        private roleService: RoleService
    ) { }


    // =====================GET LIST=====================
    @Get('')
    @UseAuth(VerificationJWT)
    async findAll(
        @QueryParams('page') page: number,
        @QueryParams('limit') limit: number,
        @QueryParams('search') search: string = '',
        @HeaderParams("token") token: string,
        @QueryParams('roleId') roleId: number,
        @QueryParams('roleNames', String) roleNames: string[],
        @Req() req: Request,
        @Res() res: Response
    ) {
        let where = `CONCAT(staff.name, ' ', staff.username , ' ', staff.phone , ' ', staff.email) LIKE :search`

        if (roleId) {
            where += ` AND role.id = ${roleId}`
        }

        if (roleNames && roleNames.length) {
            where += ` AND role.name IN (:...roleNames) `
        }

        const [staffs, total] = await Staff.createQueryBuilder('staff')
            .leftJoinAndSelect('staff.role', 'role', 'role.isDeleted = false')
            .leftJoinAndSelect('staff.buildings', 'buildings', 'buildings.isDeleted = false')
            .where(where, { search: `%${search}%`, roleNames })
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('staff.id', 'DESC')
            .getManyAndCount()

        return res.sendOK({ staffs, total });
    }


    // =====================CREATE=====================
    @Post('')
    @UseAuth(VerificationJWT)
    @Validator({
        staff: Joi.required(),
        roleId: Joi.number().required()
    })
    async create(
        @BodyParams('staff') staff: Staff,
        @BodyParams('roleId') roleId: number,
        @HeaderParams("token") token: string,
        @BodyParams('buildingIds', Number) buildingIds: number[],
        @Req() req: Request,
        @Res() res: Response,
    ) {
        await this.staffService.checkDuplicate(staff);

        staff.password = await Password.hash(staff.password);
        staff.role = new Role();
        staff.role.id = roleId;
        delete staff.id;

        if (buildingIds && buildingIds.length) {
            await staff.assignBuilding(buildingIds)
        }

        await staff.save();

        return res.sendOK(staff)
    }


    // =====================UPDATE ADMIN INFO=====================
    @Post('/:staffId/update')
    @UseAuth(VerificationJWT)
    @Validator({
        staff: Joi.required(),
        staffId: Joi.number().required()
    })
    async update(
        @BodyParams('staff') staff: StaffUpdate,
        @BodyParams("roleId") roleId: number,
        @PathParams('staffId') staffId: number,
        @HeaderParams("token") token: string,
        @BodyParams('buildingIds', Number) buildingIds: number[],
        @Req() req: Request,
        @Res() res: Response,
    ) {
        await Staff.findOneOrThrowId(staffId);


        const role = await Role.findOneOrThrowId(roleId)

        const newStaff = staff.toStaff();
        newStaff.id = staffId;
        newStaff.role = role

        if (buildingIds && buildingIds.length) {
            await newStaff.assignBuilding(buildingIds)
        }

        await newStaff.save();

        return res.sendOK(newStaff)
    }


    // =====================UPDATE ADMIN INFO=====================
    @Post('/:staffId/block')
    @UseAuth(VerificationJWT)
    @Validator({
        staffId: Joi.number().required()
    })
    async block(
        @PathParams('staffId') staffId: number,
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const staff = await Staff.findOneOrThrowId(staffId);
        staff.isBlock = true
        await staff.save()

        return res.sendOK(staff)
    }


    // =====================UPDATE ADMIN INFO=====================
    @Post('/:staffId/unblock')
    @UseAuth(VerificationJWT)
    @Validator({
        staffId: Joi.number().required()
    })
    async unblock(
        @PathParams('staffId') staffId: number,
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const staff = await Staff.findOneOrThrowId(staffId);
        staff.isBlock = false
        await staff.save()

        return res.sendOK(staff)
    }


    // =====================RESET PASSWORD=====================
    @Post('/:staffId/password/reset')
    @UseAuth(VerificationJWT)
    @Validator({
        newPassword: Joi.string().required(),
        staffId: Joi.number().required()
    })
    async resetPassword(
        @BodyParams('newPassword') newPassword: string,
        @PathParams('staffId') staffId: number,
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const staff = await Staff.findOneOrThrowId(staffId);
        staff.password = await Password.hash(newPassword);
        await staff.save();

        return res.sendOK(staff)
    }


    // =====================UPDATE ADMIN ROLE=====================
    @Post('/:staffId/update/role')
    @UseAuth(VerificationJWT)
    @Validator({
        roleId: Joi.number().required(),
        staffId: Joi.number().required()
    })
    async updateRoleAdmin(
        @BodyParams('roleId') roleId: number,
        @PathParams('staffId') staffId: number,
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const staff = await Staff.findOneOrThrowId(staffId);
        const role = await Role.findOneOrThrowId(roleId);

        staff.id = staffId;
        staff.role = role;
        await staff.save();

        return res.sendOK(staff)
    }


    // =====================INIT=====================
    @Post('/init')
    @Validator({
        bmdPassword: Joi.required()
    })
    async init(
        @Res() res: Response,
        @Req() req: Request,
        @BodyParams('bmdPassword') bmdPassword: string,
    ) {
        if (bmdPassword == 'bmd123456789') {
            const roleAdmin = await this.roleService.initRole(RoleName.Admin, 'Quản trị toàn hệ thống')
            const roleSale = await this.roleService.initRole(RoleName.Sale, 'Nhân viên kinh doanh')
            const roleManager = await this.roleService.initRole(RoleName.Manager, 'Quản lí toà nhà')
            const roleSupervisor = await this.roleService.initRole(RoleName.Supervisor, 'Giám sát toà nhà')
            const roleService = await this.roleService.initRole(RoleName.Service, 'Dịch vụ')
            const roleAccount = await this.roleService.initRole(RoleName.Account, 'Kế toán')

            this.staffService.initStaff(roleAdmin, 'Admin', 'admin', 'bmd1234567890')
            this.staffService.initStaff(roleAdmin, 'Developer', 'develop', 'bmd1234567890')

            return res.sendOK({}, 'Init success')
        } else {
            return res.sendClientError('Wrong password')
        }
    }


    // =====================UPLOAD IMAGE=====================
    @Post('/upload')
    @UseAuth(VerificationJWT)
    uploadFile(
        @HeaderParams("token") token: string,
        @Req() req: Request,
        @Res() res: Response,
        @MultipartFile('file') file: Express.Multer.File,
    ) {
        file.path = file.path.replace(CONFIG.UPLOAD_DIR, '');
        return res.sendOK(file)
    }

} // END FILE
