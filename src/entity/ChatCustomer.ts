import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";
import { Customer } from "./Customer";
import { Staff } from "./Staff";


export enum SenderType {
    Customer = 'CUSTOMER',
    Staff = 'STAFF'
}


@Entity(addPrefix("chat_customer"))
export class ChatCustomer extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    message: string

    @Column({ default: SenderType.Customer })
    @Property()
    sender: string

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean


    // RELATIONS

    @ManyToOne(type => Customer, customer => customer.chatCustomers)
    customer: Customer;

    @ManyToOne(type => Staff, staff => staff.chatCustomers)
    staff: Staff;

    @ManyToOne(type => Building, building => building.chatCustomers)
    building: Building;


    // METHODS


} // END FILE
