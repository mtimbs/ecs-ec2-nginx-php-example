import {Construct} from 'constructs';
import {Stack, StackProps} from 'aws-cdk-lib';
import {Cluster} from 'aws-cdk-lib/aws-ecs';
import {VpcConstruct} from "./constructs/vpc";
import {Stage} from "../bin/poc";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface Props extends StackProps {
  stage: Stage;
  appName: string;
}

export class PocStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const {appName, stage} = props;

    /**
     * Sometimes it is useful to extract things into a construct.
     * Whether a VPC is one of them depends on your needs. Here it is done for illustration
     */
    const Vpc = new VpcConstruct(this, '', props);

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.Cluster.html
    const cluster = new Cluster(this, `${appName}${stage}Cluster`, {
      vpc: Vpc.vpc
    })


  }
}
