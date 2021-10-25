import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Permission } from "./Permission";
import { Staff } from "./Staff";

export enum RoleName {
    All = 'ALL',
    Admin = 'ADMIN',
    Manager = 'MANAGER', // Quan ly
    Supervisor = 'SUPERVISOR', // Giam sat
    Sale = 'SALE', // Kinh doanh
    Account = 'ACCOUNT', // Ke toan
    Service = 'SERVICE' // Dich vu
}

@Entity(addPrefix("role"))
export class Role extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column()
    @Property()
    name: RoleName;

    @Column()
    @Property()
    description: string

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean


    // RELATIONS

    @OneToMany(() => Staff, admin => admin.role)
    staff: Staff[]

    @ManyToMany(() => Permission, permission => permission.roles)
    permissions: Permission[]

    // METHODS

} // END FILE
