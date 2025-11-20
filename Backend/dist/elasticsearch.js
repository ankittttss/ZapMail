"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esClient = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
exports.esClient = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});
