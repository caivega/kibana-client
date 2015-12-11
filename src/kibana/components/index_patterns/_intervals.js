define(function (require) {
  return function IndexNameIntervalsService(timefilter) {
    var _ = require('lodash');
    var moment = require('moment');
    var IndexedArray = require('utils/indexed_array/index');

    var intervals = new IndexedArray({
      index: ['name'],
      initialSet: [
        {
          name: 'hours',
          startOf: 'hour',
          display: '每小时'
        },
        {
          name: 'days',
          startOf: 'day',
          display: '每天'
        },
        {
          name: 'weeks',
          startOf: 'isoWeek',
          display: '每周'
        },
        {
          name: 'months',
          startOf: 'month',
          display: '每月'
        },
        {
          name: 'years',
          startOf: 'year',
          display: '每年'
        }
      ]
    });

    intervals.toIndexList = function (format, interval, a, b) {
      var bounds;

      // setup the range that the list will span, return two moment objects that
      // are in proper order. a and b can be numbers to specify to go before or after now (respectively)
      // a certain number of times, based on the interval
      var range = [[a, 'min', 'startOf'], [b, 'max', 'startOf']].map(function (v) {
        var val = v[0];
        var bound = v[1];
        var extend = v[2];

        // grab a bound from the time filter
        if (val == null) {
          bounds = bounds || timefilter.getBounds();
          val = bounds[bound];
        }

        if (_.isNumeric(val)) val = moment().add(val, interval.name);
        else if (!moment.isMoment(val)) val = moment(val);

        return val.clone().utc()[extend](interval.startOf);
      }).sort(function (a, b) {
        return a - b;
      });

      if (typeof interval === 'string') {
        interval = _.find(intervals, { name: interval });
        if (!interval) throw new Error('Interval must be one of ' + _.pluck(intervals, 'name'));
      }

      var indexList = [];
      var start = range.shift();
      // turn stop into milliseconds to that it's not constantly converted by the while condition
      var stop = range.shift().valueOf();

      while (start <= stop) {
        indexList.push(start.format(format));
        start.add(1, interval.name);
      }
      return indexList;
    };

    return intervals;
  };
});