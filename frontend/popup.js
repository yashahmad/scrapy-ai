document.addEventListener("DOMContentLoaded", function () {
  const chatbox = document.getElementById("chatbox");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  let scrapedText = null;

  //Adds click on event on send button
  sendBtn.addEventListener("click", function () {
    const userMessage = userInput.value.trim();
    if (userMessage !== "") {
      if (userMessage === "/scrape") {
        addMessage("You: " + userMessage);
        showLoading();
        scrapeActivePage();
      } else if (userMessage.startsWith("/search ")) {
        addMessage("You: " + userMessage);
        const searchQuery = userMessage.substring(8);
        searchScrapedText(searchQuery);
      } else {
        addMessage("You: " + userMessage);

        fetchChatbotResponse(userMessage)
          .then((response) => {
            addMessage("Chatbot: " + response);
          })
          .catch((error) => {
            console.error("Error fetching chatbot response:", error);
          });
      }
      userInput.value = "";
    }
  });

  // fetches chatbot response
  function fetchChatbotResponse(message) {
    return fetch("http://localhost:8000/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          return data.error;
        } else {
          return data.response;
        }
      })
      .catch((error) => {
        console.error("Error fetching chatbot response:", error);
      });
  }

  // adds message in the chatbox dom
  function addMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    chatbox.appendChild(messageElement);
  }

  // show loading prompt while processing
  function showLoading() {
    const loadingMessage = "Chatbot: Loading...";
    addMessage(loadingMessage);
  }

  // scrape the current web page
  function scrapeActivePage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (!currentTab) {
        console.error("Error: Unable to get the current tab.");
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: currentTab.id },
          func: () => {
            return document.documentElement.outerText;
          },
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          scrapedText = results[0].result;
          hideLoading();
          //   downloadScrapedText(scrapedText);
          showDownloadButton();
          sendScrapedText(scrapedText); // Store the scraped text to the backend
        }
      );
    });
  }

  // hides the loading message after the processing is done
  function hideLoading() {
    const loadingMessage = document.querySelector(`#chatbox div:last-child`);
    if (loadingMessage && loadingMessage.textContent.includes("Loading...")) {
      chatbox.removeChild(loadingMessage);
    }
  }

  // download button appear when scraping is done
  function showDownloadButton() {
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download Scraped Text";
    downloadButton.classList.add("btn", "btn-primary", "mt-2");
    downloadButton.addEventListener("click", function () {
      if (scrapedText) {
        downloadScrapedText(scrapedText);
      }
    });
    chatbox.appendChild(downloadButton);
  }

  // send the scraped text to the backend
  function sendScrapedText(text) {
    return fetch("http://localhost:8000/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => {
        console.error("Error storing scraped text:", error);
      });
  }

  // generate text file to download scraped text
  function downloadScrapedText(text) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scraped_text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // send the query to backend to retrieve matched articles
  function searchScrapedText(query) {
    // if (!scrapedText){
    //   addMessage("Chatbot: Please scrape the page first using /scrape.");
    //   return;
    // }

    // const searchResults = findMatches(query);
    // if (searchResults.length === 0){
    //   addMessage("Chatbot: No matching results found.");
    // } else {
    //   addMessage("Chatbot: Search Results:");
    //   searchResults.forEach((results) => {
    //     addMessage(results);
    //     addMessage("------------------------------------------------------");
    //   });
    // }
    fetchSearchResults(query)
      .then((data) => {
        if (data.match === 0) {
          addMessage("Chatbot: No matching results found.");
        } else {
          addMessage(`Chatbot: ${data.match} matching result(s) found:`);
          data.search_results.forEach((result) => {
            addMessage(`${result.snippet}`);
            addMessage('----------------------------------------------');
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  }

  // retrieve fetch results
  function fetchSearchResults(query) {
    return fetch(`http://localhost:8000/search/?query=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        console.log(response);
        return response.json();
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  }

  // Matches on ui without backend for current pages only
  // function findMatches(query) {
  //   const lines = scrapedText.split("\n");
  //   return lines.filter((line) => line.toLowerCase().includes(query.toLowerCase()));
  // }
});
