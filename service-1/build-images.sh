#!/bin/bash
set -euo pipefail

# Assumes the following environment variables are ser:
# AWS_ACCOUNT_ID
# AWS_REGION
# REGISTRY_NAME (The name of the ECR repository)

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin "${ECR_URI}"

CONTENT_HASH=$(md5sum "Dockerfile" | cut -d ' ' -f 1)
NGINX_IMAGE_TAG="nginx-${CONTENT_HASH}"
# Later on we can do some smart diffing here and conditionally rebuild. For now lets build and push every time
echo "building new nginx image"
docker buildx build \
  --file Dockerfile \
  --platform=linux/amd64 \
  --tag "${ECR_URI}/${REGISTRY_NAME}:${NGINX_IMAGE_TAG}" \
  --target nginx \
  --progress plain \
  --push \
  .


APP_IMAGE_TAG="php-fpm-${CONTENT_HASH}"
# Later on we can do some smart diffing here and conditionally rebuild. For now lets build and push every time
echo "building app image"
docker buildx build \
  --file Dockerfile \
  --platform=linux/amd64 \
  --tag "${ECR_URI}/${REGISTRY_NAME}:${APP_IMAGE_TAG}" \
  --target prod \
  --progress plain \
  --push \
  .

ARM_NGINX_IMAGE_TAG="arm-nginx-${CONTENT_HASH}"
# Later on we can do some smart diffing here and conditionally rebuild. For now lets build and push every time
echo "building new nginx image"
docker buildx build \
  --file Dockerfile \
  --platform=linux/arm64 \
  --tag "${ECR_URI}/${REGISTRY_NAME}:${ARM_NGINX_IMAGE_TAG}" \
  --target nginx \
  --progress plain \
  --push \
  .


ARM_APP_IMAGE_TAG="arm-php-fpm-${CONTENT_HASH}"
# Later on we can do some smart diffing here and conditionally rebuild. For now lets build and push every time
echo "building app image"
docker buildx build \
  --file Dockerfile \
  --platform=linux/arm64 \
  --tag "${ECR_URI}/${REGISTRY_NAME}:${ARM_APP_IMAGE_TAG}" \
  --target prod \
  --progress plain \
  --push \
  .
