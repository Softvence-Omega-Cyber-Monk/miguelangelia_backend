import "dotenv/config";

export const configs = {
    port: process.env.PORT,
    env: "development",
    jwt: {
        access_token_secret: process.env.ACCESS_TOKEN_SECRET as string,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET as string,
        access_expires: process.env.ACCESS_EXPIRES,
        refresh_expires: process.env.REFRESH_EXPIRES,
        reset_secret: process.env.RESET_SECRET,
        reset_expires: process.env.RESET_EXPIRES,
        front_end_url: process.env.FRONT_END_URL,
        verified_token: process.env.VERIFIED_TOKEN

    },

    db_url: process.env.DB_URL,
    email: {
        app_email: process.env.APP_USER_EMAIL,
        app_password: process.env.APP_PASSWORD
    },
    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        cloud_api_key: process.env.CLOUD_API_KEY,
        cloud_api_secret: process.env.CLOUD_API_SECRET
    },
    bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS
}