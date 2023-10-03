import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";

export function installHelmChart(
    namespace: string, 
    chart: string, 
    repo: string, 
    eksProvider: pulumi.ProviderResource) {
    
    const argocd = new kubernetes.helm.v3.Release(`${namespace}-release`, {
        chart: chart,
        namespace: namespace,
        repositoryOpts: {
            repo: repo,
        },
    }, {
        provider: eksProvider,
    });
}
