import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Customer } from "./Customer";
import { Building } from "./Building";
import { Staff } from "./Staff";
import { Apartment } from "./Apartment";

export enum FormEmergencyStatus {
    Pending = 'PENDING',
    Processing = 'PROCESSING',
    Complete = 'COMPLETE'
}

@Entity(addPrefix("form_emergency"))
export class FormEmergency extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    title: string

    @Column('text', { nullable: true })
    @Property()
    body: string;

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column("double", { default: 0 })
    @Property()
    rateStar: number

    @Column('text', { nullable: true })
    @Property()
    note: string;

    @Column({ default: '' })
    @Property()
    image: string

    @Column({ default: 0 })
    @Property()
    assignAt: number

    @Column({ default: 0 })
    @Property()
    completeAt: number

    @Column({ default: FormEmergencyStatus.Pending })
    @Property()
    status: FormEmergencyStatus

    @Column('text', { nullable: true })
    @Property()
    rateComment: string;


    // RELATIONS

    @ManyToOne(type => Customer, customer => customer.formEmergencies)
    customer: Customer;

    @ManyToOne(type => Building, building => building.formEmergencies)
    building: Building;

    @ManyToOne(type => Staff, staff => staff.assignedFormEmergencies)
    assignedStaff: Staff;

    @ManyToOne(type => Apartment, apartment => apartment.formEmergencies)
    apartment: Apartment;


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }

    public async assignApartment(apartmentId: number) {
        const apartment = await Apartment.findOneOrThrowId(apartmentId, null, '')
        this.apartment = apartment
    }


} // END FILE
