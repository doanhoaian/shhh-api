const createError = require("../../utils/createError");
const postModel = require("./model");
const axios = require("axios");
const imageService = require("../images/service");
const axiosRetry = require("axios-retry").default;
const { fetchAndCache, fetchAndCacheSingle } = require('../../utils/redisHelper');

const postService = {
    async createPost({ user_id, school_id, content, comment_permission, view_permission }, files = []) {

        let image_ids = [];
        if (files && files.length > 0) {
            image_ids = await imageService.uploadAndSaveImages(files);
        }

        const status = 'active';
        const hidden_reason = null

        const topics = await postModel.getAllTopics();
        const labels = topics.map(t => t.label);
        const labelToIdMap = Object.fromEntries(topics.map(t => [t.label, t.id]));

        const topicResult = await this.classifyTopics(content, labels, labelToIdMap);

        const topic_ids = topicResult.map(item => item.topicId);
        const topic_scores = topicResult.map(item => item.score);

        const post = await postModel.createPost({
            user_id,
            school_id,
            content,
            topic_ids,
            topic_scores,
            image_ids,
            status,
            hidden_reason,
            comment_permission,
            view_permission
        });

        return {
            post_id: post.post_id,
            status: post.status,
            hidden_reason: post.hidden_reason,
            created_at: post.created_at,
        };
    },

    async getFeedIds({ school_id, topic_value, limit, last_post_id, last_score }) {
        const cacheKey = `feedIds:${school_id}:${topic_value || 'all'}:${limit}:${last_post_id || 'null'}:${last_score || 'null'}`;

        const fetcher = () => {
            return postModel.getPostIdsForFeedCursor({
                school_id,
                topic_value,
                limit,
                last_post_id,
                last_score
            });
        };

        try {
            const feedPosts = await fetchAndCacheSingle(cacheKey, fetcher, 120);

        let nextCursor = null;
        if (feedPosts.length === limit) {
            const last = feedPosts[feedPosts.length - 1];
            nextCursor = {
                last_post_id: last.id,
                last_score: last.score
            };
        }

        const postIds = feedPosts.map(post => post.id);

        return {
            items: postIds,
            next_cursor: nextCursor
        };
        } catch (err) {
            throw createError(500, `Failed to get feed ids: ${err.message}`);
        }
    },

    async getFeedContent({ post_ids }) {
        try {
            const [staticContents, counters] = await Promise.all([
                fetchAndCache(
                    post_ids.map(id => `post:content:${id}`),
                    key => key.split(':')[2],
                    missingIds => postModel.getPostsByIds({ post_ids: missingIds }),
                    3600
                ),
                fetchAndCache(
                    post_ids.map(id => `post:counters:${id}`),
                    key => key.split(':')[2],
                    missingIds => postModel.getPostCountersByIds({ post_ids: missingIds }),
                    120
                )
            ]);

            const result = post_ids.map(id => {
                const content = staticContents[id];
                if (!content) return null;

                const counter = counters[id] || { total_like: 0, total_dislike: 0, total_comment: 0 };

                return {
                    ...content,
                    total_like: counter.total_like,
                    total_dislike: counter.total_dislike,
                    total_comment: counter.total_comment
                };
            }).filter(Boolean);

            return result;

        } catch (err) {
            throw createError(500, `Failed to get post content: ${err.message}`);
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


axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
    }
});

module.exports = postService;