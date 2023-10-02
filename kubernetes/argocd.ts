import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { createNameSpace } from './eks'



export function installArgoCD(
    namespace: string, 
    chart: string, 
    repo: string, 
    eksProvider: pulumi.ProviderResource) {

    const argocdnamespace = createNameSpace(namespace, eksProvider);
    
    const argocd = new kubernetes.helm.v3.Release(`${namespace}-release`, {
        chart: chart,
        namespace: argocdnamespace.argocdnamespace.metadata.name,
        repositoryOpts: {
            repo: repo,
        },
    }, {
        provider: eksProvider,
    });
}
