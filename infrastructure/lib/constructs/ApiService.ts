import {Construct} from 'constructs';
import {
  AwsLogDriverMode,
  ContainerImage,
  Ec2Service,
  Ec2TaskDefinition,
  LogDrivers,
  NetworkMode,
  Protocol
} from 'aws-cdk-lib/aws-ecs';
import { Size, StackProps } from "aws-cdk-lib";
import {IRepository} from "aws-cdk-lib/aws-ecr";
import {EcsCluster} from "./cluster";
import {Stage} from "../../bin/app";
import {VpcConstruct} from "./vpc";


interface Props extends StackProps {
  appName: string;
  cluster: EcsCluster;
  images: {
    NGINX: string;
    PHP: string;
  };
  repository: IRepository;
  stage: Stage
  vpc: VpcConstruct;
}

export class ApiService extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);


    // Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.Ec2TaskDefinition.html
    const taskDefinition = new Ec2TaskDefinition(this, 'TaskDef', {
      networkMode: NetworkMode.BRIDGE,
    });
    props.repository.grantPull(taskDefinition.obtainExecutionRole())

    // Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.ContainerDefinition.html
    // The first container added is the default container and where traffic is routed. It needs to be NGINX
    const nginxContainer = taskDefinition.addContainer("WebContainer", {
      // Use an image from DockerHub
      containerName: 'nginx',
      image: ContainerImage.fromEcrRepository(props.repository, props.images.NGINX),
      memoryLimitMiB: 256,
      cpu: 256,
      essential: true,
      logging: LogDrivers.awsLogs({
        streamPrefix: 'nginx',
        mode: AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: Size.mebibytes(25),
      }),
      portMappings: [
        {
          containerPort: 80,
          hostPort: 80,
          protocol: Protocol.TCP,
        }
      ],
    });

    const phpContainer = taskDefinition.addContainer("AppContainer", {
      containerName: "php-fpm",
      image: ContainerImage.fromEcrRepository(props.repository, props.images.PHP),
      memoryLimitMiB: 256,
      cpu: 256,
      essential: true,
      logging: LogDrivers.awsLogs({
        streamPrefix: 'php',
        mode: AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: Size.mebibytes(25),
      }),
      portMappings: [
        {
          containerPort: 9000,
          hostPort: 9000,
          protocol: Protocol.TCP,
        }
      ],
    });

    nginxContainer.addLink(phpContainer)


    // Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.Ec2Service.html
    const service = new Ec2Service(this, 'Service', {
      cluster: props.cluster.cluster,
      taskDefinition,
      serviceName: `Api-${props.stage}`,
      capacityProviderStrategies: [
        {
          capacityProvider: props.cluster.capacityProvider.capacityProviderName,
          weight: 1,
        }
      ],
    });

  }
}
