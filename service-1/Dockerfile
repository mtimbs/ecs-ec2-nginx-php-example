FROM php:8.3.3-fpm as base
RUN apt-get update && apt-get install -y \
		libfreetype-dev \
		libjpeg62-turbo-dev \
		libpng-dev \
        zip \
        unzip \
	&& docker-php-ext-configure gd --with-freetype --with-jpeg \
	&& docker-php-ext-install -j$(nproc) gd

FROM base as deps
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

ARG APP_HOME=/app/
RUN rm -rf $APP_HOME && mkdir $APP_HOME
WORKDIR $APP_HOME
COPY ./src $APP_HOME

RUN composer install --prefer-dist --no-scripts --no-progress --no-interaction --optimize-autoloader --no-dev $ARGS

FROM base as prod
ARG APP_HOME=/app/
ENV APP_HOME=$APP_HOME
RUN rm -rf $APP_HOME && mkdir $APP_HOME
WORKDIR $APP_HOME

# Copy source files
COPY --from=deps --chown=www-data:www-data $APP_HOME $APP_HOME

EXPOSE 9000
CMD ["php-fpm"]

FROM nginx:latest as nginx

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf

ARG APP_HOME=/app/
ENV APP_HOME=$APP_HOME
RUN rm -rf $APP_HOME && mkdir $APP_HOME
WORKDIR $APP_HOME

COPY ./src $APP_HOME
