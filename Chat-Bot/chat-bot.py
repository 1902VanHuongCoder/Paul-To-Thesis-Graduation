!pip install underthesea scikit-learn joblib --quiet

# Upload the dataset
from google.colab import files
import json

uploaded = files.upload()

# Load JSON file
filename = list(uploaded.keys())[0]
with open(filename, 'r', encoding='utf-8') as f:
    dataset = json.load(f)

# Extract questions and answers
from underthesea import word_tokenize
import re

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = word_tokenize(text, format="text")
    return text

# Preprocess the dataset
X, y = [], []

for item in dataset:
    intent = item["intent"]
    for pattern in item["patterns"]:
        preprocessed = preprocess_text(pattern)
        X.append(preprocessed)
        y.append(intent)

# Check the dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import joblib

# Vectorization
vectorizer = TfidfVectorizer()
X_vectorized = vectorizer.fit_transform(X)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X_vectorized, y, test_size=0.2, random_state=42)
model = SVC(kernel='linear', probability=True)
model.fit(X_train, y_train)

# Accuracy
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# Save model and vectorizer
joblib.dump(model, "svm_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")


!pip install rapidfuzz

import random
import joblib
import json
import re
from rapidfuzz import fuzz, process

# Load model and vectorizer
model = joblib.load("svm_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# Load dataset
with open("dataset.json", "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Context for follow-up
context = {"last_intent": None}

# Preprocessing
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    return text.strip()

# Intent classification
def classify_intent(user_input):
    processed = preprocess_text(user_input)
    vec = vectorizer.transform([processed])
    predicted_intent = model.predict(vec)[0]
    return predicted_intent


def match_entity_fuzzy(user_input, entity_list, threshold=50):
    result = process.extractOne(user_input, entity_list, scorer=fuzz.token_set_ratio)
    if result is not None:
        match, score, _ = result
        print(score)
        if score >= threshold:

            return match
    return None

# 🌟 Structured response renderer
def render_structured_response(response_sections):
    output = []
    for section in response_sections:
        if section["type"] == "title":
            output.append(f"\n=== {section['content']} ===")
        elif section["type"] == "text":
            output.append(section["content"])
        elif section["type"] == "list":
            output.extend([f"• {item}" for item in section["content"]])
        elif section["type"] == "conclusion":
            output.append(f"\n👉 {section['content']}")
    return "\n".join(output)

# 🌟 Updated get_response function
def get_response(intent, user_input):
    user_input_lower = user_input.lower()
    for item in dataset:
        if item["intent"] == intent:
            # Flatten all entity keys
            entity_keys = [k for k in item["responses"].keys() if k != "default"]
            entity_match = match_entity_fuzzy(user_input_lower, entity_keys)

            if entity_match:
                responses = item["responses"][entity_match]
                if isinstance(responses, list) and isinstance(responses[0], list):
                    return render_structured_response(random.choice(responses))
                elif isinstance(responses[0], dict):
                    return render_structured_response(responses)
                else:
                    return random.choice(responses)

            # Default fallback
            default_responses = item["responses"].get("default", [])
            if isinstance(default_responses, list) and len(default_responses) > 0:
                if isinstance(default_responses[0], dict):
                    return render_structured_response(default_responses)
                elif isinstance(default_responses[0], list):
                    return render_structured_response(random.choice(default_responses))
                else:
                    return random.choice(default_responses)

    return "Xin lỗi, tôi chưa hiểu ý bạn."

# 🧠 Chat loop
while True:
    user_input = input("Bạn: ")
    if user_input.lower() in ["exit", "thoát"]:
        print("Chatbot: Tạm biệt bạn!")
        break

    preprocessed_input = preprocess_text(user_input)
    response = None

    # Check follow-up with fuzzy entity matching
    if context["last_intent"]:
        matched = False
        for item in dataset:
            if item["intent"] == context["last_intent"]:
                raw_entities = item.get("entities", {})
                entities = []
                if isinstance(raw_entities, dict):
                    for val in raw_entities.values():
                        entities.extend(val if isinstance(val, list) else [val])
                elif isinstance(raw_entities, list):
                    entities = raw_entities

                fuzzy_entity = match_entity_fuzzy(preprocessed_input, entities)
                if fuzzy_entity:
                    response = get_response(context["last_intent"], user_input)
                    matched = True
                    break
        if not matched:
            intent = classify_intent(user_input)
            response = get_response(intent, user_input)
            context["last_intent"] = intent
    else:
        intent = classify_intent(user_input)
        response = get_response(intent, user_input)
        context["last_intent"] = intent

    print(f"\n🎯 Predicted Intent: {context['last_intent']}")
    print(f"🤖 Chatbot:\n{response}")
