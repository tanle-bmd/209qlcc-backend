import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Customer } from "./Customer";
import { Building } from "./Building";
import { Apartment } from "./Apartment";
import { Staff } from "./Staff";

export enum FormRepairStatus {
    Pending = 'PENDING',
    Processing = 'PROCESSING',
    Complete = 'COMPLETE'
}

@Entity(addPrefix("form_repair"))
export class FormRepair extends CoreEntity {
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
    rateComment: string;

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

    @Column({ default: FormRepairStatus.Pending })
    @Property()
    status: FormRepairStatus
            

    // RELATIONS

    @ManyToOne(type => Customer, customer => customer.formRepairs)
    customer: Customer;

    @ManyToOne(type => Building, building => building.formRepairs)
    building: Building;

    @ManyToOne(type => Apartment, apartment => apartment.formRepairs)
    apartment: Apartment;

    @ManyToOne(type => Staff, staff => staff.assignedFormRepairs)
    assignedStaff: Staff;


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
