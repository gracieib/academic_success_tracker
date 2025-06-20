import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools.tavily_search.tool import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
import bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["academicsuccessdb"]
students_collection = db["students"]

api_key = os.getenv("GOOGLE_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

#initailizing llm
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-001",
    temperature=0.7,
)

# Creating Tavily search tool
tavily_tool = TavilySearchResults(api_key=os.getenv("TAVILY_API_KEY"))

# Defining the agent's tools and prompt
tools = [tavily_tool]
from langchain_core.prompts import MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful academic assistant for university students. Provide concise, accurate answers."),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

memory = ConversationBufferMemory()
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    memory=memory)


# Register endpoint
@app.route('/register', methods=['POST'])
def register_student():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        required_fields = ["name", "email", "level", "target_cgpa", "password"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing fields. Required: {required_fields}"}), 400

        if students_collection.find_one({"email": data["email"]}):
            return jsonify({"error": "Student already exists"}), 409

        # Hash password
        hashed_pw = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt())

        student_data = {
            "name": data["name"],
            "email": data["email"],
            "level": data["level"],
            "target_cgpa": data["target_cgpa"],
            "password": hashed_pw  # store hashed password
        }

        result = students_collection.insert_one(student_data)

        return jsonify({
            "message": "Student registered successfully",
            "id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Login endpoint
@app.route('/login', methods=['POST'])
def login_student():
    try:
        data = request.get_json()
        if not data or "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400

        student = students_collection.find_one({"email": data["email"]})
        if not student:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.checkpw(data["password"].encode('utf-8'), student["password"]):
            return jsonify({"error": "Invalid credentials"}), 401

        student.pop("password", None)
        return jsonify({
            "message": "Login successful",
            "student": student
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


# Fetch all students
@app.route('/events', methods=['GET'])
def get_events():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    student = students_collection.find_one({"email": email}, {"_id": 0, "events": 1})
    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"events": student.get("events", [])}), 200


# Add academic schedule/events
@app.route('/events', methods=['POST'])
def add_events():
    data = request.get_json()

    if not all(k in data for k in ("email", "events")):
        return jsonify({"error": "Missing fields"}), 400

    result = students_collection.update_one(
        {"email": data["email"]},
        {"$set": {"events": data["events"]}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"message": "Events added successfully"}), 200

# planner for CGPA
@app.route('/plan-cgpa', methods=['POST'])
def plan_cgpa():
    data = request.get_json()
    target = data.get("target_cgpa")
    subjects = data.get("subjects", [])

    if not target or not subjects:
        return jsonify({"error": "Missing target_cgpa or subjects"}), 400

    total_units = sum(s["unit"] for s in subjects)

    # Grade point values
    grade_scale = {
        "A": 5.0,
        "B": 4.0,
        "C": 3.0,
        "D": 2.0,
        "E": 1.0,
        "F": 0.0
    }

    recommendations = []
    for subject in subjects:
        unit = subject["unit"]
        for grade, point in grade_scale.items():
            test_recommendations = recommendations + [{
                "subject": subject["name"],
                "unit": unit,
                "point": point,
                "grade": grade
            }]
            total_points = sum(r["point"] * r["unit"] for r in test_recommendations)
            test_cgpa = total_points / total_units
            if test_cgpa >= target:
                recommendations.append({
                    "subject": subject["name"],
                    "recommendedGrade": grade
                })
                break
        else:
            recommendations.append({
                "subject": subject["name"],
                "recommendedGrade": "F"
            })

    return jsonify({"recommendations": recommendations}), 200

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


#chatbot
@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        user_input = request.json.get('message')
        if not user_input:
            return jsonify({"error": "Message is required"}), 400

        response = agent_executor.invoke({"input": user_input})
        answer = response.get("output", "I couldn't generate a response.")

        return jsonify({
            "response": answer,
            "sources": response.get("intermediate_steps", [])
        })

    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        return jsonify({"error": "Failed to process request"}), 500

# Run app
if __name__ == '__main__':
    app.run(port=5001, debug=True)

