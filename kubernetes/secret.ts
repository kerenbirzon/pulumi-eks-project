import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
const stack = pulumi.getStack();


// Create kubernetes secret function
export function createSecret(
  secretName: string, 
  secretNamespace: string, 
  secretValue: string) {
    const secret = new kubernetes.core.v1.Secret(`${secretName}-${stack}-secret`, {
        metadata: {
            name: secretName,
            namespace: secretNamespace
          },
        data: {
            [secretName]: secretValue
          },
    });
}
