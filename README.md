# scrapy-ai
Scrapy is a chat bot inside chrome extension built using VanillaJs and backend on FastAPI. It has the capability to scrape the current active page and search for the articles and returns snippet.

Steps to start backend
---------------------------------------------------
1.Assumed you already have mongodb running at http://localhost:27017
2. cd backend
   pip install -r requirements.txt
3.run uvicorn main:app --host 0.0.0.0 --port 8000
4.you can check api status at http://localhost:8000/. It should return a message as "API live at http://localhost:8000/"

Steps for UI
-----------------------------------------------------
1.Open Chrome Browser and select extensions
2.Load unpacked and locate the frontend/manifest.json file from it
3.Next thing, you can click on extension and Type Hi to Chatbot
4.Type '/scrape' so that the chatbot will scrape the current page and will give a download option to download the scraped text
5.Inorder to search , type '/search <keyword>' and it will return the results.

