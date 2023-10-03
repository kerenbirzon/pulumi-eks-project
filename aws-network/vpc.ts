import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
const stack = pulumi.getStack();

export function createVPC(
  vpcname: string, 
  vpcazcount: number, 
  subnets: any[] ) {

  const vpc = new awsx.ec2.Vpc(`${vpcname}-${stack}-vpc`, { 
    numberOfAvailabilityZones: vpcazcount,
    subnetSpecs:[
      {
        type: awsx.ec2.SubnetType.Public,
        cidrMask: subnets[0].cidrMask,
        name: subnets[0].name,
      },
      {
        type: awsx.ec2.SubnetType.Private,
        cidrMask: subnets[1].cidrMask,
        name: subnets[1].name,
      },
  ],
  });
  return {
    vpcId: vpc.vpcId,
    privateSubnetIds: vpc.privateSubnetIds,
    publicSubnetIds: vpc.publicSubnetIds,
  };
}
