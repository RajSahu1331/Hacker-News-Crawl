const express = require("express");
const app = express();
const dotenv = require("dotenv");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const cheerio = require("cheerio");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// Log process environment for debugging
// console.log("process.env:", process.env.PORT);

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI;

// Array to store crawled data
const newsItemsArray = [];

// Function to crawl HackerNews and populate the array
const crawlHackerNews = async () => {
  try {
    const pages = [1, 2, 3];
    const promises = pages.map((page) =>
      axios.get(`https://news.ycombinator.com/news?p=${page}`)
    );
    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      const $ = cheerio.load(response.data);
      // console.log(response.data);

      // Extract news items
      $(".athing").each((index, element) => {
        const rank = $(element).find(".rank").text().trim();
        const titleElement = $(element).find(".title > .titleline > a");
        const title = titleElement.text().trim();
        const url = titleElement.attr("href");
        const hackerNewsUrl = url
          ? new URL(url, "https://news.ycombinator.com").href
          : undefined;
        const postedOn = $(element).next().find(".age > a").text().trim();
        const upvotes = $(element).next().find(".score").text().trim();
        // Extract comments directly from the subline
        const commentsElement = $(element)
          .next()
          .next()
          .find(".subtext .comments");
        const comments = commentsElement.text().trim();

        // Extract the number of comments using regex
        const commentsMatch = comments.match(/(\d+)\s*comment/);
        const commentsCount = commentsMatch ? commentsMatch[1] : "0";

        // Log information to help identify the issue
        // console.log("Rank:", rank);
        // console.log("Title:", title);
        // console.log("URL:", url);
        // console.log("HackerNews URL:", hackerNewsUrl);
        // console.log("Posted On:", postedOn);
        // console.log("Upvotes:", upvotes);
        // console.log("Comments:", comments);

        // Create a news item object only if title is present
        if (title) {
          const newsItem = {
            rank,
            title,
            url,
            hackerNewsUrl,
            postedOn,
            upvotes,
            commentsCount,
          };

          newsItemsArray.push(newsItem);

          //   console.log(`NewsItem ${title} added to the array.`);
        }
      });
    });

    // console.log("Crawling completed. Results:", newsItemsArray);
  } catch (error) {
    console.error("Error during crawling:", error.message);
  }
};

// Set up a polling interval (e.g., every 5 minutes)
const pollingIntervalMinutes = 0.5;
const pollingIntervalMilliseconds = pollingIntervalMinutes * 60 * 1000;

// Call the crawler function initially
crawlHackerNews();

// Set up the polling process
setInterval(() => {
  crawlHackerNews();
}, pollingIntervalMilliseconds);

// Define a route to handle HTTP POST requests
app.post("/dashboard", (req, res) => {
  // Send the newsItemsArray as the response
  res.json({ newsItems: newsItemsArray });
});

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/user", require("./routes/users.js"));

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`listening on port ${port}`));
  })
  .catch((err) => console.log(err));
