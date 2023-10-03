import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
const stack = pulumi.getStack();

export function createNameSpace(
    namespace: string, 
    eksProvider: pulumi.ProviderResource) 
    {
    const kubernetesNamespace = new kubernetes.core.v1.Namespace(`${namespace}-${stack}-namespace`, {
        metadata: { name: namespace },
    }, { provider: eksProvider });
    return {
        kubernetesNamespace
    } 
}
