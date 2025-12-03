import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// const S3_ENDPOINT = "http://192.168.0.45:19001";
// const ACCESS_KEY = "minioadmin";
// const SECRET_KEY = "minioadmin123";
// const BUSKET_NAME = "raw-files";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://192.168.0.45:19001/browser",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin123",
  },
  forcePathStyle: true,
});

export const uploadFileToMinio = async (file, onProgress) => {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: "raw-files",
      Key: file.name,
      Body: file,
      ContentType: file.type,
    },
    leavePartsOnError: false,
  });

  upload.on("httpUploadProgress", (progress) => {
    if (onProgress && progress.total) {
      onProgress(Math.round((progress.loaded / progress.total) * 100));
    }
  });
  return upload.done();
};
