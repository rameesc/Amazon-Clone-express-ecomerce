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
exports.removeImageFile = exports.fileRemoved = void 0;
const fs_1 = __importDefault(require("fs"));
const fileRemoved = (files) => {
    return Promise.all(files.map((file) => new Promise((res, rej) => {
        try {
            setTimeout(() => {
                fs_1.default.unlink(file, err => {
                    if (err)
                        console.log(err);
                    res(file);
                });
            }, 10000);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
                rej(err.message);
            }
        }
    })));
};
exports.fileRemoved = fileRemoved;
const removeImageFile = (filename) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filemagePath = `public/uploads/category/${filename}`;
        if (fs_1.default.existsSync(filemagePath)) {
            yield fs_1.default.promises.unlink(filemagePath);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});
exports.removeImageFile = removeImageFile;
