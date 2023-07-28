from fastapi import FastAPI, HTTPException, Query #import for FASTApi
from fastapi.middleware.cors import CORSMiddleware #Cross Origin Resource Sharing
from pydantic import BaseModel #Schema
from pymongo import MongoClient #Mongodb Connector for Python
from collections import defaultdict #Dictionary data structure
from bson.objectid import ObjectId #Type for object id use UUID in mongodb

app = FastAPI()

# Enable CORS (Cross-Origin Resource Sharing) to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatInput(BaseModel):
    message: str

class Article(BaseModel):
    text: str

#MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client["ScrapyDB"] 
articles_collection = db["articles"] #collection for scraped articles

# test route to check whether api is live or not
@app.get('/')
async def root():
    return {"message": "API live at http://localhost:8000/"}

# handle receive text from chatbot for the backend processing -> response
@app.post("/chatbot")
async def process_message(message: ChatInput):
    response = chatbot_response(message.message)
    return {"response": response}

# scrape the active page on ui -> returns informative message
@app.post("/scrape")
async def store_scraped_text(text: Article):
    try:
        #Save the scraped text to MongoDB
        articles_collection.insert_one({"text": text.text})
        return {"message": "Scraped text successfully stored iin the database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store scraped text: {str(e)}")

#search the article contents ->returns matching result
@app.get("/search/")
async def search_articles(query: str = Query(..., min_length=1, max_length=100)):
    articles = articles_collection.find({})
    inverted_index = build_inverted_index(articles)
    matching_articles = search_inverted_index(query, articles, inverted_index)
    return {"search_results": matching_articles,"match":len(matching_articles)}

#to fetch all articles
@app.get("/articles")
async def get_articles():
    articles = list(articles_collection.find({},{"_id":0}))
    return articles

#Logic processor
def chatbot_response(message):
    try:
        message = message.lower()
        if "hello" in message or "hi" in message or "hey" in message:
            return "Hello there! How can i assist you?"
        elif "how are you" in message or "how's it going?" in message:
            return "I'm just a bot, but thanks for asking!"
        else:
            return "I'm sorry, but I don't understand that. Can you please rephrase?"
    except Exception as e:
        error_message = "Error processing the request: " + str(e)
        return {"error": error_message}
    
# Processing the text/articles
def preprocess_text(text):
    #Tokenize the text by splitting on whitespace and removing punctuation
    #Convert tokens to lowercase for case_insensitive search
    return [token.strip(".,!?\"'()") for token in text.lower().split()]

# Build inverted index to search for the keywords
def build_inverted_index(articles):
    inverted_index = defaultdict(list)
    for article in articles:
        tokens = preprocess_text(article["text"])
        for token in tokens:
            if article["_id"] not in inverted_index[token]:
                inverted_index[token].append(article["_id"])
    return inverted_index

# Search index for matching keyword and return matched articles
def search_inverted_index(query, articles, inverted_index):
    query_tokens = preprocess_text(query)
    result_articles = set()
    matched_articles = []

    for token in query_tokens:
        articles_id = inverted_index.get(token, [])
        result_articles.update(articles_id)
    
    # matched_articles = [article for article in articles if article.id in result_articles] #Need to fix the Pymongo Cursor/Once used get revoked.
    for result_article_id in result_articles:
        article = articles_collection.find_one({"_id": ObjectId(result_article_id)})
        matched_articles.append(article)
    
    for i in range(0, len(matched_articles)):
        snippet = extract_snippets(matched_articles[i]["text"], query_tokens)
        matched_articles[i]["snippet"] = snippet
        matched_articles[i].pop("_id")
    return matched_articles

# Generate snippets from the matched articles
def extract_snippets(article_text, query_tokens, snippet_length=10):
    words = article_text.split()
    query_indices = [i for i, word in enumerate(words) if word.lower() in query_tokens]

    snippets = []
    for idx in query_indices:
        start_idx = max(0, idx - snippet_length)
        end_idx = min(len(words), idx + snippet_length)
        snippet = " ".join(words[start_idx:end_idx])
        snippets.append(snippet)
    return "...".join(snippets)

# For debugging purpose to check output of inverted_index
# import json
# def write_to_file(file_name,param):
#     with open(f"{file_name}.txt","w") as file:
#         for token,article_ids in param.items():
#             file.write(f"{token}: {', '.join(map(str, article_ids))}\n")