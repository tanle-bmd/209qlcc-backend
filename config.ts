const SECONDS_IN_1_YEAR = 60 * 60 * 24 * 30 * 12

const CONFIG = {
    APPLICATION_NAME: process.env.APPLICATION_NAME,
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    PREFIX_TABLE: process.env.DATABASE_PREFIX_TABLE,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: SECONDS_IN_1_YEAR,
    LOG_DIR: process.env.LOG_DIR,
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    STATIC_DIR: process.env.STATIC_DIR,
    PREFIX_URL: process.env.PREFIX_URL,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    SSL: process.env.SSL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    ONE_SIGNAL_APP_ID: process.env.ONE_SIGNAL_APP_ID,
    ONE_SIGNAL_REST_API_KEY: process.env.ONE_SIGNAL_REST_API_KEY,
    VNPAY_URL: process.env.VNPAY_URL,
    VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET,
    VNPAY_COMMAND_CODE: process.env.VNPAY_COMMAND_CODE,
    APN_KEY_ID: process.env.APN_KEY_ID,
    APN_TOPIC: process.env.APN_TOPIC,
    VHT_API_KEY: process.env.VHT_API_KEY,
    VHT_API_SECRET: process.env.VHT_API_SECRET,
    VHT_BRANDNAME: process.env.VHT_BRANDNAME,
    KIOT_VIET_CLIENT_ID: process.env.KIOT_VIET_CLIENT_ID,
    KIOT_VIET_CLIENT_SECRET: process.env.KIOT_VIET_CLIENT_SECRET,
    KIOT_VIET_RETAILER: process.env.KIOT_VIET_RETAILER,
    TYPE_ORM: {
        type: process.env.DATABASE_TYPE,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        bigNumberStrings: false,
        name: 'default',
        synchronize: true,
        entities: [
            `${__dirname}/src/entity/*{.ts,.js}`
        ],
        migrations: [
            `${__dirname}/src/migrations/*{.ts,.js}`
        ],
        subscribers: [
            `${__dirname}/src/subscriber/*{.ts,.js}`
        ]
    }
}

export default CONFIG
