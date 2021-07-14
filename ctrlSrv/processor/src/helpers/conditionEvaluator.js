import { appLog } from "./logger.js"

class ConditionResult {
    constructor(success, error) {
        this.success = success
        this.error = error
    }
}

class ConditionCallable {
    callResult(conditionEvent, result) {
        appLog("Dummy callResult")
    }
}

class ConditionEvent {
    constructor(conditionEvaluator) {
        this.conditionEvaluator = conditionEvaluator
        this.conditionEvaluator.addCondition(this)
    }

    triggerSuccess(message) {
        if (message == null) {
            message = ""
        }
        let result = new ConditionResult(message, null)
        this.conditionEvaluator.callResult(this, result)
    }

    triggerError(error) {
        if (error == null) {
            error = ""
        }
        let result = ConditionResult(null, error)
        this.conditionEvaluator.callResult(this, result)
    }
}

class ConditionEvaluator extends ConditionCallable { 
    constructor(callback) {
        super()
        this.conditionMap = new Map()
        this.callback = callback
        this.wasTriggered = false
    }

    addCondition(condition) {
        this.conditionMap.set(condition, null)
    }

    callResult(self, result) {
        if (this.wasTriggered) {
            //skip if already triggered
            return
        }

        //Just one error triggers result
        if (result.error != null) {
            this.wasTriggered = true
            callback(null, result.error)
            return
        }
        
        //All successes are required to trigger
        if (this.conditionMap.has(self)){
            this.conditionMap.set(self, result)
        }

        let mustTrigger = true
        let successResultList = []
        this.conditionMap.forEach((stCondition, stEvent) => {
            let oneTrigger = stCondition != null && stCondition.success != null
            mustTrigger = mustTrigger && oneTrigger
            if (oneTrigger) {
                successResultList.push(stCondition.success)
            }
        });
        if (mustTrigger) {
            this.callback(successResultList, null)
        }
    }

    reset() {
        //@TODO:
    }
}

export { ConditionEvent, ConditionEvaluator }