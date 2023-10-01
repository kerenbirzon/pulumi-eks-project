import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";
import { vpcId, privateSubnetIds, publicSubnetIds } from '..'

// Create an EKS cluster 
export function createEKSCluster() {
    const cluster = new eks.Cluster("eks-cluster", {
        vpcId: vpcId,
        publicSubnetIds: publicSubnetIds,
        privateSubnetIds: privateSubnetIds,
        instanceType: "t2.medium",
        desiredCapacity: 2,
        minSize: 1,
        maxSize: 2,
    });
    
    return {
        kubeconfig: cluster.kubeconfig,
        eksProvider: new kubernetes.Provider("eks-provider", { kubeconfig: cluster.kubeconfigJson }),
    };
}



// // Export the cluster's kubeconfig.
// export const kubeconfig = cluster.kubeconfig;

// export const eksProvider = new kubernetes.Provider("eks-provider", {kubeconfig: cluster.kubeconfigJson});

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
