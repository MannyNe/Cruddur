#!/bin/bash

# Define the URL to fetch
url="http://localhost:4567/health"

# Use Python and urllib to fetch the URL and print the response
python - <<END
import urllib.request
response = urllib.request.urlopen("$url")
print(response.getcode())
END