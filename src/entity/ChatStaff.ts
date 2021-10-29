import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Staff } from "./Staff";

@Entity(addPrefix("chat_staff"))
export class ChatStaff extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    message: string


    // RELATIONS

    @ManyToOne(type => Staff, staff => staff.senderChats)
    senderStaff: Staff;

    @ManyToOne(type => Staff, staff => staff.receiverChats)
    receiverStaff: Staff;


    // METHODS

    public async assignReceiverStaff(staffId: number) {
        const staff = await Staff.findOneOrThrowId(staffId, null, '')
        this.receiverStaff = staff
    }


} // END FILE
