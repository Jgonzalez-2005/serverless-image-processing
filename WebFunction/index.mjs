import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
    const mensaje = JSON.parse(event.Records[0].Sns.Message);
    const { imageId, bucket, imagen } = mensaje;

    console.log(`Generando versión web para: ${imagen}`);

    await dynamo.send(new PutItemCommand({
        TableName: "ImagenProcesamiento",
        Item: {
            imageId: { S: imageId },
            proceso: { S: "web" },
            estado: { S: "COMPLETADO" },
            resultado: { S: `s3://${bucket}/web-${imagen}` }
        }
    }));

    console.log("Versión web completada y guardada en DynamoDB");

    return { statusCode: 200, body: "Web OK" };
};
