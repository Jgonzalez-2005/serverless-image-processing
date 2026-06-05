import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "us-east-2" });

export const handler = async (event) => {
    const registro = event.Records[0];
    const bucket = registro.s3.bucket.name;
    const imagen = registro.s3.object.key;

    console.log(`Imagen recibida: ${imagen} del bucket: ${bucket}`);

    const mensaje = {
        bucket: bucket,
        imagen: imagen,
        imageId: Date.now().toString()
    };

    await sns.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify(mensaje)
    }));

    console.log("Mensaje enviado a SNS");

    return { statusCode: 200, body: "OK" };
};
