import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";


let awsConfig = new pulumi.Config("aws");
let awsRegion = awsConfig.require("region");
let config = new pulumi.Config();
let slacktoken = config.requireSecret("slack-token")


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



// Create ArgoCD ns
const argocdns = new kubernetes.core.v1.Namespace("argocd-ns", {
    metadata: { name: "argocd" },
}, { provider: eksProvider });


const argocd = new kubernetes.helm.v3.Release("argocd", {
    chart: "argo-cd",
    namespace: argocdns.metadata.name,
    repositoryOpts: {
        repo: "https://argoproj.github.io/argo-helm",
    },
}, {
    provider: eksProvider,
});

const slackTokenSecret = new kubernetes.core.v1.Secret("slacktoken", {
    metadata: {
        name: "slack-token",
        namespace: "monitoring"
      },
    data: {
        "slack-token": slacktoken,
      },
});

// const nginxIngress = new kubernetes.helm.v3.Release("nginx-ingress", {
//     chart: "nginx-ingress",
//     repositoryOpts: {
//         repo: "https://charts.helm.sh/stable",
//     },
// });


// const nginxIngress = new kubernetes.helm.v3.Release("nginx-ingress", {
//     chart: "nginx-ingress",
//     version: "1.24.4",
//     repositoryOpts: {
//         repo: "https://charts.helm.sh/stable",
//     },
// });
