import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Staff } from "./Staff";
import { Building } from "./Building";

export enum FormStaffSupportStatus {
    Pending = 'PENDING',
    Complete = 'COMPLETE'
}

@Entity(addPrefix("form_staff_support"))
export class FormStaffSupport extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    title: string

    @Column('longtext', { nullable: true })
    @Property()
    body: string;

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: FormStaffSupportStatus.Pending })
    @Property()
    status: FormStaffSupportStatus


    // RELATIONS

    @ManyToOne(type => Staff, staff => staff.formStaffSupports)
    staff: Staff;

    @ManyToOne(type => Building, building => building.formStaffSupports)
    building: Building;


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }


} // END FILE
