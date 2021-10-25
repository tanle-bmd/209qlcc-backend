// IMPORT LIBRARY
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Property } from "@tsed/common";

// IMPORT CUSTOM
import { addPrefix, getCurrentDateMMYY, getThisMonthInterval, leftPad } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { FormEmergency } from "./FormEmergency";
import { FormRepair } from "./FormRepair";
import { FormService } from "./FormService";
import { Apartment } from "./Apartment";
import { Contract } from "./Contract";
import { FormContinueContract } from "./FormContinueContract";
import { Invoice } from "./Invoice";
import { ChatCustomer } from "./ChatCustomer";
import { FormStopContract } from "./FormStopContract";
import { FormTransferSoon } from "./FormTransferSoon";

export enum GenderType {
    Male = 'MALE',
    Female = 'FEMALE'
}

@Entity(addPrefix("customer"))
export class Customer extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column()
    @Property()
    phone: string

    @Column()
    @Property()
    name: string;

    @Column({ default: '' })
    @Property()
    address: string

    @Column()
    @Property()
    password: string

    @Column()
    @Property()
    email: string

    @Column({ default: GenderType.Male })
    @Property()
    gender: string

    @Column({ nullable: true })
    @Property()
    avatar: string;

    @Column({ nullable: true })
    @Property()
    expoToken: string;

    @Column({ default: false })
    @Property()
    isBlock: boolean

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: '' })
    @Property()
    code: string

    @Column({ default: '' })
    @Property()
    identification: string

    @Column({ default: '' })
    @Property()
    identificationDate: string

    @Column({ default: 0 })
    @Property()
    messagePending: number


    // RELATIONS

    @OneToMany(type => FormRepair, formRepairs => formRepairs.customer)
    formRepairs: FormRepair[];

    @OneToMany(type => FormService, formServices => formServices.customer)
    formServices: FormService[];

    @OneToMany(type => FormEmergency, formEmergencies => formEmergencies.customer)
    formEmergencies: FormEmergency[];

    @OneToMany(type => Apartment, apartments => apartments.customer)
    apartments: Apartment[];

    @OneToMany(type => Contract, contracts => contracts.customer)
    contracts: Contract[];

    @OneToMany(type => FormContinueContract, formContinueContracts => formContinueContracts.customer)
    formContinueContracts: FormContinueContract[];

    @OneToMany(type => Invoice, invoices => invoices.customer)
    invoices: Invoice[];

    @OneToMany(type => ChatCustomer, chatCustomers => chatCustomers.customer)
    chatCustomers: ChatCustomer[];

    @OneToMany(type => FormStopContract, formStopContracts => formStopContracts.customer)
    formStopContracts: FormStopContract[];

    @OneToMany(type => FormTransferSoon, formTransferSoons => formTransferSoons.customer)
    formTransferSoons: FormTransferSoon[];


    // METHODS

    public async assignApartment(apartmentId: number) {
        const apartment = await Apartment.findOneOrThrowId(apartmentId, null, '')
        this.apartments = [apartment]
    }


    async generateCode() {
        const { start, end } = getThisMonthInterval()
        const count = await Customer.createQueryBuilder('customer')
            .where(`customer.createdAt BETWEEN ${start} AND ${end}`)
            .getCount()

        this.code = `KH${getCurrentDateMMYY()}/${leftPad(count + 1, 4)}`
    }

} // END FILE
