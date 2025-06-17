from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend interaction

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["academicsuccessdb"]
students_collection = db["students"]

# Register endpoint
@app.route('/register', methods=['POST'])
def register_student():
    data = request.get_json()

    # Basic validation
    if not all(k in data for k in ("name", "email", "level", "target_cgpa")):
        return jsonify({"error": "Missing fields"}), 400

    # Save to MongoDB
    students_collection.insert_one(data)
    return jsonify({"message": "Student registered successfully"}), 201

# Add academic schedule/events
@app.route('/events', methods=['POST'])
def add_events():
    data = request.get_json()

    # Validate required fields
    if not all(k in data for k in ("email", "events")):
        return jsonify({"error": "Missing fields"}), 400

    # Update the student's document by email
    result = students_collection.update_one(
        {"email": data["email"]},
        {"$set": {"events": data["events"]}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"message": "Events added successfully"}), 200

# Fetch student by email
@app.route('/student', methods=['GET'])
def get_student():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    student = students_collection.find_one({"email": email}, {"_id": 0})
    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(student), 200

# Update CGPA
@app.route('/update-cgpa', methods=['POST'])
def update_cgpa():
    data = request.get_json()

    # Validate required fields
    if not all(k in data for k in ("email", "current_cgpa")):
        return jsonify({"error": "Missing fields"}), 400

    result = students_collection.update_one(
        {"email": data["email"]},
        {"$set": {"current_cgpa": data["current_cgpa"]}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"message": "CGPA updated successfully"}), 200

# Submit feedback
@app.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json()

    if not all(k in data for k in ("email", "feedback")):
        return jsonify({"error": "Missing fields"}), 400

    result = students_collection.update_one(
        {"email": data["email"]},
        {"$push": {"feedback": data["feedback"]}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"message": "Feedback submitted successfully"}), 200

# Run app
if __name__ == '__main__':
    app.run(debug=True)

