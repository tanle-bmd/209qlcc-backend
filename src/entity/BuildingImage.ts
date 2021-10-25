import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Building } from "./Building";

@Entity(addPrefix("building_image"))
export class BuildingImage extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    url: string


    // RELATIONS

    @ManyToOne(type => Building, building => building.buildingImages)
    building: Building;


    // METHODS


} // END FILE
