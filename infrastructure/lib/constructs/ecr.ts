import {Construct} from 'constructs';
import {IRepository, Repository, TagMutability} from "aws-cdk-lib/aws-ecr";

interface Props {
  repositoryName: string;
}

/**
 * Docs: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecr-readme.html
 */
export class ContainerRegistry extends Construct {
  readonly repository: IRepository;
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const repository = new Repository(this, "repository", {
      imageScanOnPush: true,
      imageTagMutability: TagMutability.IMMUTABLE,
      repositoryName: props.repositoryName,
    });

    // Automatically clean up production tags
    repository.addLifecycleRule({ tagPrefixList: ['prod'], maxImageCount: 10 });
    repository.addLifecycleRule({ tagPrefixList: ['nginx'], maxImageCount: 3 });
    this.repository = repository
  }
}
