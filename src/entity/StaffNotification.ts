import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Staff } from "./Staff";
import { RoleName } from "./Role";
import { Building } from "./Building";

@Entity(addPrefix("staff_notification"))
export class StaffNotification extends CoreEntity {
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

    @Column({ default: RoleName.All })
    @Property()
    roleName: RoleName

    @Column({ default: '' })
    @Property()
    image: string


    // RELATIONS

    @ManyToMany(type => Staff, staffs => staffs.staffNotifications)
    @JoinTable()
    staffs: Staff[];

    @ManyToOne(type => Building, building => building.staffNotifications)
    building: Building;


    // METHODS

    public async assignStaff(staffIds: number[]) {
        const staffs = await Staff.createQueryBuilder('staff')
            .where(`staff.id IN (:...staffIds)`, { staffIds })
            .getMany()

        this.staffs = staffs
    }

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }


} // END FILE
