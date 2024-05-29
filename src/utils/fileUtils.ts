import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_CREDENTIALS } from '../config/config';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3 = new S3Client({
    region: S3_CREDENTIALS.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: S3_CREDENTIALS.S3_ACCESS_KEY,
        secretAccessKey: S3_CREDENTIALS.S3_SECRET_ACCESS_KEY
    }
});

export const upload = multer({
    storage: multerS3({
        s3,
        bucket: S3_CREDENTIALS.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '_' + file.originalname);
        }
    }),
    // fileFilter: function (req, file, cb) {
    //     if (req.user) {
    //         console.log("HERE");
    //         cb(null, true);
    //     } else {
    //         console.log("NO HERE");
    //         cb(null, false);
    //     }
    // }
});

export const adminUpload = multer({
    storage: multerS3({
        s3,
        bucket: S3_CREDENTIALS.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '_' + file.originalname);
        }
    }),
    // fileFilter: function (req, file, cb) {
    //     if (req.user && req.user.username === 'admin') {
    //         cb(null, true);
    //     } else {
    //         cb(null, false);
    //     }
    // }
});

export const getFileBuffer = async (fileName: string): Promise<Buffer | undefined> => {
    const getObjectCommand = new GetObjectCommand({
        Bucket: S3_CREDENTIALS.S3_BUCKET_NAME,
        Key: fileName
    });

    const { Body } = await s3.send(getObjectCommand);

    if (Body) {
        const buffer = Buffer.from(await Body.transformToByteArray());
        return buffer;
    }
};

export const deleteFile = async (fileName: string) => {
    const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: S3_CREDENTIALS.S3_BUCKET_NAME,
        Key: fileName
    });

    await s3.send(deleteObjectCommand);
};
