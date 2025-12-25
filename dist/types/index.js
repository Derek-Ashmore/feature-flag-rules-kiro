"use strict";
/**
 * Core interfaces for the Feature Flag Evaluator
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationError = void 0;
/**
 * Enumeration of possible evaluation errors
 */
var EvaluationError;
(function (EvaluationError) {
    EvaluationError["MISSING_CONTEXT"] = "Missing or null user context";
    EvaluationError["INVALID_USER_ID"] = "Invalid or empty userId";
    EvaluationError["UNSUPPORTED_REGION"] = "Unsupported region";
    EvaluationError["UNSUPPORTED_PLAN"] = "Unsupported plan";
    EvaluationError["VALIDATION_FAILED"] = "Input validation failed";
})(EvaluationError || (exports.EvaluationError = EvaluationError = {}));
//# sourceMappingURL=index.js.map