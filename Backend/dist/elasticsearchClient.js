"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esClient = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.esClient = new elasticsearch_1.Client({
    node: process.env.ELASTIC_NODE,
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASS,
    },
});
