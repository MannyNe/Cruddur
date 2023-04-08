# Week 6 — Deploying Containers
![Conceptual Diagram (Napkin)](assets/AWS-Bootcamp_Banner.jpg)
- In this week, we learnt about a variety of technologies to progress with our ECS, ECR and Deployment knowledge. Some of the things we learnt include: 
    * Deploy an ECS Cluster using ECS Service Connect
    * Deploy serverless containers using Fargate for the Backend and Frontend Application
    * Route traffic to the frontend and backend on different subdomains using Application Load Balancer
    * Securing our flask container
    * Creating several bash utility scripts to easily work with serverless containers.

## Required Homework/Tasks (class summary)
- To test if we grasped the concepts provided to us through the meeting as well as the provided videos to aid us, we were given homeworks. They are:
    - [X] Provisioning an ECS cluster, creating an ECR repo then pushing both frontend and backend images, and deploying both apps to fargate.
    - [X] Provisioning and configuring Application Load Balancer along with target groups.
    - [X] Managed my domain using Route53, created an SSL certificate via ACM, setup a record set for naked domain to point to frontend-react-js, setup a record set for api subdomain to point to the backend-flask, and Configure CORS to only permit traffic from our domain.
    - [X] Secured Flask by not running in debug mode for production
    - [X] Implemented Refresh Token for Amazon Cognito
    - [X] Refactored bin directory to be top level
    - [ ] Configured task defintions to contain x-ray and turn on Container Insights
    - [ ] Changed Docker Compose to explicitly use a user-defined network
    - [ ] Created Dockerfile specfically for production use case
    - [ ] Used ruby generate out env dot files for docker using erb templates

- I will describe my work and the process in the order provided above.

