/*
 * jQuery-Simple-Timer
 *
 * Creates a countdown timer.
 *
 * Example:
 *   $('.timer').startTimer();
 *
 */

(function (factory) {
    // Using as a CommonJS module
    if (typeof module === "object" && typeof module.exports === "object") {
        // jQuery must be provided as argument when used
        // as a CommonJS module.
        //
        // For example:
        //   let $ = require("jquery");
        //   require("jquery-simple-timer")($);
        module.exports = function (jq) {
            factory(jq, window, document);
        }
    } else {
        // Using as script tag
        //
        // For example:
        //   <script src="jquery.simple.timer.js"></script>
        factory(jQuery, window, document);
    }
}(function ($, window, document, undefined) {

    var timer;

    var Timer = function (targetElement) {
        this._options = {};
        this.targetElement = targetElement;
        return this;
    };

    Timer.start = function (userOptions, targetElement) {
        timer = new Timer(targetElement);
        mergeOptions(timer, userOptions);
        return timer.start(userOptions);
    };

    // Writes to `this._options` object so that other
    // functions can access it without having to
    // pass this object as argument multiple times.
    function mergeOptions(timer, opts) {
        opts = opts || {};
        var classNames = opts.classNames || {};

        timer._options.classNameSeconds = classNames.seconds || 'green'
            , timer._options.classNameMinutes = classNames.minutes || 'blue'
            , timer._options.classNameHours = classNames.hours || 'red'
            , timer._options.classNameClearDiv = classNames.clearDiv || 'jst-clearDiv'
            , timer._options.classNameTimeout = classNames.timeout || 'jst-timeout';
    }

    Timer.prototype.start = function (options) {

        var that = this;

        var active = "active";
        var before = "before";


        var createSubDivs = function (timerBoxElement) {
            var seconds = document.createElement('div');
            seconds.className = that._options.classNameSeconds;
            var secondsSpan = document.createElement('span');
            secondsSpan.className = active;
            var secondsSpan2 = document.createElement('span');

            seconds.append(secondsSpan);
            seconds.append(secondsSpan2);

            var minutes = document.createElement('div');
            minutes.className = that._options.classNameMinutes;
            var minutesSpan = document.createElement('span');
            minutesSpan.className = active;
            var minutesSpan2 = document.createElement('span');

            minutes.append(minutesSpan);
            minutes.append(minutesSpan2);

            var hours = document.createElement('div');
            hours.className = that._options.classNameHours;
            var hoursSpan = document.createElement('span');
            hoursSpan.className = active;
            var hoursSpan2 = document.createElement('span');

            hours.append(hoursSpan);
            hours.append(hoursSpan2);

            var clearDiv = document.createElement('div');
            clearDiv.className = that._options.classNameClearDiv;


            return timerBoxElement.append(hours).append(minutes).append(seconds);
            // append(clearDiv);
        };

        this.targetElement.each(function (_index, timerBox) {
            var that = this;
            var timerBoxElement = $(timerBox);
            var cssClassSnapshot = timerBoxElement.attr('class');

            timerBoxElement.on('complete', function () {
                clearInterval(timerBoxElement.intervalId);
            });

            timerBoxElement.on('complete', function () {
                timerBoxElement.onComplete(timerBoxElement);
            });

            timerBoxElement.on('complete', function () {
                timerBoxElement.addClass(that._options.classNameTimeout);
            });

            timerBoxElement.on('complete', function () {
                if (options && options.loop === true) {
                    timer.resetTimer(timerBoxElement, options, cssClassSnapshot);
                }
            });

            timerBoxElement.on('pause', function () {
                clearInterval(timerBoxElement.intervalId);
                timerBoxElement.paused = true;
            });

            timerBoxElement.on('resume', function () {
                timerBoxElement.paused = false;
                that.startCountdown(timerBoxElement, {secondsLeft: timerBoxElement.data('timeLeft')});
            });

            createSubDivs(timerBoxElement);
            return this.startCountdown(timerBoxElement, options);
        }.bind(this));
    };

    /**
     * Resets timer and add css class 'loop' to indicate the timer is in a loop.
     * $timerBox {jQuery object} - The timer element
     * options {object} - The options for the timer
     * css - The original css of the element
     */
    Timer.prototype.resetTimer = function ($timerBox, options, css) {
        var interval = 0;
        if (options.loopInterval) {
            interval = parseInt(options.loopInterval, 10) * 1000;
        }
        setTimeout(function () {
            $timerBox.trigger('reset');
            $timerBox.attr('class', css + ' loop');
            timer.startCountdown($timerBox, options);
        }, interval);
    }

    Timer.prototype.fetchSecondsLeft = function (element) {
        var secondsLeft = element.data('seconds-left');
        var minutesLeft = element.data('minutes-left');

        if (Number.isFinite(secondsLeft)) {
            return parseInt(secondsLeft, 10);
        } else if (Number.isFinite(minutesLeft)) {
            return parseFloat(minutesLeft) * 60;
        } else {
            throw 'Missing time data';
        }
    };

    Timer.prototype.startCountdown = function (element, options) {
        options = options || {};

        var intervalId = null;
        var defaultComplete = function () {
            clearInterval(intervalId);
            return this.clearTimer(element);
        }.bind(this);

        element.onComplete = options.onComplete || defaultComplete;
        element.allowPause = options.allowPause || false;
        if (element.allowPause) {
            element.on('click', function () {
                if (element.paused) {
                    element.trigger('resume');
                } else {
                    element.trigger('pause');
                }
            });
        }
        if (!options.zeroDate) {
            var secondsLeft = options.secondsLeft || this.fetchSecondsLeft(element);

            var refreshRate = options.refreshRate || 1000;
            var endTime = secondsLeft + this.currentTime();
            var timeLeft = endTime - this.currentTime();

            this.setFinalValue(this.formatTimeLeft(timeLeft), element);

            intervalId = setInterval((function () {
                timeLeft = endTime - this.currentTime();
                // When timer has been idle and only resumed past timeout,
                // then we immediatelly complete the timer.
                if (timeLeft < 0) {
                    timeLeft = 0;
                }
                element.data('timeLeft', timeLeft);
                this.setFinalValue(this.formatTimeLeft(timeLeft), element);
            }.bind(this)), refreshRate);
        }
        else {
            var dhm = function dhm(t) {
                var cd = 24 * 60 * 60 * 1000,
                    ch = 60 * 60 * 1000,
                    d = Math.floor(t / cd),
                    h = Math.floor((t - d * cd) / ch),
                    m = Math.round((t - d * cd - h * ch) / 60000),
                    pad = function (n) {
                        return n < 10 ? '0' + n : n;
                    };
                if (m === 60) {
                    h++;
                    m = 0;
                }
                if (h === 24) {
                    d++;
                    h = 0;
                }
                // return [d, pad(h), pad(m)].join(':');
                return [d, pad(h), pad(m)];
                // console.log( dhm( 3 * 24 * 60 * 60 * 1000 ) );
            }

            var refreshRate = options.refreshRate || 1000 * 10;

            var zeroDateTime = new Date(options.zeroDate);

            var timeLeft = zeroDateTime.getTime() / 1000 - this.currentTime();
            // var testDate = new Date(timeLeft);
            // var testDate2  = new Date(timeLeft+this.currentTime());

            var dates = dhm(timeLeft * 1000);

            this.setFinalValue(dhm(timeLeft * 1000), element);

            intervalId = setInterval((function () {
                var timeLeft = zeroDateTime.getTime() / 1000 - this.currentTime();

                // When timer has been idle and only resumed past timeout,
                // then we immediatelly complete the timer.
                if (timeLeft < 0) {
                    timeLeft = 0;
                }
                element.data('timeLeft', timeLeft);
                this.setFinalValue(dhm(timeLeft * 1000), element);
            }.bind(this)), refreshRate);
        }

        element.intervalId = intervalId;
    };

    Timer.prototype.clearTimer = function (element) {
        element.find('.jst-seconds').text('00');
        element.find('.jst-minutes').text('00:');
        element.find('.jst-hours').text('00:');
    };

    Timer.prototype.currentTime = function () {
        return Math.round((new Date()).getTime() / 1000);
    };

    Timer.prototype.formatTimeLeft = function (timeLeft) {

        var lpad = function (n, width) {
            width = width || 2;
            n = n + '';

            var padded = null;

            if (n.length >= width) {
                padded = n;
            } else {
                padded = Array(width - n.length + 1).join(0) + n;
            }

            return padded;
        };

        var hours = Math.floor(timeLeft / 3600);
        timeLeft -= hours * 3600;

        var minutes = Math.floor(timeLeft / 60);
        timeLeft -= minutes * 60;

        var seconds = parseInt(timeLeft % 60, 10);

        if (+hours === 0 && +minutes === 0 && +seconds === 0) {
            return [];
        } else {
            return [lpad(hours), lpad(minutes), lpad(seconds)];
        }
    };

    Timer.prototype.setFinalValue = function (finalValues, element) {

        if (finalValues.length === 0) {
            this.clearTimer(element);
            element.trigger('complete');
            return false;
        }
        var active = 'active';
        var before = 'before';

        var activeSpansArray = [];

        activeSpansArray[0] = element.find('.' + this._options.classNameHours + ' span.active');
        activeSpansArray[1] = element.find('.' + this._options.classNameMinutes + ' span.active');
        activeSpansArray[2] = element.find('.' + this._options.classNameSeconds + ' span.active');



        for (var i = 0; i < finalValues.length; i++) {
          if( finalValues[i] != activeSpansArray[i][0].innerHTML){

                  var activeSpan = activeSpansArray[i];

                  if(activeSpan.is(":last-child")) {

                      var beforeSpan = activeSpan.prev();
                      beforeSpan.addClass(active).removeClass(before).text(finalValues[i]);
                      activeSpan.addClass(before).removeClass(active);
                  }
                  else {
                      activeSpan
                          .addClass(before)
                          .removeClass(active)
                          .next("span")
                          .addClass(active)
                          .removeClass(before)
                          .text(finalValues[i]);
                  }
          }
        }
    };





    $.fn.startTimer = function (options) {
        this.TimerObject = Timer;
        Timer.start(options, this);
        return this;
    };

}));
