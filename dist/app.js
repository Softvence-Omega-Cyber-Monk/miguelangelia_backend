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
exports.createDefaultSuperAdmin = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const global_error_handler_1 = __importDefault(require("./app/middlewares/global_error_handler"));
const not_found_api_1 = __importDefault(require("./app/middlewares/not_found_api"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_schema_1 = require("./app/modules/user/user.schema");
const configs_1 = require("./app/configs");
// define app
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://miguelangelia-client.vercel.app"],
}));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.raw());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/v1", routes_1.default);
// stating point
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Miguelangelia Server is running successful !!",
        data: null,
    });
});
// Create Default SuperAdmin if not exists
const createDefaultSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingAdmin = yield user_schema_1.User_Model.findOne({
            email: "mdsoyaibsourav11@gmail.com",
        });
        const hashedPassword = yield bcrypt_1.default.hash("admin@123", // Default password for Admin
        Number(configs_1.configs.bcrypt_salt_rounds) // Ensure bcrypt_salt_rounds is correctly pulled from config
        );
        if (!existingAdmin) {
            yield user_schema_1.User_Model.create({
                email: "mdsoyaibsourav11@gmail.com",
                password: hashedPassword,
                confirmPassword: hashedPassword,
                role: "admin",
                accountType: 'personal'
            });
            console.log("✅ Default Admin created.");
        }
        else {
            console.log("ℹ️ SAdmin already exists.");
        }
    }
    catch (error) {
        console.error("❌ Failed to create Default Admin:", error);
    }
});
exports.createDefaultSuperAdmin = createDefaultSuperAdmin;
(0, exports.createDefaultSuperAdmin)();
// global error handler
app.use(global_error_handler_1.default);
app.use(not_found_api_1.default);
// export app
exports.default = app;
