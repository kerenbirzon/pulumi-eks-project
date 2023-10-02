import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";

// Create an EKS cluster 
export function createEKSCluster(
    clusterName: string,
    vpcId: pulumi.Output<string>, 
    publicSubnetIds: pulumi.Output<string[]>, 
    privateSubnetIds: pulumi.Output<string[]>,
    instanceType: string,
    desiredCapacity:number,
    minSize: number,
    maxSize: number,
    ) {

    const cluster = new eks.Cluster(clusterName, {
        //name: clusterName,
        vpcId: vpcId,
        publicSubnetIds: publicSubnetIds,
        privateSubnetIds: privateSubnetIds,
        instanceType: instanceType,
        desiredCapacity: desiredCapacity,
        minSize: minSize,
        maxSize: maxSize,
    });
    
    return {
        kubeconfig: cluster.kubeconfig,
        eksProvider: new kubernetes.Provider("eks-provider", { kubeconfig: cluster.kubeconfigJson }),
    };
}

export function createNameSpace(namespace: string, eksProvider: pulumi.ProviderResource) {
    const argocdnamespace = new kubernetes.core.v1.Namespace(`${namespace}-namespace`, {
        metadata: { name: namespace },
    }, { provider: eksProvider });
    return {
        argocdnamespace
    } 
}


export function createSlackTokenSecret(slacktoken: string) {
    const slackTokenSecret = new kubernetes.core.v1.Secret("slacktoken", {
        metadata: {
            name: "slack-token",
            namespace: "monitoring"
          },
        data: {
            "slack-token": slacktoken,
          },
    });
}
