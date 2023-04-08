#!/bin/bash

# Define the URL to fetch
url="http://localhost:4567/health"

# Use Python and urllib to fetch the URL and print the response
python - <<END
import urllib.request
try:
    response = urllib.request.urlopen("$url")
    if response.getcode() == 200:
        print("[OK] Flask server is running")
        exit(0)  # success
    else:
        print("[BAD] Flask server is not running")
        exit(1)  # failure
except urllib.error.URLError as e:
    print("Error fetching URL:", e.reason)
    exit(1)  # failure
END