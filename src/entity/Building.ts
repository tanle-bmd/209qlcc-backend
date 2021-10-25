import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Property } from "@tsed/common";

import { addPrefix } from "../util/helper"
import CoreEntity from '../core/entity/CoreEntity';
import { BuildingImage } from "./BuildingImage";
import { Staff } from "./Staff";
import { Apartment } from "./Apartment";
import { BuildingService } from "./BuildingService";
import { FormContinueContract } from "./FormContinueContract";
import { FormEmergency } from "./FormEmergency";
import { FormRepair } from "./FormRepair";
import { FormService } from "./FormService";
import { Invoice } from "./Invoice";
import { ChatCustomer } from "./ChatCustomer";
import { StaffNotification } from "./StaffNotification";
import { CustomerNotification } from "./CustomerNotification";
import { FormStaffSupport } from "./FormStaffSupport";
import { FormStopContract } from "./FormStopContract";
import { FormTransferSoon } from "./FormTransferSoon";
import { Contract } from "./Contract";

export enum BuildingStatus {
    Open = 'OPEN',
    Close = 'CLOSE'
}

@Entity(addPrefix("building"))
export class Building extends CoreEntity {
    constructor() {
        super()
    }

    // PROPERTIES

    @Column({ default: '' })
    @Property()
    name: string

    @Column('text', { nullable: true })
    @Property()
    address: string;

    @Column({ default: '' })
    @Property()
    phone: string

    @Column({ default: false, select: false })
    @Property()
    isDeleted: boolean

    @Column({ default: BuildingStatus.Open })
    @Property()
    status: BuildingStatus


    // RELATIONS

    @OneToMany(type => BuildingImage, buildingImages => buildingImages.building)
    buildingImages: BuildingImage[];

    @ManyToMany(type => Staff, staffs => staffs.buildings)
    @JoinTable()
    staffs: Staff[];

    @OneToMany(type => Apartment, apartments => apartments.building)
    apartments: Apartment[];

    @OneToMany(type => BuildingService, buildingServices => buildingServices.building)
    buildingServices: BuildingService[];

    @OneToMany(type => FormRepair, formRepairs => formRepairs.building)
    formRepairs: FormRepair[];

    @OneToMany(type => FormService, formServices => formServices.building)
    formServices: FormService[];

    @OneToMany(type => FormEmergency, formEmergencies => formEmergencies.building)
    formEmergencies: FormEmergency[];

    @OneToMany(type => FormContinueContract, formContinueContracts => formContinueContracts.building)
    formContinueContracts: FormContinueContract[];

    @OneToMany(type => Invoice, invoices => invoices.building)
    invoices: Invoice[];

    @OneToMany(type => ChatCustomer, chatCustomers => chatCustomers.building)
    chatCustomers: ChatCustomer[];

    @OneToMany(type => StaffNotification, staffNotifications => staffNotifications.building)
    staffNotifications: StaffNotification[];

    @OneToMany(type => CustomerNotification, customerNotifications => customerNotifications.building)
    customerNotifications: CustomerNotification[];

    @OneToMany(type => FormStaffSupport, formStaffSupports => formStaffSupports.building)
    formStaffSupports: FormStaffSupport[];

    @OneToMany(type => FormStopContract, formStopContracts => formStopContracts.building)
    formStopContracts: FormStopContract[];

    @OneToMany(type => FormTransferSoon, formTransferSoons => formTransferSoons.building)
    formTransferSoons: FormTransferSoon[];

    @OneToMany(type => Contract, contracts => contracts.building)
    contracts: Contract[];


    // METHODS

    public async assignImages(images: string[]) {
        const items = images.map(i => {
            const item = new BuildingImage()
            item.url = i
            return item
        })
        await BuildingImage.save(items)

        this.buildingImages = items
    }


} // END FILE
