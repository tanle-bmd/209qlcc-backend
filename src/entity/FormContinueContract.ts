
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Contract } from "./Contract";
import { Customer } from "./Customer";
import { Building } from "./Building";

@Entity(addPrefix("form_continue_contract"))
export class FormContinueContract extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: 0 })
    @Property()
    month: number

    @Column('text', { nullable: true })
    @Property()
    note: string;


    // RELATIONS

    @ManyToOne(type => Contract, contract => contract.formContinueContracts)
    contract: Contract;

    @ManyToOne(type => Customer, customer => customer.formContinueContracts)
    customer: Customer;

    @ManyToOne(type => Building, building => building.formContinueContracts)
    building: Building;


    // METHODS

    public async assignContract(contractId: number) {
        const contract = await Contract.findOneOrThrowId(contractId, null, '')
        this.contract = contract
    }


} // END FILE
