var assert = require('assert');

var fs = require('fs');
var path = require('path');
var vm = require('vm');

const appDirectory = fs.realpathSync(process.cwd());
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);

var jsPath = 'src/js/PayCalculator.js';
var code = fs.readFileSync(resolveAppPath(jsPath));


vm.runInThisContext(code);

describe('BabySitterPayCalculator', function() {

    var calculator = new PayCalculator();
  
    describe('#validateHours()', () => {
      it('should be successful when start time is before end time', () => {
        var result = calculator.validateHours(17, 18);
        assert.equal(result.success, true);
      });

      it('should be successful when start time is equal to end time', () => {
        var result = calculator.validateHours(18, 18);
        assert.equal(result.success, true);
      });

      it('should be unsuccessful when end time is earlier than start time', () => {
        var result = calculator.validateHours(18, 17);
        assert.equal(result.success, false);
      });
    });
  
    describe('#calcHours()', () => {
      it('should have 0 startToBedtime hours when betime earler than start', () => {
        var result = calculator.calcHours(18, 23, 17);
        assert.equal(result.startToBedtime, 0);
      });
      it('should have 0 bedTimeToMidnight hours when betime is undefined', () => {
        var result = calculator.calcHours(18, 23, undefined);
        assert.equal(result.bedTimeToMidnight, 0);
      });
      it('should have 0 midnightToEnd hours when endTime is before midnight', () => {
        var result = calculator.calcHours(18, 23, undefined);
        assert.equal(result.midnightToEnd, 0);
      });
    });
  
    describe('#calc()', () => {
      it('should return pay=0 when start, end and bedtime are all the same', () => {
        var result = calculator.calc(17,17,17);
        assert.equal(result.pay, 0);
      });

      it('should return pay=12 when start to end is one hour', () => {
        var result = calculator.calc(17,18,18);
        assert.equal(result.pay, 12);
      });

      it('should return pay=20 when start to bedtime and bedtime to end are each one hour', () => {
        var result = calculator.calc(17,19,18);
        assert.equal(result.pay, 20);
      });
      it('should return pay=108 when start to bedtime and bedtime midnight and midnight to end are each three hours', () => {
        var result = calculator.calc(18,3,21);
        assert.equal(result.pay, (3*12)+(3*8)+(3*16));
      });
    });
   
  });
