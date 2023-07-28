
# Scrapy AI

Scrapy is a chat bot inside chrome extension built using VanillaJs and backend on FastAPI. It has the capability to scrape the current active page and search for the articles and returns snippet.

- **Frontend**- VanillaJs, Bootstrap
- **Backend**- Python, FastAPI, MongoDB
 ---

### Requirements
- Design a chatbot inside a Chrome extension using VueJS/plain JS that uses a FastAPI python backend
- The bot should be able to scrape the current active page and return the text as a downloadable file
- Implement text search over all article contents from the bot. You can use Postgres with Supabase for this
- Result should be snippets from the articles which have a match

---
### Steps to start Backend
```
1.Assumed you already have mongodb running at http://localhost:27017 
2.cd backend pip install -r requirements.txt 
3.Run uvicorn main:app --host 0.0.0.0 --port 8000 
4.You can check api status at http://localhost:8000/. 
It should return a message as "API live at http://localhost:8000/"
```

---
### Steps to start Frontend
```
1.Open Chrome Browser and select extensions 
2.Load unpacked and locate the frontend/manifest.json file from it 
3.Next thing, you can click on extension and Type Hi to Chatbot 
4.Type '/scrape' so that the chatbot will scrape the current page and will give a download option to download the scraped text 
5.Inorder to search , type '/search ' and it will return the results.
```

https://github.com/yashahmad/scrapy-ai/assets/26409771/c5a905d6-adb5-42e0-be6e-e4985b866c90

