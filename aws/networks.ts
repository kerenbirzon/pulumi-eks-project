import * as awsx from "@pulumi/awsx";

export function createVPC(
  vpcname: string, 
  vpcazcount: number, 
  subnets: awsx.types.input.ec2.SubnetSpecArgs[] ) {
  
  console.log("subnetSpecs:", subnets);

  const vpc = new awsx.ec2.Vpc(vpcname, {
    numberOfAvailabilityZones: vpcazcount,
    //subnetSpecs: subnets,
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
