import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class Ec2DefaultVpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const envStage = process.env.EnvStage || 'dev';
    const stackName = process.env.StackName || 'SOWK';

    const defaultVpc = ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    const instanceSecurityGroup = new ec2.SecurityGroup(
      this,
      'InstanceSecurityGroup',
      {
        vpc: defaultVpc,
        allowAllOutbound: true,
        securityGroupName: `${stackName}-${envStage}-instance-sg`,
      },
    )

    const instance = new ec2.Instance(this, 'EC2DefaultVPC', {
      vpc: defaultVpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.genericLinux({
        'us-east-1': 'ami-0261755bbcb8c4a84',        
      }),
      securityGroup: instanceSecurityGroup,
      userData: ec2.UserData.custom(`
        #!/bin/bash
        sudo apt-get update -y
        sudo apt-get install nginx -y
        sudo systemctl restart nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx # Enable Nginx to start on boot    
      `)
    })

    new cdk.CfnOutput(this, 'instance-output', {
      value: instance.instancePublicIp
    })
  }
}
