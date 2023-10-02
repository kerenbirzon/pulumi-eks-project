import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { createVPC } from "./aws/networks"
import { createSecret, createEKSCluster} from "./kubernetes/eks"
import { installArgoCD } from "./kubernetes/argocd"

// VPC Configuration
let config = new pulumi.Config();
let vpcname = config.require("vpc-name");
let vpcazcount = config.require("vpc-az-count");
let subnets = config.requireObject<any[]>("vpc-subnets");

// Create VPC
const vpcConfig = createVPC(vpcname, parseInt(vpcazcount), subnets);


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
    vpcConfig.vpcId,
    vpcConfig.privateSubnetIds,
    vpcConfig.publicSubnetIds,
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
let slacktoken = config.requireSecret("slack-token")
slacktoken.apply(secretValue => {
    const slackTokenSecret = createSecret("slack-token","monitoring", secretValue);
});
