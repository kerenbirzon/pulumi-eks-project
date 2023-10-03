import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";

// Create an EKS cluster function
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
