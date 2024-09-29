import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({ region: "ap-south-1" });
const rekognitionClient = new RekognitionClient({ region: "ap-south-1" });
const dynamoDbClient = new DynamoDBClient({ region: "ap-south-1" });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
}).single('image');

const bucketName = process.env.S3_BUCKET_NAME;
const collectionId = process.env.REKOGNITION_COLLECTION_ID;
const tableName = process.env.DYNAMODB_TABLE_NAME;


export const test = async(req,res, next)=>{
    console.log(process.env.DYNAMODB_TABLE_NAME)
    res.json("working");
}
export const registerEmployee = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: "File upload error", error: err.message });
        }

        const { fullName } = req.body;
        const image = req.file;

        if (!fullName || !image) {
            return res.status(400).json({ message: "Full name and image are required." });
        }

        const uniqueKey = `${uuidv4()}.${image.mimetype.split('/')[1]}`;

        try {
            // Upload to S3
            await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: uniqueKey,
                Body: image.buffer,
                ContentType: image.mimetype
            }));
            console.log("Image uploaded successfully");

            // Add to Rekognition
            const rekognitionResponse = await rekognitionClient.send(new IndexFacesCommand({
                CollectionId: collectionId,
                Image: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: uniqueKey,
                    },
                },
                ExternalImageId: uniqueKey,
                DetectionAttributes: ["ALL"],
            }));

            if (rekognitionResponse.FaceRecords && rekognitionResponse.FaceRecords.length > 0) {
                const faceId = rekognitionResponse.FaceRecords[0].Face.FaceId;

                // Save to DynamoDB
                const params = {
                    TableName: tableName,
                    Item: {
                        recognitionId: faceId,
                        fullName: fullName,
                        imageKey: uniqueKey,
                        RegisteredAt: new Date().toISOString(),
                    },
                };
                await ddbDocClient.send(new PutCommand(params));

                console.log("Employee registered successfully:", faceId);
                return res.status(200).json({ message: "Employee registered successfully", faceId: faceId });
            } else {
                return res.status(400).json({ message: "No face detected in the image" });
            }
        } catch (error) {
            console.error("Error processing employee registration:", error);
            return res.status(500).json({ message: "Error processing registration", error: error.message });
        }
    });
};