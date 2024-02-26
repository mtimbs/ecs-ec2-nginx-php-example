# README
This is a sample application that spins up the infrastructure required in order to set up a simple PHP application running with nginx + php-fpm on an ECS service. It is configured so that nginx and php run in separate containers inside the same task definition. Nginx handles external traffic and then proxies it to php.

## Deployment
This is a standard CDK app. To deploy it you can run `npx cdk deploy` from inside the infrastructure directory. It assumes you have AWS credentials in your environment. The app also relies on a number of other environment variables.

### Fist Deployment
When deploying for the first time the stack will not create an ECS service because it needs to create an ECR repository for you to push your image tags to. You can create a bash script that looks like the following to easily deploy from a local environment.
```bash
#!/bin/bash
set -euo pipefail

export STAGE=demo
export APP_NAME=<your app name here>
export STACK_NAME=<your stack name here>

npx cdk deploy
```
Otherwise, setting the listed environment variables in your local shell context will also work. `STAGE=foo APP_NAME=bar STACK_NAME=baz npx cdk deploy`


Now you will be able to deploy the docker images to the created ECR repository by running the following command inside the service-1 directory ...
``` bash
AWS_ACCOUNT_ID=<your account ID> AWS_REGION=<region> REGISTRY_NAME=<pick a name> build-images.sh
```

### Regular Deployments
On subsequent deployments you pass the image tag to the bash command for deploying CDK that you want to promote to a production deploy. This allows you to build images outside of CKD for use in CI/CD etc. For example you might run (inside infrastructure directory)

```bash
# Where the tag hash is passed by your build pipeline
NGINX_IMAGE_TAG=nginx-15acea270b8476e4b2aa0de13bde868a \
PHP_IMAGE_TAG=php-fpm-15acea270b8476e4b2aa0de13bde868a \
STAGE=foo \
APP_NAME=bar \
STACK_NAME=baz \
npx cdk deploy 
```

### Verifying Deployment
In order to verify that everything deployed correctly you can:
- log into the AWS console
- navigate to the ECS dashboard
- Click on the cluster created from the CDK stack
- Click on the service that is listed in the Services tab
- Navigate to the "Tasks" tab
- Click on the listed Task

At this point the breadcrumbs in the console should show:

Amazon Elastic Container Service > Clusters > your cluster > Services > your service >  Tasks > task ID > Configuration

Here you should be able to see a **COnfiguration** panel that lists a _Public IP_ on the right hand side. If you click this IP you should be routed to a (currently broken) Yii application.


## Notes
1. There is currently an error with the Dockerfile for building the production Yii application. Deploying this app with throw a Yii DI error indicating that the app is not bootstrapping correctly. This may or may not be fixed in a follow-up PR but is also not the point of this example (which is a working ECS application)


2. This example was originally going to show a multi-service setup - hence the service-1 directory and allusions to "globalStack" and multi service config in CDK. I may or may not end up expanding this example in the future but as of right now it is a single service example and so some of those decisions may not make sense. Use your judgement when using this repo as a guide. 
