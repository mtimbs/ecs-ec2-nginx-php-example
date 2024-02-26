## Yii2 NGINX + PHP-FPM
To start the Yii2 application on localhost simply run
```
docker-compose up --build -d
```    

## Note
There is currently an error with the Dockerfile for building the production Yii application. Deploying this app with throw a Yii DI error indicating that the app is not bootstrapping correctly. This may or may not be fixed in a follow-up PR but is also not the point of this example (which is a working ECS application)
