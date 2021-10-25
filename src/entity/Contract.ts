import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix, getCurrentDateMMYY, getThisMonthInterval, leftPad } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Customer } from "./Customer";
import { Staff } from "./Staff";
import { FormContinueContract } from "./FormContinueContract";
import { FormStopContract } from "./FormStopContract";
import { FormTransferSoon } from "./FormTransferSoon";
import { Apartment } from "./Apartment";
import { Building } from "./Building";

export enum ContractType {
    Official = 'OFFICIAL',
    Prepay = 'PREPAY'
}

export enum ContractStatus {
    Pending = 'PENDING',
    Complete = 'COMPLETE'
}

@Entity(addPrefix("contract"))
export class Contract extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    file: string

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: 0 })
    @Property()
    expiredAt: number

    @Column({ default: '' })
    @Property()
    name: string

    @Column({ default: '' })
    @Property()
    signStaff: string

    @Column({ default: '' })
    @Property()
    signCustomer: string

    @Column({ default: '' })
    @Property()
    fileName: string

    @Column({ default: '' })
    @Property()
    originFile: string

    @Column({ default: false })
    @Property()
    isSent: boolean

    @Column({ default: 0 })
    @Property()
    signStaffX: number

    @Column({ default: 0 })
    @Property()
    signStaffY: number

    @Column({ default: 0 })
    @Property()
    signStaffPage: number

    @Column({ default: '' })
    @Property()
    code: string

    @Column("double", { default: 0 })
    @Property()
    contractValue: number

    @Column({ default: ContractType.Official })
    @Property()
    type: ContractType

    @Column({ default: ContractStatus.Pending })
    @Property()
    status: ContractStatus

    @Column({ default: 0 })
    @Property()
    completeAt: number


    // RELATIONS

    @ManyToOne(type => Customer, customer => customer.contracts)
    customer: Customer;

    @ManyToOne(type => Staff, staff => staff.createdContracts)
    createdStaff: Staff;

    @OneToMany(type => FormContinueContract, formContinueContracts => formContinueContracts.contract)
    formContinueContracts: FormContinueContract[];

    @OneToMany(type => FormStopContract, formStopContracts => formStopContracts.contract)
    formStopContracts: FormStopContract[];

    @OneToMany(type => FormTransferSoon, formTransferSoons => formTransferSoons.contract)
    formTransferSoons: FormTransferSoon[];

    @ManyToOne(type => Apartment, apartment => apartment.contracts)
    apartment: Apartment;

    @ManyToOne(type => Building, building => building.contracts)
    building: Building;


    // METHODS

    public async assignCustomer(customerId: number) {
        const customer = await Customer.findOneOrThrowId(customerId, null, '')
        this.customer = customer
    }

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }

    public async assignApartment(apartmentId: number) {
        const apartment = await Apartment.findOneOrThrowId(apartmentId, null, '')
        this.apartment = apartment
    }

    async generateCode() {
        const { start, end } = getThisMonthInterval()
        const count = await Contract.createQueryBuilder('contract')
            .where(`contract.createdAt BETWEEN ${start} AND ${end}`)
            .getCount()

        this.code = `HD${getCurrentDateMMYY()}/${leftPad(count + 1, 4)}`
    }

} // END FILE
