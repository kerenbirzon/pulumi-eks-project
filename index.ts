import * as pulumi from "@pulumi/pulumi";
import { awsNetworkSetup } from "./aws-network"
import { kubernetesSetup } from "./kubernetes"

export const vpc = awsNetworkSetup();
kubernetesSetup();