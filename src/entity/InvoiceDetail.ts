import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Invoice } from "./Invoice";

@Entity(addPrefix("invoice_detail"))
export class InvoiceDetail extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    name: string

    @Column('text', { nullable: true })
    @Property()
    description: string;

    @Column("double", { default: 0 })
    @Property()
    amount: number


    // RELATIONS

    @ManyToOne(type => Invoice, invoice => invoice.invoiceDetails)
    invoice: Invoice;


    // METHODS


} // END FILE
