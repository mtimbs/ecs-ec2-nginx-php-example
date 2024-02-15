import {Construct} from 'constructs';
import {Stage} from "../../bin/poc";
import {IVpc, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";

interface Props {
  appName: string;
  stage: Stage
}

/**
 * Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.Vpc.html
 */
export class VpcConstruct extends Construct {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const {appName, stage} = props;

    // Traffic can come in and out of this subnet to the outside world
    const SUBNET_APPLICATION = {
      name: `${appName}${stage}SubnetApplication`,
      subnetType: SubnetType.PUBLIC
    };

    // Anything that needs to communicate with the outside world but you don't want to be accessible from the outside world
    const SUBNET_BACKGROUND_TASKS = {
      name: `${appName}${stage}SubnetPrivate`,
      subnetType: SubnetType.PRIVATE_WITH_EGRESS
    };

    // Anything that does not need to communicate with the outside world at all
    const SUBNET_ISOLATED = {
      name: `${appName}${stage}SubnetIsolated`,
      subnetType: SubnetType.PRIVATE_ISOLATED
    };

    this.vpc = new Vpc(this, `${appName}${stage}VPC`, {
      natGateways: 0,
      subnetConfiguration: [
        SUBNET_APPLICATION,
        SUBNET_BACKGROUND_TASKS,
        SUBNET_ISOLATED,
      ],
    });

  }
}
