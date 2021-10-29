// IMPORT LIBRARY
import { Service } from "@tsed/common";
import { Building } from "../entity/Building";
import { Contract } from "../entity/Contract";
import { Customer } from "../entity/Customer";


// IMPORT CUSTOM
import { CustomerNotification, CustomerNotificationType, EventCustomerNotification } from "../entity/CustomerNotification";
import { Invoice } from "../entity/Invoice";
import { Firebase, MessageSend } from "../util/firebase";

interface CreateNotificationParams {
    title: string
    body: string
    customer?: Customer
    building?: Building
    type: CustomerNotificationType
}

@Service()
export class CustomerNotificationService {
    public async create({ title, body, customer, building, type }: CreateNotificationParams) {
        const notify = new CustomerNotification()
        notify.title = title
        notify.body = body
        notify.customer = customer
        notify.building = building
        notify.type = type
        await notify.save()
    }

    public async sendNotificationToBuilding(buildingId: number, notification: CustomerNotification) {
        let where = `customer.isDeleted = false
        AND building.id = ${buildingId}`
        const customers = await Customer.createQueryBuilder('customer')
            .leftJoinAndSelect('customer.apartments', 'apartments')
            .leftJoinAndSelect('apartments.building', 'building')
            .where(where)
            .orderBy('customer.id', 'DESC')
            .getMany()

        const tokens = customers.map(c => c.fcmToken).filter(Boolean)

        let notify: MessageSend = {
            title: 'Thông báo.',
            body: notification.title,
            data: {
                type: EventCustomerNotification.CustomerNotification,
            }
        }
        await Firebase.send({ message: notify, tokens })
    }


    public async sendContract(customer: Customer) {
        let title = 'Hợp đồng.'
        let body = `Hợp đồng đã được gửi cho bạn`

        let message: MessageSend = {
            title,
            body,
            data: {
                type: EventCustomerNotification.Contract,
            }
        }
        Firebase.send({ message, tokens: [customer.fcmToken] })

        this.create({ title, body, customer, type: CustomerNotificationType.Contract })
    }


    public async sendInvoice(invoice: Invoice) {
        const { customer } = invoice

        let title = 'Hoá đơn mới.'
        let body = `Bạn vừa nhận được hoá đơn mới. Vui lòng thanh toán.`

        let message: MessageSend = {
            title,
            body,
            data: {
                type: EventCustomerNotification.Invoice,
            }
        }
        Firebase.send({ message, tokens: [customer.fcmToken] })

        this.create({ title, body, customer, type: CustomerNotificationType.Invoice })
    }


    public async cancelContract(contract: Contract) {
        const { customer } = contract

        let title = `Huỷ hợp đồng`
        let body = `Hợp đồng ${contract.code} đã được huỷ.`

        const message: MessageSend = {
            title,
            body,
            data: { type: EventCustomerNotification.DeleteContract }
        }
        Firebase.send({ message, tokens: [customer.fcmToken] })

        this.create({ title, body, customer, type: CustomerNotificationType.Contract })
    }

} //END FILE
