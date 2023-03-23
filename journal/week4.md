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
- To create an RDS database, I used the AWS CLI. I followed the steps provided by Andrew in the [livestream](https://youtu.be/EtD7Kv5YCUs?list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv) which showed us how to create an RDS instance through ClickOps as well as using the CLI. The CLI is easier to create and use because AWS keeps on changing the UI (which is annoying). The following is a snippet for the code (script) I used:

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
- The only thing that I changed from the script provided was that I used the GP3 Storage Type instead of the default GP2, as well as change my reigon.

----------------------

### Create common bash scripts for common database tasks
- According to the livestream, we created sql files to create the database and tables. I created a script to load those tables to the database. Becasue flask doesn't handle(create) migrations, we had to create a scripts to do that. We created 5 scripts to handle modifications and connections to the database. We created a folder named `bin` found within the `backend-flask` folder and stored the scripts there. The following is are descriptions for the scripts:

    * `db-connect.sh` - This script is used to connect to the database. It takes in the database type as an optional argument. The script is used to connect to the database and run sql scripts or commands.
    * `db-create.sh` - This script is used to create the database `cruddur`.
    * `db-drop.sh` - This script is used to drop the database `cruddur`.
    * `db-schema-load.sh` - This script is used to load the schema into the database. It takes in the database type as an optional argument. The script is used to load the schema which is found within `db/schema.sql` into the database.
    * `db-seed.sh` - This script is used to seed the database. It takes in the database type as an optional argument. The script is used to seed the database by loading the seed data which is found within `db/seed.sql` into the database.

- The following is a snippet of the `db-schema-load.sh` script:
  
```bash
  #!/usr/bin/bash

  CYAN='\033[1;36m'
  NO_COLOR='\033[0m'
  LABEL="db-schema-load"
  printf "${CYAN}==> ${LABEL}${NO_COLOR}\n"

  schema_path="$(realpath .)/db/schema.sql"

  if [ "$1" = "prod" ]; then
      CON_URL=$PROD_CONNECTION_URL
  else
      CON_URL=$CONNECTION_URL
  fi

  psql $CON_URL cruddur < $schema_path
```
The script directory can be found [here](https://github.com/MannyNe/AWS-bootcamp/tree/week-4/backend-flask/bin).

------------------------

### Installing Postgres in the backend application
- I wouldn't call this step "installing" Postgres, but rather "connecting" or "configuring" Postgres to the backend application. I say this because we added the Postgres container/image to our docker file on `week-1`, where we learnt about Docker. The first thing I did was to add the `psycopg3` package to the `requirements.txt` file. We added the `binary` as well as the `pool` versions. This package is used to connect to the database. After installing the package, I created a new file called `db.py` within the `lib` directory and added the following code to it to help us format the output of the database queries:

```python
from psycopg_pool import ConnectionPool
import os

def query_wrap_object(template):
  sql = f"""
  (SELECT COALESCE(row_to_json(object_row),'{{}}'::json) FROM (
  {template}
  ) object_row);
  """
  return sql

def query_wrap_array(template):
  sql = f"""
  (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
  {template}
  ) array_row);
  """
  return sql

connection_url = os.getenv("CONNECTION_URL")
pool = ConnectionPool(connection_url)
```
The code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-4/backend-flask/lib/db.py).

- After adding this file, we went on and modified the existing code in the `home_activity.py` file to help us query the activities which are located in the database:

```python
.
.
.
      sql = query_wrap_array("""
        SELECT
          activities.uuid,
          users.display_name,
          users.handle,
          activities.message,
          activities.replies_count,
          activities.reposts_count,
          activities.likes_count,
          activities.reply_to_activity_uuid,
          activities.expires_at,
          activities.created_at
        FROM public.activities
        LEFT JOIN public.users ON users.uuid = activities.user_uuid
        ORDER BY activities.created_at DESC
      """)
      with pool.connection() as conn:
        with conn.cursor() as cur:
          cur.execute(sql)
          # this will return a tuple
          # the first field being the data
          json = cur.fetchone()

      return json[0]
```
The full code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-4/backend-flask/services/home_activities.py).

- We used this code to query the activities from the database. Now before we can run the application, we need to create the database and load the schema into the database. We can do this by running the script found within the `bin` folder, called `db-schema-load.sh`. After loading our schema, seeding our database and passing the code-traps successfully, we ran the application and it worked as expected. The following is a screenshot of the application running:

![Cruddur fetch activities](assets/week-4/Cruddur-home.png)
<div align="center" style="font-weight: bold; margin-bottom:12px; padding-top:0px">Fig 1.0: The fetched crud (HomePage) </div>

------------------------

### Connecting the RDS instance to Gitpod

------------------------

### Created AWS Cognito trigger to insert user into database

------------------------

### Created new activities with a database insert