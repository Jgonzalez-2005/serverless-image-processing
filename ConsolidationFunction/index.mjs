import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const dynamo = new DynamoDBClient({ region: "us-east-2" });
const s3 = new S3Client({ region: "us-east-2" });

export const handler = async (event) => {
    const mensaje = JSON.parse(event.Records[0].Sns.Message);
    const { imageId, bucket } = mensaje;

    console.log(`Consolidando resultados para imageId: ${imageId}`);

    await new Promise(r => setTimeout(r, 5000));

    const resultado = await dynamo.send(new QueryCommand({
        TableName: "ImagenProcesamiento",
        KeyConditionExpression: "imageId = :id",
        ExpressionAttributeValues: {
            ":id": { S: imageId }
        }
    }));

    const items = resultado.Items;
    const reporte = {
        imageId: imageId,
        status: "COMPLETED",
        thumbnail: "",
        web: "",
        mobile: "",
        metadata: {}
    };

    for (const item of items) {
        const proceso = item.proceso.S;
        const res = item.resultado.S;
        if (proceso === "thumbnail") reporte.thumbnail = res;
        if (proceso === "web") reporte.web = res;
        if (proceso === "mobile") reporte.mobile = res;
        if (proceso === "metadata") reporte.metadata = JSON.parse(res);
    }

    console.log("Reporte final:", JSON.stringify(reporte));

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `reportes/reporte-${imageId}.json`,
        Body: JSON.stringify(reporte, null, 2),
        ContentType: "application/json"
    }));

    console.log("Reporte guardado en S3");

    return { statusCode: 200, body: JSON.stringify(reporte) };
};
