from lib.cognito_jwt_token import CognitoJwtToken, extract_access_token, TokenVerifyError
from functools import wraps
from flask import request, abort

def token_authorize(app, cognito_object):
    def token_authorize_auth(f):
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

        return decorated
    return token_authorize_auth