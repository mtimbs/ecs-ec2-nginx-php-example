import {Construct} from 'constructs';
import {InstanceType, IVpc, SubnetType} from "aws-cdk-lib/aws-ec2";
import {AsgCapacityProvider, Cluster, EcsOptimizedImage, ICluster} from "aws-cdk-lib/aws-ecs";
import {AutoScalingGroup} from "aws-cdk-lib/aws-autoscaling";
import {Stage} from "../../bin/app";

interface Props {
  appName: string;
  stage: Stage
  vpc: IVpc
}

/**
 * Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.Cluster.html
 */
export class EcsCluster extends Construct {
  public readonly cluster: ICluster;
  public readonly capacityProvider: AsgCapacityProvider;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const {appName, stage, vpc} = props;

    const cluster = new Cluster(this, "Cluster", {
      clusterName: `${appName}${stage}Cluster`,
      vpc
    });

    const autoScalingGroup = new AutoScalingGroup(this, "ASG", {
      instanceType: new InstanceType('t2.small'),
      machineImage: EcsOptimizedImage.amazonLinux2023(),
      minCapacity: 1,
      maxCapacity: 2,
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC
      },
    });

    const capacityProvider = new AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup,
      instanceWarmupPeriod: 300,
    });

    cluster.addAsgCapacityProvider(capacityProvider);

    this.cluster = cluster;
    this.capacityProvider = capacityProvider;
  }
}
