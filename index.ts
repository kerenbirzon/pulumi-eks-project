import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { createVPC } from "./aws/networks"
import { createSlackTokenSecret, createEKSCluster} from "./kubernetes/eks"
import { installArgoCD } from "./kubernetes/argocd"

// Create VPC
let config = new pulumi.Config();
let vpcname = config.require("vpc-name");
let vpcazcount = config.require("vpc-az-count");

let subnets = config.requireObject<awsx.types.input.ec2.SubnetSpecArgs[]>("vpc-subnets");

const vpcConfig = createVPC(vpcname, parseInt(vpcazcount), subnets);
const vpcId = vpcConfig.vpcId;
const privateSubnetIds = vpcConfig.privateSubnetIds;
const publicSubnetIds = vpcConfig.publicSubnetIds;

// Create EKS 
let eksConfig = new pulumi.Config("eks-cluster");
let clusterName = eksConfig.require("clusterName");
let instanceType = eksConfig.require("instanceType");
let desiredCapacity = eksConfig.require("desiredCapacity");
let minSize = eksConfig.require("minSize");
let maxSize = eksConfig.require("maxSize");

const eksClusterConfig = createEKSCluster(
    clusterName,
    vpcId,
    privateSubnetIds,
    publicSubnetIds,
    instanceType,
    parseInt(desiredCapacity),
    parseInt(minSize),
    parseInt(maxSize),
);
export const kubeconfig = eksClusterConfig.kubeconfig;
export const eksProvider = eksClusterConfig.eksProvider;


// Deploy argoCD on EKS
let argocdConfig = new pulumi.Config("argo-cd");
let argocdNamespace = argocdConfig.require("namespace");
let argocdChart = argocdConfig.require("chart");
let argocdRepo = argocdConfig.require("repo");

installArgoCD(argocdNamespace, argocdChart, argocdRepo, eksProvider);

//Create a secret for kubernetes event exporter
let slacktoken = config.requireSecret("slack-token")
slacktoken.apply(secretValue => {
    const slackTokenSecret = createSlackTokenSecret(secretValue);
});
