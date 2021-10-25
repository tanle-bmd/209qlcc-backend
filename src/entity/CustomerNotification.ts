import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";

@Entity(addPrefix("customer_notification"))
export class CustomerNotification extends CoreEntity {
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


    // RELATIONS

    @ManyToOne(type => Building, building => building.customerNotifications)
    building: Building;


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }


} // END FILE
