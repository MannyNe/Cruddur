from datetime import datetime, timedelta, timezone
from aws_xray_sdk.core import xray_recorder
from opentelemetry import trace
from lib.db import db

tracer = trace.get_tracer("user.activities")

class UserActivities:
  def run(user_handle):
    with tracer.start_as_current_span("user-activities-mock-data"):
      span = trace.get_current_span()
      model = {
        'errors': None,
        'data': None
      }
      now = datetime.now(timezone.utc).astimezone()
      span.set_attribute("app.now", now.isoformat())
      span.set_attribute("app.user", user_handle)
      if user_handle == None or len(user_handle) < 1:
        model['errors'] = ['blank_user_handle']
      else:
        now = datetime.now()
        sql = db.template('users', 'show')
        results = db.query_object_json(sql, {'handle': user_handle})
        model['data'] = results
        span.set_attribute("app.result_length", len(model['data']))
      # AWS X-RAY
      #with xray_recorder.in_subsegment('user_activities') as subsegment:
      #  subsegment.put_metadata('userhandle', user_handle,'user')
      #  subsegment.put_metadata('time', now.isoformat(), 'user')
      #  subsegment.put_metadata('result-size', len(model['data']), 'user')
      
      return model