import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Customer } from "./Customer";
import { BuildingService } from "./BuildingService";
import { Building } from "./Building";
import { Staff } from "./Staff";
import { Apartment } from "./Apartment";

export enum FormServiceStatus {
    Pending = 'PENDING',
    Processing = 'PROCESSING',
    Complete = 'COMPLETE'
}

@Entity(addPrefix("form_service"))
export class FormService extends CoreEntity {
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

    @Column("double", { default: 0 })
    @Property()
    rateStar: number

    @Column('text', { nullable: true })
    @Property()
    note: string;

    @Column({ default: '' })
    @Property()
    image: string

    @Column({ default: '' })
    @Property()
    serviceName: string

    @Column({ default: 0 })
    @Property()
    assignAt: number

    @Column({ default: 0 })
    @Property()
    completeAt: number

    @Column({ default: FormServiceStatus.Pending })
    @Property()
    status: FormServiceStatus

    @Column('text', { nullable: true })
    @Property()
    rateComment: string;


    // RELATIONS

    @ManyToOne(type => Customer, customer => customer.formServices)
    customer: Customer;

    @ManyToOne(type => BuildingService, buildingService => buildingService.formServices)
    buildingService: BuildingService;

    @ManyToOne(type => Building, building => building.formServices)
    building: Building;

    @ManyToOne(type => Staff, staff => staff.assignedFormServices)
    assignedStaff: Staff;

    @ManyToOne(type => Apartment, apartment => apartment.formServices)
    apartment: Apartment;


    // METHODS

    public async assignBuildingService(buildingServiceId: number) {
        const buildingService = await BuildingService.findOneOrThrowId(buildingServiceId, null, '')
        this.buildingService = buildingService
    }

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }

    public async assignApartment(apartmentId: number) {
        const apartment = await Apartment.findOneOrThrowId(apartmentId, null, '')
        this.apartment = apartment
    }


} // END FILE
