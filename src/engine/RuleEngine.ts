/**
 * Rule Engine for Feature Flag Evaluator
 *
 * This component is responsible for evaluating static rules against user context
 * and determining which features should be enabled based on matching conditions.
 */

import {
  RuleEngine as IRuleEngine,
  UserContext,
  FeatureRule,
  RuleCondition,
} from '../types';
import { FEATURE_RULES } from '../config/constants';

/**
 * Implementation of the rule engine that evaluates feature rules
 * against user context to determine enabled features.
 */
export class RuleEngine implements IRuleEngine {
  private readonly rules: FeatureRule[];

  constructor(rules: FeatureRule[] = FEATURE_RULES) {
    this.rules = rules;
  }

  /**
   * Evaluates all rules against the provided user context and returns
   * the union of features from all matching rules.
   *
   * @param context - The user context to evaluate rules against
   * @returns Array of feature identifiers that should be enabled
   */
  evaluateRules(context: UserContext): string[] {
    const enabledFeatures = new Set<string>();

    // Evaluate each rule and collect features from matching rules
    for (const rule of this.rules) {
      if (this.ruleMatches(rule, context)) {
        // Add all features from this rule to the set
        rule.features.forEach(feature => enabledFeatures.add(feature));
      }
    }

    // Return sorted array of unique features
    return Array.from(enabledFeatures).sort();
  }

  /**
   * Determines if a rule matches the given user context by checking
   * if all conditions in the rule are satisfied.
   *
   * @param rule - The rule to evaluate
   * @param context - The user context to check against
   * @returns true if all conditions match, false otherwise
   */
  private ruleMatches(rule: FeatureRule, context: UserContext): boolean {
    return rule.conditions.every(condition =>
      this.conditionMatches(condition, context)
    );
  }

  /**
   * Evaluates a single condition against the user context.
   *
   * @param condition - The condition to evaluate
   * @param context - The user context to check against
   * @returns true if the condition matches, false otherwise
   */
  private conditionMatches(
    condition: RuleCondition,
    context: UserContext
  ): boolean {
    const contextValue = this.getContextValue(condition.attribute, context);

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;

      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(contextValue);
        }
        // If value is not an array but operator is 'in', treat as single value
        return contextValue === condition.value;

      default:
        return false;
    }
  }

  /**
   * Extracts the appropriate value from the user context based on the attribute name.
   *
   * @param attribute - The attribute name to extract
   * @param context - The user context
   * @returns The value of the specified attribute
   */
  private getContextValue(
    attribute: RuleCondition['attribute'],
    context: UserContext
  ): string {
    switch (attribute) {
      case 'userId':
        return context.userId;
      case 'region':
        return context.region;
      case 'plan':
        return context.plan;
      default:
        return '';
    }
  }
}
