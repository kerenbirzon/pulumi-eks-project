import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { createVPC } from "./aws/networks"
import { createSlackTokenSecret, createEKSCluster} from "./kubernetes/eks"
import { createArgoCD } from "./kubernetes/argocd"

let config = new pulumi.Config();
let slacktoken = config.requireSecret("slack-token")
let vpcname = config.require("vpc-name");
let vpcazcount = config.require("vpc-az-count");

export interface SubnetsConfig {
    name: string;
    cidrmask: number;
    type: awsx.ec2.SubnetType;
}
let subnets = config.requireObject<SubnetsConfig[]>("vpc-subnets");


const vpcConfig = createVPC(vpcname, parseInt(vpcazcount), subnets);
export const vpcId = vpcConfig.vpcId;
export const privateSubnetIds = vpcConfig.privateSubnetIds;
export const publicSubnetIds = vpcConfig.publicSubnetIds;


const eksClusterConfig = createEKSCluster();
export const kubeconfig = eksClusterConfig.kubeconfig;
export const eksProvider = eksClusterConfig.eksProvider;

createArgoCD();

slacktoken.apply(secretValue => {
    const slackTokenSecret = createSlackTokenSecret(secretValue);
});
// const slackTokenSecret = createSlackTokenSecret(slacktoken);



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
