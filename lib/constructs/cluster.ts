import {Construct} from 'constructs';
import {Stage} from "../../bin/poc";
import {IVpc} from "aws-cdk-lib/aws-ec2";
import {Cluster} from "aws-cdk-lib/aws-ecs";

interface Props {
  appName: string;
  stage: Stage
  vpc: IVpc
}

/**
 * Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.Cluster.html
 */
export class EcsCluster extends Construct {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const {appName, stage, vpc} = props;

    const cluster = new Cluster(this, `${appName}${stage}Cluster`, {
      vpc
    })

  }
}
