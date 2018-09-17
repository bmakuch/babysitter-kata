'use strict';

/**
 * Pay Calculator Defaults
 * @property {object}  rules                     - The default values for parties.
 * @property {number}  rules.earliestStartTime   - The default number of players.
 * @property {number}  rules.latestEndTime       - The default number of players.
 * @property {object}  payRate                   - The default level for the party.
 * @property {number}  payRate.startToBedtime    - The default treasure.
 * @property {number}  payRate.bedTimeToMidnight - How much gold the party starts with.
 * @property {number}  payRate.midnightToEnd     - How much gold the party starts with.
 */
var PayCalculatorDefaults = {
    rules: {
        earliestStartTime: 17, // 5pm in 24 hour time
        latestEndTime: 4       // 4am
    },
    payRate: {
        startToBedtime: 12,
        bedTimeToMidnight: 8,
        midnightToEnd: 16
    }
};

/**
 * PayCalculator class.
 * 
 * @constructor
 * @param {object} config - Any options to override the default settings
 */
function PayCalculator(config) {
    config = config || {};
    this.calcConfig = _extend({}, PayCalculatorDefaults, config);
};

/**
 * Validate the hours provided
 * @param {number} startTime - The start hour (0-23)
 * @param {number} endTime   - The end hour (0-23)
 * @param {number} bedTime   - (optional) Bedtime (0-23)
 * @return {object} success and an error message if unsuccessful
 */
PayCalculator.prototype.validateHours = function(startTime, endTime, bedtime) {
    var success = true;
    var message = '';
    
    if (endTime < startTime) {
        success = false;
        message = 'End time cannot be earler than start time.';
    }

    return {
        success: success,
        message: message
    };
};

/**
 * Calculate the pay give the start, end and bedtime
 * @param {number} startTime - The start hour (0-23)
 * @param {number} endTime   - The end hour (0-23)
 * @param {number} bedTime   - (optional) Bedtime (0-23)
 * @return {object} success, error message, pay amount, and hours
 */
PayCalculator.prototype.calc = function(startTime, endTime, bedtime) {
    var result = {
        success: true,
        message: '',
        pay: 0,
        hours: {}
    };

    // validate the passed in times
    var validationResult = this.validateHours(startTime, endTime, bedtime);
    if (!validationResult.success) {
        result.success = false;
        result.message = validationResult.message;
    } else {
        // calculate the hours for each range
        var hours = this.calcHours(startTime, endTime, bedtime);

        // Calculate the pay
        result.pay = (hours.startToBedtime * this.calcConfig.payRate.startToBedtime) +
                    (hours.bedTimeToMidnight * this.calcConfig.payRate.bedTimeToMidnight) +
                    (hours.midnightToEnd * this.calcConfig.payRate.midnightToEnd);
        
        result.message = hours.startToBedtime + 'h@$' + this.calcConfig.payRate.startToBedtime + ' +  ' + 
                        hours.bedTimeToMidnight + 'h@$' + this.calcConfig.payRate.bedTimeToMidnight + ' + ' + 
                        hours.midnightToEnd + 'h@$' + this.calcConfig.payRate.midnightToEnd;

        result.success = true;
        result.hours = hours;
    }

    return result;
}


/**
 * calculate the hours for each range
 * @param {number} startTime - The start hour
 * @param {number} endTime   - The end hour
 * @param {number} bedTime   - (optional) Bedtime
 * @return {object} success, error message, and the pay amount
 */
PayCalculator.prototype.calcHours = function(startTime, endTime, bedtime) {
    var MIDNIGHT_HOUR = 24;
    var hours = this.normalizeTimeToHours(startTime, endTime, bedtime)

    var startToBedtime = 0;
    var bedTimeToMidnight = 0;
    var midnightToEnd = 0;

    // Hours at the start to bedtime rate
    if (hours.normalizedBedtime <=  hours.normalizedStartTime) {
        startToBedtime = 0;
    } else if (hours.normalizedEndTime < hours.normalizedBedtime) {
        startToBedtime = hours.normalizedEndTime - hours.normalizedStartTime;
    } else {
        startToBedtime = hours.normalizedBedtime - hours.normalizedStartTime;
    }

    // Hours at the bedtime to midnight rate
    if (hours.normalizedBedtime >= MIDNIGHT_HOUR) {
        bedTimeToMidnight = 0;
    } else if (hours.normalizedEndTime <= hours.normalizedBedtime) {
        bedTimeToMidnight = 0;
    } else {
        if (hours.normalizedBedtime <=  hours.normalizedStartTime) {
            if (hours.normalizedEndTime < MIDNIGHT_HOUR) {
                bedTimeToMidnight = hours.normalizedEndTime - hours.normalizedStartTime;
            } else {
                bedTimeToMidnight = MIDNIGHT_HOUR - hours.normalizedStartTime;
            }
        } else {
            if (hours.normalizedEndTime < MIDNIGHT_HOUR) {
                bedTimeToMidnight = hours.normalizedEndTime - hours.normalizedBedtime;
            } else {
                bedTimeToMidnight = MIDNIGHT_HOUR - hours.normalizedBedtime;
            }
        }
    }

    // Hours at the midnight to end rate
    if (hours.normalizedEndTime <= MIDNIGHT_HOUR) {
        midnightToEnd = 0;
    } else if (hours.normalizedStartTime > MIDNIGHT_HOUR) {
        midnightToEnd = hours.normalizedEndTime - hours.normalizedStartTime;
    } else {
        midnightToEnd = hours.normalizedEndTime - MIDNIGHT_HOUR;
    }

    return {
        startToBedtime: startToBedtime,
        bedTimeToMidnight: bedTimeToMidnight,
        midnightToEnd: midnightToEnd
    };
}

/**
 * Normalize the hour-based times. After midnight the following day will be n+24
 * @param {number} startTime - The start hour (0-23)
 * @param {number} endTime   - The end hour (0-23)
 * @param {number} bedTime   - (optional) Bedtime (0-23)
 * @return {object} success, error message, and the pay amount
 */
PayCalculator.prototype.normalizeTimeToHours = function(startTime, endTime, bedtime) {
    if (!bedtime) {
        bedtime = 0;
    }

    return {
        normalizedStartTime: startTime,
        normalizedEndTime: endTime < this.calcConfig.rules.earliestStartTime ? endTime + 24 : endTime,
        normalizedBedtime: bedtime < this.calcConfig.rules.earliestStartTime ? bedtime + 24 : bedtime
    };
}

function _extend(output) {
    output = output || {};
    
    // loop through the passed in arguments 
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        if (!obj) {
            continue;
        }    
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object') {
                    output[key] = _extend(output[key], obj[key]);
                } else {
                    output[key] = obj[key];
                }
            }
        }
    }    
    return output;
};




