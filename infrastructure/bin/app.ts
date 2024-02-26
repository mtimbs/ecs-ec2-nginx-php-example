#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {GlobalStack} from "../lib/globalStack";


const {
  CDK_DEPLOY_ACCOUNT,
  CDK_DEFAULT_ACCOUNT,
  CDK_DEPLOY_REGION,
  CDK_DEFAULT_REGION,
  APP_NAME = 'DemoApp',
  STACK_NAME = 'DemoStack',
  STAGE = "__UNSET__",
} = process.env;

// TODO: Replace with some form of schema validation maybe (e.g. Zod)
export type Stage = 'prod' | 'staging' | 'demo';
export const VALID_STAGES = ['prod', 'staging', 'demo'];
if (!VALID_STAGES.includes(STAGE)) {
  throw Error(`STAGE ${STAGE} is not a valid STAGE. Valid stages are: ${VALID_STAGES.reduce((c, s) => `${c},${s}`, '').substring(1)}`);
}

/**
 * Anything we want to pass into each stack can go here
 */
const props = {
  env: {
    account: CDK_DEPLOY_ACCOUNT || CDK_DEFAULT_ACCOUNT,
    region: CDK_DEPLOY_REGION || CDK_DEFAULT_REGION,
  },
  stage: STAGE as Stage,
  appName: APP_NAME,
  stackName: STACK_NAME,
  images: {
    NGINX: process.env.NGINX_IMAGE_TAG,
    PHP: process.env.PHP_IMAGE_TAG,
  },
};

const app = new App();

const global = new GlobalStack(app, `${props.appName}-Global`, props);
