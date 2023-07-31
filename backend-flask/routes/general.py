from flask import request, g

def load(app):
    @app.route("/health", methods=['GET'])
    def health_check():
        data = 'Healthy'
        return data, 200