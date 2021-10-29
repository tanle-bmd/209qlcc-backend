import CONFIG from "../../config";
import admin from "firebase-admin";
import { chunk } from "./helper";

export interface MessageSend {
    title: string
    body: string
    data?: any
}

interface SendParams {
    message: MessageSend
    tokens: string[]
    channelId?: string
    sound?: string
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: CONFIG.FIREBASE_PROJECT_ID,
        privateKey: CONFIG.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: CONFIG.FIREBASE_CLIENT_EMAIL,
    }),
});

export class Firebase {
    static async send({
        message, tokens, channelId = 'default', sound = 'default'
    }: SendParams) {
        tokens = tokens.filter(Boolean)
        if (!tokens.length) {
            console.log('tokens rỗng', tokens)
            return
        }
        console.log('tokens:', tokens)

        const trunks = chunk(tokens, 500)

        const { title, body, data } = message

        for (let index = 0; index < trunks.length; index++) {
            const trunk = trunks[index];

            const notifications = []

            trunk.map(token => {
                const payload: admin.messaging.Message = {
                    notification: {
                        title,
                        body,
                    },
                    android: {
                        notification: {
                            channelId,
                            notificationCount: 0,
                            priority: "max"
                        },
                        priority: "high",
                    },
                    data,
                    token,
                    apns: {
                        payload: {
                            aps: {
                                sound,
                                contentAvailable: true,
                                badge: 0
                            }
                        },
                    },
                }

                notifications.push(payload)
            })
            console.log('notifications:', JSON.stringify(notifications[0]))

            const result = await admin.messaging().sendAll(notifications)

            console.log('Result FCM:', JSON.stringify(result))
        }

    }
}
