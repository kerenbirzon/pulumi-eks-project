import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
const stack = pulumi.getStack();

export function installHelmChart(
    namespace: string, 
    chart: string, 
    repo: string, 
    eksProvider: pulumi.ProviderResource) {
    
    new kubernetes.helm.v3.Release(`${chart}-${stack}-release`, {
        name: chart,
        chart: chart,
        namespace: namespace,
        repositoryOpts: {
            repo: repo,
        },
    }, {
        provider: eksProvider,
    });
}
