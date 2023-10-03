import * as kubernetes from "@pulumi/kubernetes";


// Create kubernetes secret function
export function createSecret(secretName: string, secretNamespace: string, secretValue: string) {
    const secret = new kubernetes.core.v1.Secret(secretName, {
        metadata: {
            name: secretName,
            namespace: secretNamespace
          },
        data: {
            [secretName]: secretValue
          },
    });
}
