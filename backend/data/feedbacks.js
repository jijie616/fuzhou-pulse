const fs = require("fs");
const path = require("path");

const feedbackFilePath = path.join(__dirname, "feedbacks.json");

function ensureFeedbackFile() {
    if (!fs.existsSync(feedbackFilePath)) {
        writeFeedbacks([]);
    }
}

function readFeedbacks() {
    try {
        ensureFeedbackFile();
        const rawData = fs.readFileSync(feedbackFilePath, "utf8");
        if (!rawData.trim()) {
            return [];
        }

        const parsedData = JSON.parse(rawData);
        return Array.isArray(parsedData.feedbacks) ? parsedData.feedbacks : [];
    } catch (error) {
        console.warn("Failed to read feedbacks.json, using empty feedback list.", error);
        return [];
    }
}

function writeFeedbacks(feedbacks) {
    try {
        const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];
        fs.writeFileSync(feedbackFilePath, JSON.stringify({ feedbacks: safeFeedbacks }, null, 2) + "\n", "utf8");
    } catch (error) {
        console.error("Failed to write feedbacks.json.", error);
    }
}

function addFeedback(feedback) {
    const feedbacks = readFeedbacks();
    feedbacks.push(feedback);
    writeFeedbacks(feedbacks);
    return feedback;
}

module.exports = {
    readFeedbacks,
    writeFeedbacks,
    addFeedback
};
