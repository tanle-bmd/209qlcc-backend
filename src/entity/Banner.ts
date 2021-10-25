import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';

@Entity(addPrefix("banner"))
export class Banner extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column('text', { nullable: true })
    @Property()
    title: string;

    @Column({ default: '' })
    @Property()
    thumbnail: string

    @Column('longtext', { nullable: true })
    @Property()
    body: string;

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean


    // RELATIONS


    // METHODS


} // END FILE
