# Week 3 — Decentralized Authentication
![Conceptual Diagram (Napkin)](assets/AWS-Bootcamp_Banner.jpg)
- In this week, we learnt about a variety of technologies to progress with our containerization knowledge. Some of the things we learnt include: 
    - [X] Provision via ClickOps a Amazon Cognito User Pool
    - [X] Install and configure Amplify client-side library for Amazon Congito
    - [X] Implement API calls to Amazon Coginto for custom login, signup, recovery and forgot password page
    - [X] Show conditional elements and data based on logged in or logged out
    - [X] Verify JWT Token server side to serve authenticated API endpoints in Flask Application

## Required Homework/Tasks (stretch)
- To test if we grasped the concepts provided to us through the meeting as well as the provided videos to aid us, we were given homeworks. They are:
    - [X] Decouple the JWT verify from the application code by writing a  Flask Middleware.
    - [X] Decouple the JWT verify by implementing a Container Sidecar pattern using AWS’s official Aws-jwt-verify.js library.
    - [X] Implement MFA that send an SMS (text message)

- I will describe my work and the process I overcame in the order provided above.

### Decoupling the JWT verify from the application code by writing a Flask Middleware.
- To decouple the verification process from the application, I decided to create a decorated function that would be a middleware to secure my functions. In a folder called middleware, I created a new file called `token_authorize.py`. The following is a snippet for the code:
```python
.
.
.
        @wraps(f)
        def decorated(*args, **kwargs):
            access_token = extract_access_token(request.headers)
        
            try:
                claims = cognito_object.verify(access_token)
                app.logger.debug("authenicated")
                app.logger.debug(claims)
                app.logger.debug(claims['username'])
                return f(claims, *args, **kwargs)
            except TokenVerifyError as e:
                app.logger.debug(e)
                app.logger.debug("unauthenicated")
                return f(None, *args, **kwargs)
.
.
.
```
The full code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-3/backend-flask/middleware/token_authorize.py)

- I then added the middleware to the `home_activities` route in the `app.py` file. The following is a snippet for the code:
```python
@app.route("/api/activities/home", methods=['GET'])
@token_authorize(app, cognito_jwt_token)
def data_home(claims):
  if not claims:
    data = HomeActivities.run()
  else:
    data = HomeActivities.run(cognito_user_id=claims['username'])
  return data, 200
```
The full code can be found [here](https://github.com/MannyNe/AWS-bootcamp/blob/week-3/backend-flask/app.py) starting from line 181 to 189. It's commented out to test the sidecar pattern that I'll get into later.

----------------------
### Decouple the JWT verify by implementing a Container Sidecar pattern using AWS’s official Aws-jwt-verify.js library.


------------------------

### Implement MFA that send an SMS (text message)
