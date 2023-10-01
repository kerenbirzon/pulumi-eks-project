import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import { SubnetsConfig } from "..";

let awsConfig = new pulumi.Config("aws");
let awsRegion = awsConfig.require("region");

export function createVPC(vpcname: string, vpcazcount: number, subnets: SubnetsConfig[] ) {
  const subnetSpecs = subnets.map(subnetConfig => ({
    type: subnetConfig.type,
    cidrMask: subnetConfig.cidrmask,
    name: subnetConfig.name,
  }));
  
  const vpc = new awsx.ec2.Vpc(vpcname, {
    numberOfAvailabilityZones: vpcazcount,
    //subnetSpecs: subnetSpecs,
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
  return {
    vpcId: vpc.vpcId,
    privateSubnetIds: vpc.privateSubnetIds,
    publicSubnetIds: vpc.publicSubnetIds,
  };
}
