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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatingInfo = void 0;
const Review_1 = require("../../models/Review");
const getRatingInfo = (product, newStar) => __awaiter(void 0, void 0, void 0, function* () {
    let stars = yield Review_1.Review.find({ product: product._id }).select("star");
    let fiveStars = 0;
    let fourStars = 0;
    let threeStars = 0;
    let twoStars = 0;
    let oneStars = 0;
    stars.forEach((s) => {
        if (s.star == 5)
            fiveStars += 1;
        if (s.star == 4)
            fourStars += 1;
        if (s.star == 3)
            threeStars += 1;
        if (s.star == 2)
            twoStars += 1;
        if (s.star == 1)
            oneStars += 1;
    });
    if (newStar == 5)
        fiveStars += 1;
    if (newStar == 4)
        fourStars += 1;
    if (newStar == 3)
        threeStars += 1;
    if (newStar == 2)
        twoStars += 1;
    if (newStar == 1)
        oneStars += 1;
    let totalRatingUser = (fiveStars + fourStars + threeStars + twoStars + oneStars);
    let averageStar = (5 * fiveStars + 4 * fourStars + 3 * threeStars + 2 * twoStars + oneStars);
    return {
        fiveStars,
        fourStars,
        threeStars,
        twoStars,
        oneStars,
        averageStar,
        totalRatingUser
    };
});
exports.getRatingInfo = getRatingInfo;
