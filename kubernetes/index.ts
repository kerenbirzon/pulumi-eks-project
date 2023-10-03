import * as pulumi from "@pulumi/pulumi";
import { createSecret} from "./secret"
import { createEKSCluster} from "./eks"
import { installHelmChart } from "./helm"
import { createNameSpace } from "./namespace"
import { vpc } from "../index"

export function kubernetesSetup()
{
        
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
    createNameSpace(argocdNamespace, eksProvider);
    installHelmChart(argocdNamespace, argocdChart, argocdRepo, eksProvider);

    // Create kubernetes secret for event exporter
    let config = new pulumi.Config();
    let slacktoken = config.requireSecret("slack-token")
    createNameSpace("monitoring", eksProvider);
    slacktoken.apply(secret => {
        const slackTokenSecret = createSecret("slack-token","monitoring", secret);
    });

    return kubeconfig;
};

