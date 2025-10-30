"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const getAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const data = qs_1.default.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://analysis.windows.net/powerbi/api/.default",
    });
    const response = yield axios_1.default.post(tokenUrl, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data.access_token;
});
exports.getAccessToken = getAccessToken;
