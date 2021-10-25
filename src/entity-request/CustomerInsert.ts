import { Property } from "@tsed/common";

import { Customer } from '../entity/Customer';
import { Password } from "../util/password";

export class CustomerInsert {
    async toCustomer(): Promise<Customer> {
        const customer = new Customer()
        customer.phone = this.phone
        customer.name = this.name
        customer.email = this.email
        customer.address = this.address
        customer.gender = this.gender
        customer.password = await Password.hash(this.password)

        return customer
    }
    
    // PROPERTIES

    @Property()
    phone: string

    @Property()
    name: string;

    @Property()
    phoneRelative: string

    @Property()
    address: string

    @Property()
    password: string

    @Property()
    email: string

    @Property()
    gender: string

} // END FILE
