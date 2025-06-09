const createError = require("../../utils/createError");
const confessionModel = require("./model");
const axios = require("axios");
const imageService = require("../images/service");

const confessionService = {
    async createConfession({ user_id, school_id, content }, files = []) {
    
        let image_ids = [];
        if (files && files.length > 0) {
            image_ids = await imageService.uploadAndSaveImages(files);
        }

        const sensitiveScore = await this.checkContentSensitivity(content);
        const thresholdSensitive = 0.8;

        let status = "active";
        let hidden_reason = null;

        if (sensitiveScore > thresholdSensitive) {
            status = "hidden";
            hidden_reason = "sensitive";
        }

        const topics = await confessionModel.getAllTopics();
        const labels = topics.map(t => t.label);
        const labelToIdMap = Object.fromEntries(topics.map(t => [t.label, t.id]));

        const topicResult = await this.classifyTopics(content, labels, labelToIdMap);

        const topic_ids = topicResult.map(item => item.topicId);
        const topic_scores = topicResult.map(item => item.score);

        console.log(topic_ids);
        console.log(topic_scores);

        const confession = await confessionModel.createConfession({
            user_id,
            school_id,
            content,
            topic_ids,
            topic_scores,
            image_ids,
            status,
            hidden_reason,
        });

        return {
            confession_id: confession.id,
            status,
            hidden_reason,
            created_at: confession.created_at,
        };
    },

    async checkContentSensitivity(content) {
        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/unitary/toxic-bert",
                { inputs: content },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    },
                }
            );

            console.log("CheckContentSensitivity response:", response.data);

            return response.data[0]?.find(item => item.label === "toxic")?.score || 0;
        } catch (err) {
            console.error("Hugging Face API error (toxicity):", err.message);
            return 0;
        }
    },

    async classifyTopics(content, labels, labelToIdMap) {
        try {
            content = content.replace(/[\p{Emoji}]/gu, '');

            const response = await axios.post(
                "https://api-inference.huggingface.co/models/joeddav/xlm-roberta-large-xnli",
                {
                    inputs: content,
                    parameters: {
                        candidate_labels: labels,
                        multi_class: true
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                }
            );

            console.log("ClassifyTopics response:", response.data);

            const scores = response.data.scores;
            const labelsReceived = response.data.labels;

            const labeledScores = labelsReceived
                .map((label, i) => ({ label, score: scores[i] }))
                .sort((a, b) => b.score - a.score);

            if (labeledScores.length === 0) {
                return [];
            }

            const top1Score = labeledScores[0].score;

            const thresholdRatio = Math.max(0.2, 0.5 - 0.015 * labels.length);

            const filteredTopics = labeledScores
                .filter(item => item.score >= thresholdRatio * top1Score)
                .slice(0, 3);

            return filteredTopics.length > 0
                ? filteredTopics.map(({ label, score }) => ({
                    topicId: labelToIdMap[label],
                    score
                }))
                : [{
                    topicId: labelToIdMap[labeledScores[0].label],
                    score: labeledScores[0].score
                }];

        } catch (err) {
            console.error("Hugging Face API error (classification):", err.message, err.response?.data);
            return [];
        }
    }
};

module.exports = confessionService;