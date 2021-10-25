import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";
import { Contract } from "./Contract";
import { Customer } from "./Customer";

@Entity(addPrefix("form_transfer_soon"))
export class FormTransferSoon extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column('text', { nullable: true })
    @Property()
    note: string;

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean


    // RELATIONS

    @ManyToOne(type => Contract, contract => contract.formTransferSoons)
    contract: Contract;

    @ManyToOne(type => Customer, customer => customer.formTransferSoons)
    customer: Customer;

    @ManyToOne(type => Building, building => building.formTransferSoons)
    building: Building;


    // METHODS

    public async assignContract(contractId: number) {
        const contract = await Contract.findOneOrThrowId(contractId, null, '')
        this.contract = contract
    }

} // END FILE
