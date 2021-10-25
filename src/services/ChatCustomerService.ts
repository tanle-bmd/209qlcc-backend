// IMPORT LIBRARY
import { Service } from "@tsed/common";
import { Building } from "../entity/Building";


// IMPORT CUSTOM
import { ChatCustomer, SenderType } from "../entity/ChatCustomer";
import { Customer } from "../entity/Customer";
import { Staff } from "../entity/Staff";

@Service()
export class ChatCustomerService {

    async getManyAndCount({ page, limit, customer }) {
        let where = ``

        if (customer) {
            where += `customer.id = ${customer.id}`
        }

        const [chatCustomers, total] = await ChatCustomer.createQueryBuilder('chatCustomer')
            .leftJoinAndSelect('chatCustomer.customer', 'customer')
            .leftJoinAndSelect('chatCustomer.staff', 'staff')
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('chatCustomer.id', 'DESC')
            .getManyAndCount()

        return { chatCustomers, total }
    }

    public async createChatSenderCustomer(customer: Customer, content: string) {
        const chat = new ChatCustomer()
        chat.message = content
        chat.customer = customer
        chat.sender = SenderType.Customer
        await chat.save()

        customer.messagePending += 1
        await customer.save()

        return chat
    }

    public async createChatSenderAdmin(customer: Customer, content: string, staff: Staff) {
        const chat = new ChatCustomer()
        chat.message = content
        chat.customer = customer
        chat.sender = SenderType.Staff
        chat.staff = staff
        await chat.save()

        return chat
    }

} //END FILE
