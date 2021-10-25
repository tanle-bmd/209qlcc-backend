// IMPORT LIBRARY
import { Property } from "@tsed/common";

// IMPORT CUSTOM
import { Customer } from "../entity/Customer";

export class CustomerUpdate {
    // Transform to draw entity
    toCustomer(): Customer {
        const customer = new Customer()
        customer.name = this.name
        customer.email = this.email
        customer.address = this.address
        customer.password = this.password
        customer.avatar = this.avatar

        return customer
    }

    // PROPERTIES

    @Property()
    name: string;

    @Property()
    avatar: string;

    @Property()
    phoneRelative: string

    @Property()
    address: string

    @Property()
    password: string

    @Property()
    email: string

} // END FILE
