'use strict';

document.addEventListener("DOMContentLoaded", function() {
    var defaults = PayCalculatorDefaults;

    var calcButton = document.getElementById('calc_button');
    calcButton.addEventListener('click', doCalculation);
    
    var clearButton = document.getElementById('clear_button');
    clearButton.addEventListener('click', clear);

    var selectboxes = document.querySelectorAll('select');
    for (var x = 0; x < selectboxes.length; x++) {
        selectboxes[x].addEventListener('change', clearDisplay);
    }

    populateSelectTimes(defaults.rules);

    function doCalculation(e) {
        e.preventDefault();

        clearDisplay();
        clearError();

        var startTime = document.getElementById('start_time').value;
        var bedtime = document.getElementById('bed_time').value;
        var endTime = document.getElementById('end_time').value;

        if (!bedtime || bedtime.length == 0) {
            bedtime = undefined;
        } else {
            bedtime = parseInt(bedtime);
        }
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);

        var calculator = new PayCalculator();
        var result = calculator.calc(startTime, endTime, bedtime);

        if (result.success) {
            setDisplay('$'+result.pay, result.message);
        } else {
            showError(result.message);
        }
    }

    function clear(e) {
        e.preventDefault();
        clearDisplay();
        clearError();
        resetSelects();
    }

    function showError(errorMsg) {
        document.querySelector('.total-content > div.subcaption').style.display = 'none';
        document.querySelector('.total-content > div.error').style.display = 'block';
        document.getElementById('total_err').innerHTML = errorMsg;
    }

    function clearError() {
        document.querySelector('.total-content > div.subcaption').style.display = '';
        document.querySelector('.total-content > div.error').style.display = '';
        document.getElementById('total_err').innerHTML = '';
    }

    function setDisplay(pay, description) {
        clearError();
        var total = document.getElementById('total');
        var desc  = document.getElementById('total_desc');
        total.innerHTML = pay;
        desc.innerHTML = description;
    }

    function clearDisplay() {
        var total = document.getElementById('total');
        var desc  = document.getElementById('total_desc');
        total.innerHTML = '';
        desc.innerHTML = '';
    }

    function resetSelects() {
        for (var x=0; x < selectboxes.length; x++) {
            selectboxes[x].selectedIndex = 0;
        }
    }

    function emptySelects() {
        for (var x = 0; x < selectboxes.length; x++) {
            clearSelectOptions(selectboxes[x]);
        }
    }

    function clearSelectOptions(selectbox) {
        while (selectbox.options.length) {
            selectbox.remove(0);
        }
    }

    function populateSelectTimes(rules) {
        emptySelects();

        var start = rules.earliestStartTime;
        var end = rules.latestEndTime < rules.earliestStartTime  ? rules.latestEndTime + 24 : rules.latestEndTime;

        selectboxes[1].options[0] = new Option('None specified', '');

        for (var x = 0; x < selectboxes.length; x++) {
            for (var h = start; h <= end; h++) {
                selectboxes[x].options[selectboxes[x].options.length] = new Option(getDisplayHour(h), h);
            }
        }
    }

    function getDisplayHour(value) {
        var hour = (value >= 24) ? value - 24 : value;
        if (hour === 0) {
            return "12 AM";
        } else if (hour < 12) {
            return hour + " AM";
        } else if (hour === 12) {
            return hour + " PM";
        } else {
            return (hour - 12) + " PM";
        }
    }
});
