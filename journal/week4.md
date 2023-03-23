# Week 4 — Postgres and RDS

![Conceptual Diagram (Napkin)](assets/AWS-Bootcamp_Banner.jpg)
- In this week, we learnt about a variety of technologies to progress with our containerization knowledge. Some of the things we learnt include: 
    - [X] Create an RDS Database via the AWS CLI
    - [X] Create common bash scripts for common database tasks
    - [X] Installing Postgres in the backend application
    - [X] Connecting the RDS instance to Gitpod
    - [X] Created AWS Cognito trigger to insert user into database
    - [X] Created new activities with a database insert

- I will describe my work and the process in the order provided above.

### Create an RDS Database via the AWS CLI
- To create an RDS database, I used the AWS CLI. I followed the steps provided by Andrew in the [livestream]() which showed us how to create an RDS instance through ClickOps as well as using the CLI. The CLI is easier to create and use because AWS keeps on changing the UI (which is annoying). The following is a snippet for the code (script) I used:

```bash
#!/bin/bash

aws rds create-db-instance \
  --db-instance-identifier cruddur-db-instance \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version  14.6 \
  --master-username root \
  --master-user-password mysupersecretpasswordwhichIwontpostlol \
  --allocated-storage 20 \
  --availability-zone us-east-1a \
  --backup-retention-period 0 \
  --port 5432 \
  --no-multi-az \
  --db-name cruddur \
  --storage-type gp3 \
  --publicly-accessible \
  --storage-encrypted \
  --enable-performance-insights \
  --performance-insights-retention-period 7 \
  --no-deletion-protection
```
- The only thing that I changed from the spreipt provided was that I used the GP3 Storage Type instead of the default GP2.

----------------------

### Create common bash scripts for common database tasks

------------------------

### Implement MFA that send an SMS (text message)

------------------------

### Installing Postgres in the backend application

------------------------

### Connecting the RDS instance to Gitpod

------------------------

### Created AWS Cognito trigger to insert user into database

------------------------

### Created new activities with a database insert