"use strict";
/**
 * Main entry point for the Feature Flag Evaluator
 *
 * This module provides a complete feature flag evaluation system with
 * input validation, rule-based evaluation, and consistent output formatting.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEvaluator = exports.FeatureFlagEvaluator = exports.RuleEngine = exports.InputValidatorImpl = void 0;
// Export all types and interfaces
__exportStar(require("./types"), exports);
// Export configuration constants for external use
__exportStar(require("./config/constants"), exports);
// Export implementation classes
var InputValidator_1 = require("./validation/InputValidator");
Object.defineProperty(exports, "InputValidatorImpl", { enumerable: true, get: function () { return InputValidator_1.InputValidatorImpl; } });
var RuleEngine_1 = require("./engine/RuleEngine");
Object.defineProperty(exports, "RuleEngine", { enumerable: true, get: function () { return RuleEngine_1.RuleEngine; } });
var FeatureFlagEvaluator_1 = require("./FeatureFlagEvaluator");
Object.defineProperty(exports, "FeatureFlagEvaluator", { enumerable: true, get: function () { return FeatureFlagEvaluator_1.FeatureFlagEvaluator; } });
// Create and export a default instance for convenience
const FeatureFlagEvaluator_2 = require("./FeatureFlagEvaluator");
exports.defaultEvaluator = new FeatureFlagEvaluator_2.FeatureFlagEvaluator();
//# sourceMappingURL=index.js.map