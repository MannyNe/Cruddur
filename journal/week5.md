# Week 5 — DynamoDB and Serverless Caching
![Conceptual Diagram (Napkin)](assets/AWS-Bootcamp_Banner.jpg)
- In this week, we learnt about a variety of technologies to progress with our DynamoDB knowledge. Some of the things we learnt include: 
    * Data Modelling a Direct Messaging System using Single Table Design
    * Implementing DynamoDB query using Single Table Design
    * Provisioning DynamoDB tables with Provisioned Capacity
    * Utilizing a Global Secondary Index (GSI) with DynamoDB
    * Rapid data modelling and implementation of DynamoDB with DynamoDB Local
    * Writing utility scripts to easily setup and teardown and debug DynamoDB data

## Required Homework/Tasks (class summary)
- To test if we grasped the concepts provided to us through the meeting as well as the provided videos to aid us, we were given homeworks. They are:
    - [X] Implementing the schema load, seed, scan scripts as well as the pattern scripts for read and list conversations.
    - [X] Implementing the updating of the Cognito ID Script for Postgres Database, listing messages group into application(for all patterns) and creating a message for an existing message group into application(for all patterns)
    - [X] Implementing the updating of a Message Group using DynamoDB Streams

- I will describe my work and the process in the order provided above.

### Implementing the schema load, seed, scan scripts as well as the pattern scripts for read and list conversations.
- Implementing the schema load
    * The process for implementing the schema load was straight forward. There was no much code traps to successfully implement the schema load. We used the [Boto3 Docs]() to implement the script. the following is a snippet for the script:
    ```python
    #!/usr/bin/env python3

    import boto3
    import sys

    attrs = {
      'endpoint_url': 'http://localhost:8000'
    }

    if len(sys.argv) == 2:
      if "prod" in sys.argv[1]:
        attrs = {}

    ddb = boto3.client('dynamodb',**attrs)

    table_name = 'cruddur-messages'


    response = ddb.create_table(
      TableName=table_name,
      AttributeDefinitions=[
        {
          'AttributeName': 'message_group_uuid',
          'AttributeType': 'S'
        },
        {
          'AttributeName': 'pk',
          'AttributeType': 'S'
        },
        {
          'AttributeName': 'sk',
          'AttributeType': 'S'
        },
      ],
      .
      .
      .
    ```
    The full code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-5/backend-flask/bin/ddb/schema-load).

- Implementing the seeding
    * The seeding script was straight forward as well, we had a list of generated conversations that were set to use in the seeding script. I changed the seeding script's `my_user` to be my handle. This was one of the codetraps I faced, which I will describe in the later parts of the documentation. We wont use this seed for the production environment due to costs(instead of puts, we would use batch writes). The following is a snippet of the script:
    ```python
    #!/usr/bin/env python3

    import boto3
    import os
    import sys
    from datetime import datetime, timedelta, timezone
    import uuid

    current_path = os.path.dirname(os.path.abspath(__file__))
    parent_path = os.path.abspath(os.path.join(current_path, '..', '..'))
    sys.path.append(parent_path)
    from lib.db import db

    attrs = {
      'endpoint_url': 'http://localhost:8000'
    }
    # unset endpoint url for use with production database
    if len(sys.argv) == 2:
      if "prod" in sys.argv[1]:
        attrs = {}
    ddb = boto3.client('dynamodb',**attrs)

    def get_user_uuids():
      sql = """
        SELECT 
          users.uuid,
          users.display_name,
          users.handle
        FROM users
        WHERE
          users.handle IN(
            %(my_handle)s,
            %(other_handle)s
            )
      """
      users = db.query_array_json(sql,{
        'my_handle':  'manny',
        'other_handle': 'bayko'
      })
      my_user    = next((item for item in users if item["handle"] == 'manny'),  None)
      other_user = next((item for item in users if item["handle"] == 'bayko'),  None)
      results = {
        'my_user': my_user,
        'other_user': other_user
      }
      print('get_user_uuids')
      print(results)
      return results
      .
      .
      .
    ```
    The full code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-5/backend-flask/bin/ddb/seed).

- Implementing the scan scripts
    * To be sure the data is within the DB, we created the scan script. This was also a straight forward process we followed with the help of some documentations as well as ChatGPT. This script shows us the messages inserted within the database. The following is a snippet of the script:
    ```python
    #!/usr/bin/env python3
    import boto3

    attrs = {
      'endpoint_url': 'http://localhost:8000'
    }
    ddb = boto3.resource('dynamodb',**attrs)
    table_name = 'cruddur-messages'

    table = ddb.Table(table_name)
    response = table.scan()

    items = response['Items']
    for item in items:
      print(item)
    ```
    The code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-5/backend-flask/bin/ddb/scan).

- Implementing the access pattern scripts for read and list conversations
    * The pattern scripts are used for a more granular view of the data. The scripts within the `patterns` folder helps in showing us more options and how much our query costs for scanning the DB. Their function is simillar like the scan script, but these scripts have much more detail and limits on how much data is fetched from the database. The following is a snippet of the `list-conversations`script:
    ```python
    .
    .
    .
    def get_my_user_uuid():
        sql = """
          SELECT 
            users.uuid
          FROM users
          WHERE
            users.handle =%(handle)s
        """
        uuid = db.query_value(sql,{
          'handle':  'manny'
        })
        return uuid

    my_user_uuid = get_my_user_uuid()
    print(f"my-uuid: {my_user_uuid}")
    year = str(datetime.now().year)
    # define the query parameters
    query_params = {
      'TableName': table_name,
      'KeyConditionExpression': 'pk = :pk AND begins_with(sk,:year)',
      'ScanIndexForward': False,
      'ExpressionAttributeValues': {
        ':year': {'S': year },
        ':pk': {'S': f"GRP#{my_user_uuid}"}
      },
      'ReturnConsumedCapacity': 'TOTAL'
    }
    .
    .
    .
    ```
    And the snippet of the `get-conversations`script:
    ```python
    .
    .
    .
    dynamodb = boto3.client('dynamodb',**attrs)
    table_name = 'cruddur-messages'

    message_group_uuid = "5ae290ed-55d1-47a0-bc6d-fe2bc2700399"

    year = str(datetime.datetime.now().year)
    # define the query parameters
    query_params = {
      'TableName': table_name,
      'ScanIndexForward': False,
      'Limit': 20,
      'ReturnConsumedCapacity': 'TOTAL',
      'KeyConditionExpression': 'pk = :pk AND begins_with(sk,:year)',
      #'KeyConditionExpression': 'pk = :pk AND sk BETWEEN :start_date AND :end_date',
      'ExpressionAttributeValues': {
        ':year': {'S': year },
        #":start_date": { "S": "2023-03-01T00:00:00.000000+00:00" },
        #":end_date": { "S": "2023-03-19T23:59:59.999999+00:00" },
        ':pk': {'S': f"MSG#{message_group_uuid}"}
      }
    }
    .
    .
    .
    ```
    The full code for both script can be found in the directory [here](https://github.com/MannyNe/AWS-bootcamp/tree/week-5/backend-flask/bin/ddb/patterns)


### Implementing the updating of the Cognito ID Script for Postgres Database, listing messages group into application(for all patterns) and creating a message for an existing message group into application(for all patterns).
