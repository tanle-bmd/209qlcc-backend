import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Customer } from "./Customer";
import { Staff } from "./Staff";
import { Building } from "./Building";
import { Apartment } from "./Apartment";
import { InvoiceDetail } from "./InvoiceDetail";

export enum InvoiceStatus {
    Pending = 'PENDING',
    Complete = 'COMPLETE'
}

@Entity(addPrefix("invoice"))
export class Invoice extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: 0 })
    @Property()
    exportedAt: number // Ngay xuat hoa don, ngay tao

    @Column('text', { nullable: true })
    @Property()
    description: string; // Mo ta

    @Column("double", { default: 0 })
    @Property()
    total: number // Tong tien phai thanh toan

    @Column({ default: 0 })
    @Property()
    delayPayment: number // Thanh toan cham

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column('text', { nullable: true })
    @Property()
    note: string;

    @Column({ default: InvoiceStatus.Pending })
    @Property()
    status: InvoiceStatus

    @Column({ default: 0 })
    @Property()
    completeAt: number


    // RELATIONS

    @ManyToOne(type => Customer, customer => customer.invoices)
    customer: Customer;

    @ManyToOne(type => Staff, staff => staff.invoices)
    staff: Staff;

    @ManyToOne(type => Building, building => building.invoices)
    building: Building;

    @ManyToOne(type => Apartment, apartment => apartment.invoices)
    apartment: Apartment;

    @OneToMany(type => InvoiceDetail, invoiceDetails => invoiceDetails.invoice)
    invoiceDetails: InvoiceDetail[];


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }

    public async assignApartment(apartmentId: number) {
        const apartment = await Apartment.findOneOrThrowId(apartmentId, {
            relations: ['customer'],
        })
        this.apartment = apartment
    }

    public async assignCustomer(customerId: number) {
        const customer = await Customer.findOneOrThrowId(customerId, null, '')
        this.customer = customer
    }

} // END FILE
