import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";
import { Customer } from "./Customer";

export enum EventCustomerNotification {
    CustomerNotification = 'CUSTOMER_NOTIFICATION',
    Contract = 'CONTRACT',
    DeleteContract = 'DELETE_CONTRACT',
    ChatCustomer = 'CHAT_CUSTOMER',
    Invoice = 'INVOICE'
}

export enum CustomerNotificationType {
    CustomerNotification = 'CUSTOMER_NOTIFICATION',
    Contract = 'CONTRACT',
    Invoice = 'INVOICE'
}

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

    @Column({ default: CustomerNotificationType.CustomerNotification })
    @Property()
    type: CustomerNotificationType


    // RELATIONS

    @ManyToOne(type => Building, building => building.customerNotifications)
    building: Building;

    @ManyToOne(type => Customer, customer => customer.customerNotifications)
    customer: Customer;


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }


} // END FILE
