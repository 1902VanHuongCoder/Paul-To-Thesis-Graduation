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

import random
import joblib

# Load model and vectorizer
model = joblib.load("svm_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# Load dataset
import json
with open("dataset.json", "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Context for follow-up handling
context = {"last_intent": None}

# Preprocessing function (implement based on your earlier code)
def preprocess_text(text):
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

# Intent classification
def classify_intent(user_input):
    processed = preprocess_text(user_input)
    vec = vectorizer.transform([processed])
    predicted_intent = model.predict(vec)[0]
    return predicted_intent

# Get response from dataset
def get_response(intent, user_input):
    for item in dataset:
        if item["intent"] == intent:
            for entity, responses in item["responses"].items():
                if entity != "default" and entity in user_input.lower():
                    return random.choice(responses)
            return random.choice(item["responses"]["default"])
    return "Xin lỗi, tôi chưa hiểu ý bạn."

# Chat loop
while True:
    user_input = input("Bạn: ")
    if user_input.lower() in ["exit", "thoát"]:
        print("Chatbot: Tạm biệt bạn!")
        break

    preprocessed_input = preprocess_text(user_input)
    response = None

    # Check for follow-up question
    if context["last_intent"]:
        matched = False
        for item in dataset:
            if item["intent"] == context["last_intent"]:
                entities = item.get("entities", {}).get("loai_sau_benh", [])
                for entity in entities:
                    if entity in preprocessed_input:
                        response = get_response(context["last_intent"], user_input)
                        matched = True
                        break
                break  # exit after checking intent
        if not matched:
            # Not a follow-up, reset context and classify again
            intent = classify_intent(user_input)
            response = get_response(intent, user_input)
            context["last_intent"] = intent
        else:
            # Follow-up handled
            pass
    else:
        # No context yet
        intent = classify_intent(user_input)
        response = get_response(intent, user_input)
        context["last_intent"] = intent

    # Print the predicted intent
    print(f"Predicted Intent: {context['last_intent']}")
    print(f"Chatbot: {response}")


