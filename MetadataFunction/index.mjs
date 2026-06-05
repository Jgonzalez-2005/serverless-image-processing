import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
    const mensaje = JSON.parse(event.Records[0].Sns.Message);
    const { imageId, bucket, imagen } = mensaje;

    console.log(`Extrayendo metadata para: ${imagen}`);

    await dynamo.send(new PutItemCommand({
        TableName: "ImagenProcesamiento",
        Item: {
            imageId: { S: imageId },
            proceso: { S: "metadata" },
            estado: { S: "COMPLETADO" },
            resultado: { S: JSON.stringify({ width: 1920, height: 1080 }) }
        }
    }));

    console.log("Metadata completada y guardada en DynamoDB");

    return { statusCode: 200, body: "Metadata OK" };
};
