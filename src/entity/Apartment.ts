import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";
import { Customer } from "./Customer";
import { BuildingService } from "./BuildingService";
import { Invoice } from "./Invoice";
import { FormRepair } from "./FormRepair";
import { FormEmergency } from "./FormEmergency";
import { FormService } from "./FormService";
import { Contract } from "./Contract";

export enum ApartmentStatus {
    Empty = 'EMPTY',
    Fill = 'FILL',
    Block = 'BLOCK'
}

@Entity(addPrefix("apartment"))
export class Apartment extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    code: string

    @Column('text', { nullable: true })
    @Property()
    description: string;

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: '' })
    @Property()
    area: string

    @Column({ default: ApartmentStatus.Empty })
    @Property()
    status: ApartmentStatus


    // RELATIONS

    @ManyToOne(type => Building, building => building.apartments)
    building: Building;

    @ManyToOne(type => Customer, customer => customer.apartments)
    customer: Customer;

    @ManyToMany(type => BuildingService, buildingServices => buildingServices.apartments)
    @JoinTable()
    buildingServices: BuildingService[];

    @OneToMany(type => Invoice, invoices => invoices.apartment)
    invoices: Invoice[];

    @OneToMany(type => FormRepair, formRepairs => formRepairs.apartment)
    formRepairs: FormRepair[];

    @OneToMany(type => FormService, formServices => formServices.apartment)
    formServices: FormService[];

    @OneToMany(type => FormEmergency, formEmergencies => formEmergencies.apartment)
    formEmergencies: FormEmergency[];

    @OneToMany(type => Contract, contracts => contracts.apartment)
    contracts: Contract[];


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }

    public async assignBuildingServices(buildingServiceIds: number[]) {
        const buildingServices = await BuildingService.createQueryBuilder('buildingService')
            .where(`buildingService.id IN (:...buildingServiceIds)`, { buildingServiceIds })
            .getMany()

        this.buildingServices = buildingServices
    }


} // END FILE