### Provisioning an ECS cluster, creating an ECR repo then pushing both frontend and backend images, and deploying both apps to fargate.
- Provisioning an ECS Cluster
    * To provision an ECS cluster, I followed the 3hr video that was posted on the exampro channel. The process was straight forward and I was able to provision an ECS cluster with no issues. I used the CLI to provision the cluster. The command I used was:
    ```sh
        aws ecs create-cluster \
        --cluster-name cruddur \
        --service-connect-defaults namespace=cruddur
    ```
    This command created a cluster named cruddur with empty services. The image below shows a successful run of the command:
    ![create-cluster](assets/week-6/create-cluster.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.0: Creating a cluster</div>

- Creating an ECR repo
    * To create an ECR repo, I used the CLI command which was in the week-6 video. The first thing I did was login to my AWS account using the CLI to access ECR. I used the command:
    ```sh
        aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
    ```
    A successful login will look like this:
    ![login](assets/week-6/login-ECR.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.1: Logging in</div>

    After logging in, we created a repository to store our images. I created a repository for three images, namely `cruddur-python`, `backend-flask` and `frontend-react-js`. The command I used for `cruddur-python`:
    ```sh
        aws ecr create-repository \
            --repository-name cruddur-python \
            --image-tag-mutability MUTABLE
    ```

    for `backend-flask`:
    ```sh
        aws ecr create-repository \
            --repository-name backend-flask \
            --image-tag-mutability MUTABLE
    ```

    and for `frontend-react-js`:
    ```sh
        aws ecr create-repository \
            --repository-name frontend-react-js \
            --image-tag-mutability MUTABLE
    ```
    
    A successful run of these commands will look like this in AWS ECR console:
    ![ecr-console](assets/week-6/ECR-images.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.2: AWS ECR Console</div>

    After setting the repository, I had to update my ECR URL's to push each images to their respective ECR repositories. To set the correct ECR repository for all the repositories, I used the commands:
    
    for `cruddur-python`:
    ```sh
        export ECR_PYTHON_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cruddur-python"
    ```

    for `backend-flask`:
    ```sh
        export ECR_BACKEND_FLASK_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/backend-flask"
    ```

    for `frontend-react-js`:
    ```sh
        export ECR_FRONTEND_REACT_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/frontend-react-js"
    ```

- Pushing both frontend and backend images
    * After setting the URL's as described above, I pulled, tagged and pushed the images to ECR. For python and only python, I had to first pull the image from [DockerHub](https://hub.docker.com/). To pull the image, I used the command:
    ```sh
        docker pull python:3.10-slim-buster
    ```

    For the rest of the images, I had to build them using the `Dockerfile` located within each of the folders. To build the images, I used the commands:

    for `backend-flask`
    ```sh
        docker build -t backend-flask .
    ```

    for `frontend-react-js`:
    ```sh
        docker build \
        --build-arg REACT_APP_BACKEND_URL="https://4567-$GITPOD_WORKSPACE_ID.$GITPOD_WORKSPACE_CLUSTER_HOST" \
        --build-arg REACT_APP_AWS_PROJECT_REGION="$AWS_DEFAULT_REGION" \
        --build-arg REACT_APP_AWS_COGNITO_REGION="$AWS_DEFAULT_REGION" \
        --build-arg REACT_APP_AWS_USER_POOLS_ID="ca-central-1_CQ4wDfnwc" \
        --build-arg REACT_APP_CLIENT_ID="5b6ro31g97urk767adrbrdj1g5" \
        -t frontend-react-js \
        -f Dockerfile.prod \
        .
    ```
    The files for the backend and frontend are located [backend-dockerfile](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/backend-flask/Dockerfile) and [frontend-dockerfile](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/frontend-react-js/Dockerfile.prod) respectively.

    After building the images, I tagged them and pushed them to ECR. To tag the images, I used the commands:

    for `backend-flask`
    ```sh
        docker tag backend-flask:latest $ECR_BACKEND_FLASK_URL:latest
        docker push $ECR_BACKEND_FLASK_URL:latest
    ```

    for `frontend-react-js`:
    ```sh
        docker tag frontend-react-js:latest $ECR_FRONTEND_REACT_URL:latest
        docker push $ECR_FRONTEND_REACT_URL:latest
    ```
    
    After tagging then pushing the images to their respective ECR repositories, we can see the following images in the repositories:
    ![ECR-Python](assets/week-6/pushed-image-python.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.3: Python Repository</div>

    ![ECR-Backend](assets/week-6/pushed-image-backend.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.4: Backend Repository</div>

    ![ECR-Frontend](assets/week-6/pushed-image-frontend.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.5: Frontend Repository</div>

- Deploying both apps to fargate
    * Before deploying our apps to fargate, we had to configure roles, policies and task-definitions in that order. To configure roles, I used the command:

    ```sh
    aws iam create-role \    
    --role-name CruddurServiceExecutionPolicy  \   
    --assume-role-policy-document file://aws/policies/service-assume-role-execution-policy.json
    ```
    Before executing the commands above, I had to create a file called `service-assume-role-execution-policy.json` in the `aws/policies` folder. The content of the file is:

    ```json
    {
        "Version":"2012-10-17",
        "Statement":[{
            "Action":["sts:AssumeRole"],
            "Effect":"Allow",
            "Principal":{
            "Service":["ecs-tasks.amazonaws.com"]
            }
        }]
    }
    ```
    The file can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/aws/policies/service-assume-role-execution-policy.json)

    A successful execution of the command above will return the following:
    ![create-role-cli](assets/week-6/create-role.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.6: Creating Role</div>

    After creating the role, I had to create a policy for the role. To create the policy, I used the command:

    ```sh
    aws iam put-role-policy \
    --policy-name CruddurServiceExecutionPolicy \
    --role-name CruddurServiceExecutionRole \
    --policy-document file://aws/policies/service-execution-policy.json
    ```
    Before executing the commands above, I had to create a file called `service-execution-policy.json` in the `aws/policies` folder. The content of the file is:

    ```json
    {
        "Version":"2012-10-17",
        "Statement":[{
          "Effect": "Allow",
          "Action": [
            "ssm:GetParameters",
            "ssm:GetParameter"
          ],
          "Resource": "arn:aws:ssm:us-east-1:706157350338:parameter/cruddur/backend-flask/*"
        }]
    }
    ```
    The file can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/aws/policies/service-execution-policy.json)

    After creating the policy, I had to attach the policy to the role. To do that, I fetched the ARN the `put-role-policy` command returns. Then I used the command:

    ```sh
    aws iam attach-role-policy --policy-arn POLICY_ARN --role-name CruddurServiceExecutionRole
    ```

    A successful execution of both commands above will attach the roles and policies together. Taking a look at the console will show the following:
    ![role-and-policy](assets/week-6/execution-role-final.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.7: Role and Policy</div>

    After creating and attaching the policy, I had to create a task-definition for both apps. Before that, I need to store my parameter details, which will be stored in the systems manager. To do that we used the CLI commands which were provided in the week-6 documentation. The list of CLI commands I used are:

    ```
    aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_ACCESS_KEY_ID" --value $AWS_ACCESS_KEY_ID
    aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_SECRET_ACCESS_KEY" --value $AWS_SECRET_ACCESS_KEY
    aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/CONNECTION_URL" --value $PROD_CONNECTION_URL
    aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/ROLLBAR_ACCESS_TOKEN" --value $ROLLBAR_ACCESS_TOKEN
    aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/OTEL_EXPORTER_OTLP_HEADERS" --value "x-honeycomb-team=$HONEYCOMB_API_KEY"
    ```
    After running these commands, we can check the console if we stored those parameters correctly. If we did, we should see the list as the following image:
    ![Systems-manager-params](assets/week-6/SSM-params.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.8: SSM Parameters</div>

    After storing the parameters, we created a new role called `CruddurTaskRole` which helps us use session managers and all. To create the role, we used the command:

    ```sh
    aws iam create-role \
        --role-name CruddurTaskRole \
        --assume-role-policy-document "{
        \"Version\":\"2012-10-17\",
        \"Statement\":[{
            \"Action\":[\"sts:AssumeRole\"],
            \"Effect\":\"Allow\",
            \"Principal\":{
                \"Service\":[\"ecs-tasks.amazonaws.com\"]
            }
        }]
    }"
    ```

    To create the policy, we used the command:

    ```sh
    aws iam put-role-policy \
        --policy-name SSMAccessPolicy \
        --role-name CruddurTaskRole \
        --policy-document "{
        \"Version\":\"2012-10-17\",
        \"Statement\":[{
            \"Action\":[
                \"ssmmessages:CreateControlChannel\",
                \"ssmmessages:CreateDataChannel\",
                \"ssmmessages:OpenControlChannel\",
                \"ssmmessages:OpenDataChannel\"
            ],
            \"Effect\":\"Allow\",
            \"Resource\":\"*\"
        }]
    }"
    ```

    Then we attached an iam role policy to the role to have cloudwatch full access and XRAY Daemon Write access. To do that, we used the commands:

    ```sh
    aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess --role-name CruddurTaskRole
    aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess --role-name CruddurTaskRole
    ```

    A successful execution of these commands will attach the roles and policies together as well as give additional permissions to the role. Taking a look at the console will show the following:
    ![role-and-policy-TaskRole](assets/week-6/Task-role-final.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.9: Role and Policy for Task Role</div>

    After creating the roles and policies, we created a task definition for both our apps. To do that, we first create the files for the task definition. The files for both the frontend and backend can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/aws/task-definitions). After creating the files, we used the following commands to register the task definitions:

    For the `backend-flask` app:
    ```sh
    aws ecs register-task-definition --cli-input-json file://aws/task-definitions/backend-flask.json
    ```

    For the `frontend-react-js` app:
    ```sh
    aws ecs register-task-definition --cli-input-json file://aws/task-definitions/frontend-react-js.json
    ```

    After running the commands above, we can check the ECS Task Definitions console if we registered the task definitions correctly. If we did, we should see the list as the following image:
    ![backend-task-definition](assets/week-6/backend-task-definition.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 2.0: Task Definition - Backend</div>

    ![frontend-task-definition](assets/week-6/frontend-task-definition.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 2.1: Task Definition - Frontend</div>

    After creating the task definitions, we created a service via ClickOps. We created a service for both the frontend and backend. But before we do all these things, we first created a security group. To do that, we used the following command to get the default VPC:

    ```sh
    export DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=isDefault, Values=true" \
    --query "Vpcs[0].VpcId" \
    --output text)
    ```
    Then we created a security group for the frontend and backend. To do that, we used the following commands:

    ```sh
    export CRUD_SERVICE_SG=$(aws ec2 create-security-group \
    --group-name "crud-srv-sg" \
    --description "Security group for Cruddur services on ECS" \
    --vpc-id $DEFAULT_VPC_ID \
    --query "GroupId" --output text)
    ```

    After creating the security group, we added the newly created security group via ClickOps to the new services we're creating. After finishing creating the services, we can check the ECS Cluster console if we created the services correctly. If we did, we should see the list as the following image:
    ![Active-Services](assets/week-6/services-active.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 2.0: Active Services</div>

    ![Healthy-Services](assets/week-6/services-healthy.png)
    <div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 2.1: Healthy Services</div>

-----------------------

### Provisioning and configuring Application Load Balancer along with target groups.
- To provision and configure Application Load Balancer along with target groups, we first created a new load balancer via ClickOps. We created a load balancer with an ALB type. We named the load balancer `cruddur-alb` and then we attached the existing subnets then created a new security group named `cruddur-alb-sg`. We gave an inbound rule of `HTTP` and `HTTPS` with a source of my own IP adddress so that the website would be accessed by me. After that, we updated the exixsting security group to get accessed by the newly created security group. After a long configuration process, we finally set up the load balancer. The ECS Load Balancer Console looks like the following:
![Active-Services](assets/week-6/load-balancer.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.0: Load Balancer</div>

![Healthy-Services](assets/week-6/lb-target-groups.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.1: Target Groups</div>

-----------------------

### Managed my domain using Route53, created an SSL certificate via ACM, setup a record set for naked domain to point to frontend-react-js, setup a record set for api subdomain to point to the backend-flask, and Configure CORS to only permit traffic from our domain.
- I bought my domain name from [NameCheap](), which has a different zone from AWS Route53. To manage my domain name from AWS, I had to create a hosted zone in Route53. To do that, I used Route53 console to register the naked domain directly. After creating the hosted zone, I take the nameserver that was provided by AWS and add them in my namecheap domain registrar by creating a custom nameserver there.

![nameserver-update-namecheap](assets/week-6/name-serv-namecheap.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.0: Namecheap nameserver change</div>

- After the propagation finished, we created additional records to the domain name. To do that, we first created a certificate by going to ACM(AWS Certificate Manager). By using Console, we requested for a certificate. After validating the certificate, it shows that the certificate was issued:

![issued-certificate](assets/week-6/ACM-certificate-issued.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.1: Certificate issued</div>

- After issuing the certificate, we added new records to the domain name. We added an `A-record` for the naked domain and a record for the `api` subdomain. After creating those records, the console will look like the following:

![A-Records](assets/week-6/add-route-53-A-records.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.2: Add A-Records</div>

- After adding those records, we updated the load balancer to use the certificate. To do that, we went to the load balancer console and updated the listeners that were on port `4567` and `3000`. we added the `HTTP` and `HTTPS` protocols and removed the existing ports. The load balancer console looks like the following:

![updated-LB-listener](assets/week-6/updated-lb-listener.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.3: Updated listener</div>

- After updating the listener, we check if the website is working. We can check if the website is working by going to the domain name. I tried if the health route is working for my api subdomain, which worked. The result is the following:

![Health-api](assets/week-6/route-api-health.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.3: Api health check</div>

- After checking the health route, we updated the cors for our backend task-definition. we changed the values from `*` to the domain names. The cors looks like the following:

```json
.
.
.
        "environment": [
          {"name": "OTEL_SERVICE_NAME", "value": "backend-flask"},
          {"name": "OTEL_EXPORTER_OTLP_ENDPOINT", "value": "https://api.honeycomb.io"},
          {"name": "AWS_COGNITO_USER_POOL_ID", "value": "us-east-1_37QFkM89e"},
          {"name": "AWS_COGNITO_USER_POOL_CLIENT_ID", "value": "6bg85ltcq257hve1mcktj0n2i2"},
          {"name": "FRONTEND_URL", "value": "https://realmanny.me"},
          {"name": "BACKEND_URL", "value": "https://api.realmanny.me"},
          {"name": "AWS_DEFAULT_REGION", "value": "us-east-1"}
        ],
.
.
.
```
- After updating the cors, we registed the new task definition and updated the service. After updating the service, we updated the frontend buid command th have the new backend url. After building, tagging then pushing the new image, we tested if the website is working, which both the frontend and backend worked. The result is the following:

![website-functional](assets/week-6/final-frontend-backend-cors.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.4: Website functional</div>

-----------------------

### Secured Flask by not running in debug mode for production
- To secure the flask, I updated the script that runs the flask app through the `Dockerfile` not run in debug mode. To do that, we added a new `Dockerfile.prod` and a new init-script so that we can separate between the development and production. The `init-backend-dev.sh` looks like the following:

```sh
#!/bin/bash
python3 -m flask run --host=0.0.0.0 --port=4567 --debug
```
The script can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/backend-flask/init-backend-dev.sh)

and the `init-backend-prod.sh` looks like the following:

```sh
#!/bin/bash
python3 -m flask run --host=0.0.0.0 --port=4567 --no-debug --no-debugger --no-reload
```
The script can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/backend-flask/init-backend-prod.sh)

- After creating the new scripts, we updated the `Dockerfile` and the `Dockerfile.prod` to use their respective scripts. The command within `Dockerfile` that starts the flask app looks like the following:

```dockerfile
.
.
.
# Run the command to start Flask
CMD [ "bash", "./init-backend-dev.sh" ]
```
The full Dockerfile can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/backend-flask/Dockerfile)

and the command within `Dockerfile.prod` that starts the flask app looks like the following:

```dockerfile
.
.
.
# Run the command to start Flask
CMD [ "bash", "./init-backend-prod.sh" ]
```
The full Dockerfile can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/backend-flask/Dockerfile.prod)

- After updating these files, we built and tested the new image. After testing the new image, we concluded that the new image works. But we didn't tag and push the new image to the ECR. Will try to do this on my own and debug the app thouroughly.

-----------------------

### Implemented Refresh Token for Amazon Cognito
- To implement the refresh token, we updated our `checkAuth.js` function to check if the token is expired. If the token is expired, we will use the refresh token to get a new access token. The updated function looks like the following:

```js
import { Auth } from 'aws-amplify';

export async function getAccessToken(){
    Auth.currentSession()
    .then((cognito_user_session) => {
      const access_token = cognito_user_session.accessToken.jwtToken
      localStorage.setItem("access_token", access_token)
    })
    .catch((err) => console.log(err));
}

export async function checkAuth(setUser){
  Auth.currentAuthenticatedUser({
    // Optional, By default is false. 
    // If set to true, this call will send a 
    // request to Cognito to get the latest user data
    bypassCache: false 
  })
  .then((cognito_user) => {
    console.log('cognito_user',cognito_user);
    setUser({
      display_name: cognito_user.attributes.name,
      handle: cognito_user.attributes.preferred_username
    })
    return Auth.currentSession()
  }).then((cognito_user_session) => {
      console.log('cognito_user_session',cognito_user_session);
      localStorage.setItem("access_token", cognito_user_session.accessToken.jwtToken)
  })
  .catch((err) => console.log(err));
};
```
The file can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-6/frontend-react-js/src/lib/CheckAuth.js)

- After that, we updated the import statement of all the files that use the `checkAuth.js` function. The updated import statement looks like the following:

```js
import { checkAuth, getAccessToken } from '../lib/CheckAuth'
```

- After importing the statements, we update the files that use that import to use the `getAccessToken` function. The updated codes are the following:

```js
.
.
.
      await getAccessToken()
      const access_token = localStorage.getItem("access_token")
.
.
.
```
The updated files list can be found in the commit history [here](https://github.com/MannyNe/AWS-bootcamp/commit/3b29dd0c84be8e388feba929b306ec7e2019a851)

The console should show the following if the tokens are accepted (working):
![console-dev](assets/week-6/fix-expiring-token.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.0: Fixed token issue</div>

-----------------------

### Refactored bin directory to be top level
- 