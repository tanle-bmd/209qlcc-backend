// IMPORT LIBRARY
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany } from "typeorm";
import { Property } from "@tsed/common";

// IMPORT CUSTOM
import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { Role } from "./Role";
import { Building } from "./Building";
import { StaffNotification } from "./StaffNotification";
import { Contract } from "./Contract";
import { Invoice } from "./Invoice";
import { FormEmergency } from "./FormEmergency";
import { FormRepair } from "./FormRepair";
import { FormService } from "./FormService";
import { ChatCustomer } from "./ChatCustomer";
import { FormStaffSupport } from "./FormStaffSupport";

@Entity(addPrefix("staff"))
export class Staff extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column()
    @Property()
    username: string;

    @Column({ select: false })
    password: string;

    @Column({ default: "" })
    @Property()
    name: string;

    @Column({ default: "" })
    @Property()
    avatar: string;

    @Column({ default: "" })
    @Property()
    phone: string

    @Column({ default: "" })
    @Property()
    email: string

    @Column({ default: false })
    @Property()
    isBlock: boolean

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    // RELATIONS

    @ManyToOne(type => Role, role => role.staff)
    role: Role;

    @ManyToMany(type => Building, buildings => buildings.staffs)
    buildings: Building[];

    @ManyToMany(type => StaffNotification, staffNotifications => staffNotifications.staffs)
    staffNotifications: StaffNotification[];

    @OneToMany(type => Contract, contracts => contracts.createdStaff)
    createdContracts: Contract[];

    @OneToMany(type => Invoice, invoices => invoices.staff)
    invoices: Invoice[];

    @OneToMany(type => FormRepair, formRepairs => formRepairs.assignedStaff)
    assignedFormRepairs: FormRepair[];

    @OneToMany(type => FormService, formServices => formServices.assignedStaff)
    assignedFormServices: FormService[];

    @OneToMany(type => FormEmergency, formEmergencies => formEmergencies.assignedStaff)
    assignedFormEmergencies: FormEmergency[];

    @OneToMany(type => ChatCustomer, chatCustomers => chatCustomers.staff)
    chatCustomers: ChatCustomer[];

    @OneToMany(type => FormStaffSupport, formStaffSupports => formStaffSupports.staff)
    formStaffSupports: FormStaffSupport[];


    // METHODS

    public async assignBuilding(buildingIds: number[]) {
        console.log('buildingIds:', buildingIds)
        let where = `building.isDeleted = false
        AND building.id IN (:...buildingIds)`
        const buildings = await Building.createQueryBuilder('building')
            .where(where, { buildingIds })
            .orderBy('building.id', 'DESC')
            .getMany()

        console.log('buildings:', buildings)
        this.buildings = buildings
    }

    getBuildingIds(): number[] {
        const buildingIds = this.buildings.map(b => b.id)

        return [...new Set(buildingIds)]
    }


    getBuildings(): Building[] {

        // Unique ids
        const buildingIds = [...new Set(this.buildings.map(b => b.id))]

        const data: Building[] = []

        // Find and push building to data[]
        buildingIds.map(id => {
            const building = this.buildings.find(b => b.id == id)
            if (building) data.push(building)
        })

        return data
    }


} // END FILE
