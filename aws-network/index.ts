import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { createVPC } from "./vpc"


export function awsNetworkSetup()
{
    // VPC Configuration
    let vpcConfig = new pulumi.Config("aws-vpc");
    let vpcname = vpcConfig.require("vpc-name");
    let vpcazcount = vpcConfig.require("vpc-az-count");
    let subnets = vpcConfig.requireObject<awsx.types.input.ec2.SubnetSpecArgs[]>("vpc-subnets");

    // Create VPC
    return createVPC(vpcname, parseInt(vpcazcount), subnets);
};
