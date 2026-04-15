import sys
import requests
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")


@app.route("/api")
def api():
    code = request.args.get("code", "").strip().lower()

    if not code:
        return jsonify({
            "success": False,
            "error": "Не введено ISO-2 код країни."
        }), 400

    url = f"http://api.worldbank.org/v2/country/{code}?format=json"

    try:
        response = requests.get(url, timeout=5)
    except requests.RequestException:
        return jsonify({
            "success": False,
            "error": "Помилка мережі при зверненні до World Bank API."
        }), 500

    if response.status_code != 200:
        return jsonify({
            "success": False,
            "error": f"Помилка HTTP {response.status_code} при зверненні до API."
        }), 500

    try:
        data = response.json()
    except Exception:
        return jsonify({
            "success": False,
            "error": "Не вдалося розпізнати JSON-відповідь від API."
        }), 500

    if not isinstance(data, list) or len(data) < 2 or not data[1]:
        return jsonify({
            "success": False,
            "error": f"Країну за кодом '{code.upper()}' не знайдено."
        }), 404

    country = data[1][0]

    result = {
        "success": True,
        "iso2": country.get("iso2Code", "-"),
        "name": country.get("name", "-"),
        "capital": country.get("capitalCity", "-"),
        "region": country.get("region", {}).get("value", "-"),
        "income": country.get("incomeLevel", {}).get("value", "-"),
        "lending": country.get("lendingType", {}).get("value", "-"),
        "latitude": country.get("latitude", "-"),
        "longitude": country.get("longitude", "-")
    }

    return jsonify(result)


if __name__ == "__main__":
    port = 8080

    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Порт має бути цілим числом.")
            sys.exit(1)

    app.run(host="127.0.0.1", port=port)