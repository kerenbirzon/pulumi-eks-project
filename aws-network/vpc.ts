import * as awsx from "@pulumi/awsx";

export function createVPC(
  vpcname: string, 
  vpcazcount: number, 
  subnets: awsx.types.input.ec2.SubnetSpecArgs[] ) {

  const vpc = new awsx.ec2.Vpc(vpcname, {
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
