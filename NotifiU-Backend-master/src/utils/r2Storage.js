const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const requiredEnvVars = [
    "R2_ENDPOINT",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_URL",
];

const hasPlaceholderValue = (value = "") => value.includes("YOUR_");

const validateR2Config = () => {
    for (const envKey of requiredEnvVars) {
        const value = process.env[envKey];
        if (!value || hasPlaceholderValue(value)) {
            throw new Error(`Missing or invalid R2 configuration for ${envKey}`);
        }
    }
};

const createR2Client = () => {
    validateR2Config();

    return new S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
};

let r2Client;

const getR2Client = () => {
    if (!r2Client) {
        r2Client = createR2Client();
    }

    return r2Client;
};

const cleanBaseUrl = (url = "") => url.replace(/\/+$/, "");

const buildPublicUrl = (key) => `${cleanBaseUrl(process.env.R2_PUBLIC_URL)}/${key}`;

const uploadBufferToR2 = async ({ key, buffer, contentType }) => {
    validateR2Config();

    await getR2Client().send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return buildPublicUrl(key);
};

const deleteObjectFromR2 = async (key) => {
    if (!key) return;

    validateR2Config();

    await getR2Client().send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        })
    );
};

module.exports = {
    buildPublicUrl,
    deleteObjectFromR2,
    uploadBufferToR2,
    validateR2Config,
};