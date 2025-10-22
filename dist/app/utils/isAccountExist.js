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
exports.isAccountExist = void 0;
const auth_schema_1 = require("../modules/auth/auth.schema");
const app_error_1 = require("./app_error");
const http_status_1 = __importDefault(require("http-status"));
const isAccountExist = (email, populateField) => __awaiter(void 0, void 0, void 0, function* () {
    let isExistAccount;
    if (populateField) {
        isExistAccount = yield auth_schema_1.Account_Model.findOne({ email }).populate(populateField);
    }
    else {
        isExistAccount = yield auth_schema_1.Account_Model.findOne({ email });
    }
    // check account
    if (!isExistAccount) {
        throw new app_error_1.AppError("Account not found!!", http_status_1.default.NOT_FOUND);
    }
    if (isExistAccount.isDeleted) {
        throw new app_error_1.AppError("Account deleted !!", http_status_1.default.BAD_REQUEST);
    }
    if (isExistAccount.accountStatus == "INACTIVE") {
        throw new app_error_1.AppError("Account is temporary suspend, contact us on support !!", http_status_1.default.BAD_REQUEST);
    }
    if (isExistAccount.accountStatus == "SUSPENDED") {
        throw new app_error_1.AppError("Account is suspended !!", http_status_1.default.BAD_REQUEST);
    }
    return isExistAccount;
});
exports.isAccountExist = isAccountExist;
