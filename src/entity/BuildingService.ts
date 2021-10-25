import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";
import { FormService } from "./FormService";
import { Apartment } from "./Apartment";

@Entity(addPrefix("building_service"))
export class BuildingService extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    name: string

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: '' })
    @Property()
    image: string


    // RELATIONS

    @ManyToOne(type => Building, building => building.buildingServices)
    building: Building;

    @OneToMany(type => FormService, formServices => formServices.buildingService)
    formServices: FormService[];

    @ManyToMany(type => Apartment, apartments => apartments.buildingServices)
    apartments: Apartment[];


    // METHODS

    public async assignBuilding(buildingId: number) {
        const building = await Building.findOneOrThrowId(buildingId, null, '')
        this.building = building
    }


} // END FILE
