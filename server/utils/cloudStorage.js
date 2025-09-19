const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class CloudStorage {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
    }

    async uploadFile(filePath, bucketName = process.env.AWS_S3_BUCKET) {
        const fileContent = fs.readFileSync(filePath);
        const filename = path.basename(filePath);

        const params = {
            Bucket: bucketName,
            Key: `paintings/${filename}`,
            Body: fileContent,
            ACL: 'public-read',
            ContentType: 'image/png'
        };

        try {
            const data = await this.s3.upload(params).promise();
            return data.Location; // URL загруженного файла
        } catch (error) {
            console.error('S3 upload error:', error);
            throw error;
        }
    }

    async deleteFile(fileUrl) {
        const key = fileUrl.split('/').pop();
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `paintings/${key}`
        };

        try {
            await this.s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('S3 delete error:', error);
            throw error;
        }
    }
}

// Альтернатива: Cloudinary
class CloudinaryStorage {
    constructor() {
        this.cloudinary = require('cloudinary').v2;
        this.cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    async uploadFile(filePath) {
        try {
            const result = await this.cloudinary.uploader.upload(filePath, {
                folder: 'paintings-by-numbers',
                quality: 'auto:good'
            });
            return result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }
}

module.exports = { CloudStorage, CloudinaryStorage };