import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";


let awsConfig = new pulumi.Config("aws");
let awsRegion = awsConfig.require("region");


const vpc = new awsx.ec2.Vpc("project_vpc", {
    numberOfAvailabilityZones: 2,
    subnetSpecs:[
        {
          type: awsx.ec2.SubnetType.Public,
          cidrMask: 20,
          name: "project_public_subnet",
        },
        {
          type: awsx.ec2.SubnetType.Private,
          cidrMask: 20,
          name: "project_private_subnet",
        },
      ],
});

export const vpcId = vpc.vpcId;
export const privateSubnetIds = vpc.privateSubnetIds;
export const publicSubnetIds = vpc.publicSubnetIds;

// Create an EKS cluster 
const cluster = new eks.Cluster("eks-cluster", {
    vpcId: vpcId,
    publicSubnetIds: publicSubnetIds,
    privateSubnetIds: privateSubnetIds,
    instanceType: "t2.medium",
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,

});

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;

const eksProvider = new kubernetes.Provider("eks-provider", {kubeconfig: cluster.kubeconfigJson});
