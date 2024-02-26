import {Construct} from 'constructs';
import {Stack, StackProps} from 'aws-cdk-lib';
import {ContainerRegistry} from "./constructs/ecr";

import {VpcConstruct} from "./constructs/vpc";
import {EcsCluster} from "./constructs/cluster";
import {IRepository} from "aws-cdk-lib/aws-ecr";
import {Stage} from "../bin/app";
import {ApiService} from "./constructs/ApiService";


interface Props extends StackProps {
  appName: string;
  stackName: string;
  images: {
    NGINX?: string;
    PHP?: string;
  }
  stage: Stage;
}

type RepositoryNames =
  | "Main"
export class GlobalStack extends Stack {
  readonly cluster: EcsCluster;
  readonly repositories: Record<RepositoryNames,IRepository>;
  readonly vpc: VpcConstruct;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const ecr = new ContainerRegistry(this, `MainAppRepository`, { repositoryName: `${props.appName}-${props.stage}`})
    // This is a potential pattern for if you want to run multiple services in the same cluster and have them with their
    // own ECR repository
    this.repositories = {Main: ecr.repository};

    this.vpc = new VpcConstruct(this, 'VPC', props);


    /**
     * NOTE: There is a choice here to run individual services in their own cluster, or run multiple services in a shared cluster.
     * Both options are fine and the "correct" one likely depends on your circumstances. If you only have a single service
     * then this is a moot point.
     */
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.Cluster.html
    this.cluster = new EcsCluster(this, 'Cluster', { ...props, vpc: this.vpc.vpc })


    /**
     * This is not ideal. This is done because this relies on the ECR repository existing. So initial deploy needs to
     * happen to create repo (if not exists already), and then we need to deploy again passing in the image tags.
     * This can be refactored to prevent this and this is not an ideal config.
     *
     * One way around this is to define the ECR repository outside this stack - either in a "global" CDK stack that manages
     * your Organisations global resources (like R53 records or Event Buses that are shared across multiple stacks. Or some other IaC method.
     *
     */
    if(props.images.NGINX && props.images.PHP) {
      new ApiService(this, `${props.appName}-API`, {
        ...props,
        cluster:this.cluster,
        // loadBalancer: loadBalancer,
        repository: this.repositories.Main,
        images: {
          NGINX: props.images.NGINX,
          PHP: props.images.PHP,
        },
        vpc: this.vpc,
      });
    }

  }
}
