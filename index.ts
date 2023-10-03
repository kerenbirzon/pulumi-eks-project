import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { createVPC } from "./aws/networks"
import { createSecret, createEKSCluster} from "./kubernetes/eks"
import { installArgoCD } from "./kubernetes/argocd"

// VPC Configuration
let vpcConfig = new pulumi.Config("aws-vpc");
let vpcname = vpcConfig.require("vpc-name");
let vpcazcount = vpcConfig.require("vpc-az-count");
let subnets = vpcConfig.requireObject<awsx.types.input.ec2.SubnetSpecArgs[]>("vpc-subnets");

// Create VPC
const vpc = createVPC(vpcname, parseInt(vpcazcount), subnets);


// EKS Configuration
let eksConfig = new pulumi.Config("eks-cluster");
let clusterName = eksConfig.require("clusterName");
let instanceType = eksConfig.require("instanceType");
let desiredCapacity = eksConfig.require("desiredCapacity");
let minSize = eksConfig.require("minSize");
let maxSize = eksConfig.require("maxSize");

// Create EKS Cluster
const eksClusterConfig = createEKSCluster(
    clusterName,
    vpc.vpcId,
    vpc.privateSubnetIds,
    vpc.publicSubnetIds,
    instanceType,
    parseInt(desiredCapacity),
    parseInt(minSize),
    parseInt(maxSize),
);
const kubeconfig = eksClusterConfig.kubeconfig;
const eksProvider = eksClusterConfig.eksProvider;


// ArgoCD Configuration
let argocdConfig = new pulumi.Config("argo-cd");
let argocdNamespace = argocdConfig.require("namespace");
let argocdChart = argocdConfig.require("chart");
let argocdRepo = argocdConfig.require("repo");

// Install ArgoCD on EKS
installArgoCD(argocdNamespace, argocdChart, argocdRepo, eksProvider);

// Create kubernetes secret for event exporter
let config = new pulumi.Config();
let slacktoken = config.requireSecret("slack-token")
slacktoken.apply(secret => {
    const slackTokenSecret = createSecret("slack-token","monitoring", secret);
});
