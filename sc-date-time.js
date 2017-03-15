(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'angular'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('angular'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.angular);
    global.main = mod.exports;
  }
})(this, function (exports, _angular) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _angular2 = _interopRequireDefault(_angular);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var MODULE_NAME = 'scDateTime';

  exports.default = MODULE_NAME;


  _angular2.default.module(MODULE_NAME, []).value('scDateTimeConfig', {
    defaultTheme: 'material',
    autosave: false,
    defaultMode: 'date',
    defaultDate: undefined, // should be date object!!
    displayMode: undefined,
    defaultOrientation: false,
    displayTwentyfour: false,
    compact: false
  }).value('scDateTimeI18n', {
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
    incrementHours: 'Increment Hours',
    decrementHours: 'Decrement Hours',
    incrementMinutes: 'Increment Minutes',
    decrementMinutes: 'Decrement Minutes',
    switchAmPm: 'Switch AM/PM',
    now: 'Now',
    cancel: 'Cancel',
    save: 'Save',
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    switchTo: 'Switch to',
    clock: 'Clock',
    calendar: 'Calendar'
  }).directive('timeDatePicker', ['$filter', '$sce', '$rootScope', '$parse', 'scDateTimeI18n', 'scDateTimeConfig', function ($filter, $sce, $rootScope, $parse, scDateTimeI18n, scDateTimeConfig) {
    var _dateFilter = $filter('date');
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        _weekdays: '=?tdWeekdays'
      },
      require: 'ngModel',
      templateUrl: function templateUrl(tElement, tAttrs) {
        if (tAttrs.theme == null || tAttrs.theme === '') {
          tAttrs.theme = scDateTimeConfig.defaultTheme;
        }

        return tAttrs.theme.indexOf('/') <= 0 ? 'scDateTime-' + tAttrs.theme + '.tpl' : tAttrs.theme;
      },
      link: function link(scope, element, attrs, ngModel) {
        attrs.$observe('defaultMode', function (val) {
          if (val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.defaultMode;
          }

          return scope._mode = val;
        });
        attrs.$observe('defaultDate', function (val) {
          return scope._defaultDate = val != null && Date.parse(val) ? Date.parse(val) : scDateTimeConfig.defaultDate;
        });
        attrs.$observe('displayMode', function (val) {
          if (val !== 'full' && val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.displayMode;
          }

          return scope._displayMode = val;
        });
        attrs.$observe('orientation', function (val) {
          return scope._verticalMode = val != null ? val === 'true' : scDateTimeConfig.defaultOrientation;
        });
        attrs.$observe('compact', function (val) {
          return scope._compact = val != null ? val === 'true' : scDateTimeConfig.compact;
        });
        attrs.$observe('displayTwentyfour', function (val) {
          return scope._hours24 = val != null ? val : scDateTimeConfig.displayTwentyfour;
        });
        attrs.$observe('mindate', function (val) {
          if (val != null && Date.parse(val)) {
            scope.restrictions.mindate = new Date(val);
            return scope.restrictions.mindate.setHours(0, 0, 0, 0);
          }
        });
        attrs.$observe('maxdate', function (val) {
          if (val != null && Date.parse(val)) {
            scope.restrictions.maxdate = new Date(val);
            return scope.restrictions.maxdate.setHours(23, 59, 59, 999);
          }
        });
        scope._weekdays = scope._weekdays || scDateTimeI18n.weekdays;
        scope.$watch('_weekdays', function (value) {
          if (value == null || !_angular2.default.isArray(value)) {
            return scope._weekdays = scDateTimeI18n.weekdays;
          }
        });

        ngModel.$render = function () {
          return scope.setDate(ngModel.$modelValue != null ? ngModel.$modelValue : scope._defaultDate, ngModel.$modelValue != null);
        };

        // Select contents of inputs when foccussed into
        _angular2.default.forEach(element.find('input'), function (input) {
          return _angular2.default.element(input).on('focus', function () {
            return setTimeout(function () {
              return input.select();
            }, 10);
          });
        });

        scope.autosave = false;
        if (attrs.autosave != null || scDateTimeConfig.autosave) {
          scope.saveUpdateDate = function () {
            return ngModel.$setViewValue(scope.date);
          };
          return scope.autosave = true;
        }

        var saveFn = $parse(attrs.onSave);
        var cancelFn = $parse(attrs.onCancel);
        scope.saveUpdateDate = function () {
          return true;
        };

        scope.save = function () {
          ngModel.$setViewValue(new Date(scope.date));
          return saveFn(scope.$parent, { $value: new Date(scope.date) });
        };

        return scope.cancel = function () {
          cancelFn(scope.$parent, {});
          return ngModel.$render();
        };
      },


      controller: ['$scope', 'scDateTimeI18n', function (scope, scDateTimeI18n) {
        var i = void 0;
        scope._defaultDate = scDateTimeConfig.defaultDate;
        scope._mode = scDateTimeConfig.defaultMode;
        scope._displayMode = scDateTimeConfig.displayMode;
        scope._verticalMode = scDateTimeConfig.defaultOrientation;
        scope._hours24 = scDateTimeConfig.displayTwentyfour;
        scope._compact = scDateTimeConfig.compact;
        scope.translations = scDateTimeI18n;
        scope.restrictions = {
          mindate: undefined,
          maxdate: undefined
        };

        scope.addZero = function (min) {
          if (min > 9) {
            return min.toString();
          }return ('0' + min).slice(-2);
        };

        scope.setDate = function (newVal, save) {
          if (save == null) {
            save = true;
          }

          scope.date = newVal ? new Date(newVal) : new Date();
          scope.calendar._year = scope.date.getFullYear();
          scope.calendar._month = scope.date.getMonth();
          scope.clock._minutes = scope.addZero(scope.date.getMinutes());
          scope.clock._hours = scope._hours24 ? scope.date.getHours() : scope.date.getHours() % 12;
          if (!scope._hours24 && scope.clock._hours === 0) {
            scope.clock._hours = 12;
          }

          return scope.calendar.yearChange(save);
        };

        scope.display = {
          fullTitle: function fullTitle() {
            var _timeString = scope._hours24 ? 'HH:mm' : 'h:mm a';
            if (scope._displayMode === 'full' && !scope._verticalMode) {
              return _dateFilter(scope.date, 'EEEE d MMMM yyyy, ' + _timeString);
            } else if (scope._displayMode === 'time') {
              return _dateFilter(scope.date, _timeString);
            } else if (scope._displayMode === 'date') {
              return _dateFilter(scope.date, 'EEE d MMM yyyy');
            }return _dateFilter(scope.date, 'd MMM yyyy, ' + _timeString);
          },
          title: function title() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, scope._displayMode === 'date' ? 'EEEE' : 'EEEE ' + (scope._hours24 ? 'HH:mm' : 'h:mm a'));
            }return _dateFilter(scope.date, 'MMMM d yyyy');
          },
          super: function _super() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, 'MMM');
            }return '';
          },
          main: function main() {
            return $sce.trustAsHtml(scope._mode === 'date' ? _dateFilter(scope.date, 'd') : scope._hours24 ? _dateFilter(scope.date, 'HH:mm') : _dateFilter(scope.date, 'h:mm') + '<small>' + _dateFilter(scope.date, 'a') + '</small>');
          },
          sub: function sub() {
            if (scope._mode === 'date') {
              return _dateFilter(scope.date, 'yyyy');
            }return _dateFilter(scope.date, 'HH:mm');
          }
        };

        scope.calendar = {
          _month: 0,
          _year: 0,
          _months: [],
          _allMonths: function () {
            var result = [];
            for (i = 0; i <= 11; i++) {
              result.push(_dateFilter(new Date(0, i), 'MMMM'));
            }

            return result;
          }(),
          offsetMargin: function offsetMargin() {
            return new Date(this._year, this._month).getDay() * 2.7 + 'rem';
          },
          isVisible: function isVisible(d) {
            return new Date(this._year, this._month, d).getMonth() === this._month;
          },
          isDisabled: function isDisabled(d) {
            var currentDate = new Date(this._year, this._month, d);
            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            return mindate != null && currentDate < mindate || maxdate != null && currentDate > maxdate;
          },
          isPrevMonthButtonHidden: function isPrevMonthButtonHidden() {
            var date = scope.restrictions.mindate;
            return date != null && this._month <= date.getMonth() && this._year <= date.getFullYear();
          },
          isNextMonthButtonHidden: function isNextMonthButtonHidden() {
            var date = scope.restrictions.maxdate;
            return date != null && this._month >= date.getMonth() && this._year >= date.getFullYear();
          },
          class: function _class(d) {
            var classString = '';
            if (scope.date != null && new Date(this._year, this._month, d).getTime() === new Date(scope.date.getTime()).setHours(0, 0, 0, 0)) {
              classString += 'selected';
            }

            if (new Date(this._year, this._month, d).getTime() === new Date().setHours(0, 0, 0, 0)) {
              classString += ' today';
            }

            return classString;
          },
          select: function select(d) {
            scope.date.setFullYear(this._year, this._month, d);
            return scope.saveUpdateDate();
          },
          monthChange: function monthChange(save) {
            if (save == null) {
              save = true;
            }

            if (this._year == null || isNaN(this._year)) {
              this._year = new Date().getFullYear();
            }

            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            if (mindate != null && mindate.getFullYear() === this._year && mindate.getMonth() >= this._month) {
              this._month = Math.max(mindate.getMonth(), this._month);
            }

            if (maxdate != null && maxdate.getFullYear() === this._year && maxdate.getMonth() <= this._month) {
              this._month = Math.min(maxdate.getMonth(), this._month);
            }

            scope.date.setFullYear(this._year, this._month);
            if (scope.date.getMonth() !== this._month) {
              scope.date.setDate(0);
            }

            if (mindate != null && scope.date < mindate) {
              scope.date.setDate(mindate.getTime());
              scope.calendar.select(mindate.getDate());
            }

            if (maxdate != null && scope.date > maxdate) {
              scope.date.setDate(maxdate.getTime());
              scope.calendar.select(maxdate.getDate());
            }

            if (save) {
              return scope.saveUpdateDate();
            }
          },
          _incMonth: function _incMonth(months) {
            this._month += months;
            while (this._month < 0 || this._month > 11) {
              if (this._month < 0) {
                this._month += 12;
                this._year--;
              } else {
                this._month -= 12;
                this._year++;
              }
            }

            return this.monthChange();
          },
          yearChange: function yearChange(save) {
            if (save == null) {
              save = true;
            }

            if (scope.calendar._year == null || scope.calendar._year === '') {
              return;
            }

            var mindate = scope.restrictions.mindate;
            var maxdate = scope.restrictions.maxdate;

            i = mindate != null && mindate.getFullYear() === scope.calendar._year ? mindate.getMonth() : 0;
            var len = maxdate != null && maxdate.getFullYear() === scope.calendar._year ? maxdate.getMonth() : 11;
            scope.calendar._months = scope.calendar._allMonths.slice(i, len + 1);
            return scope.calendar.monthChange(save);
          }
        };
        scope.clock = {
          _minutes: '00',
          _hours: 0,
          _incHours: function _incHours(inc) {
            this._hours = scope._hours24 ? Math.max(0, Math.min(23, this._hours + inc)) : Math.max(1, Math.min(12, this._hours + inc));
            if (isNaN(this._hours)) {
              return this._hours = 0;
            }
          },
          _incMinutes: function _incMinutes(inc) {
            return this._minutes = scope.addZero(Math.max(0, Math.min(59, parseInt(this._minutes) + inc))).toString();
          },
          setAM: function setAM(b) {
            if (b == null) {
              b = !this.isAM();
            }

            if (b && !this.isAM()) {
              scope.date.setHours(scope.date.getHours() - 12);
            } else if (!b && this.isAM()) {
              scope.date.setHours(scope.date.getHours() + 12);
            }

            return scope.saveUpdateDate();
          },
          isAM: function isAM() {
            return scope.date.getHours() < 12;
          }
        };
        scope.$watch('clock._minutes', function (val, oldVal) {
          if (!val) {
            return;
          }

          var intMin = parseInt(val);
          if (!isNaN(intMin) && intMin >= 0 && intMin <= 59 && intMin !== scope.date.getMinutes()) {
            scope.date.setMinutes(intMin);
            return scope.saveUpdateDate();
          }
        });
        scope.$watch('clock._hours', function (val) {
          if (val != null && !isNaN(val)) {
            if (!scope._hours24) {
              if (val === 24) {
                val = 12;
              } else if (val === 12) {
                val = 0;
              } else if (!scope.clock.isAM()) {
                val += 12;
              }
            }

            if (val !== scope.date.getHours()) {
              scope.date.setHours(val);
              return scope.saveUpdateDate();
            }
          }
        });

        scope.setNow = function () {
          scope.setDate();
          return scope.saveUpdateDate();
        };

        scope.modeClass = function () {
          if (scope._displayMode != null) {
            scope._mode = scope._displayMode;
          }

          return '' + (scope._verticalMode ? 'vertical ' : '') + (scope._displayMode === 'full' ? 'full-mode' : scope._displayMode === 'time' ? 'time-only' : scope._displayMode === 'date' ? 'date-only' : scope._mode === 'date' ? 'date-mode' : 'time-mode') + ' ' + (scope._compact ? 'compact' : '');
        };

        scope.modeSwitch = function () {
          return scope._mode = scope._displayMode != null ? scope._displayMode : scope._mode === 'date' ? 'time' : 'date';
        };
        return scope.modeSwitchText = function () {
          return scDateTimeI18n.switchTo + ' ' + (scope._mode === 'date' ? scDateTimeI18n.clock : scDateTimeI18n.calendar);
        };
      }]
    };
  }]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiTU9EVUxFX05BTUUiLCJtb2R1bGUiLCJ2YWx1ZSIsImRlZmF1bHRUaGVtZSIsImF1dG9zYXZlIiwiZGVmYXVsdE1vZGUiLCJkZWZhdWx0RGF0ZSIsInVuZGVmaW5lZCIsImRpc3BsYXlNb2RlIiwiZGVmYXVsdE9yaWVudGF0aW9uIiwiZGlzcGxheVR3ZW50eWZvdXIiLCJjb21wYWN0IiwicHJldmlvdXNNb250aCIsIm5leHRNb250aCIsImluY3JlbWVudEhvdXJzIiwiZGVjcmVtZW50SG91cnMiLCJpbmNyZW1lbnRNaW51dGVzIiwiZGVjcmVtZW50TWludXRlcyIsInN3aXRjaEFtUG0iLCJub3ciLCJjYW5jZWwiLCJzYXZlIiwid2Vla2RheXMiLCJzd2l0Y2hUbyIsImNsb2NrIiwiY2FsZW5kYXIiLCJkaXJlY3RpdmUiLCIkZmlsdGVyIiwiJHNjZSIsIiRyb290U2NvcGUiLCIkcGFyc2UiLCJzY0RhdGVUaW1lSTE4biIsInNjRGF0ZVRpbWVDb25maWciLCJfZGF0ZUZpbHRlciIsInJlc3RyaWN0IiwicmVwbGFjZSIsInNjb3BlIiwiX3dlZWtkYXlzIiwicmVxdWlyZSIsInRlbXBsYXRlVXJsIiwidEVsZW1lbnQiLCJ0QXR0cnMiLCJ0aGVtZSIsImluZGV4T2YiLCJsaW5rIiwiZWxlbWVudCIsImF0dHJzIiwibmdNb2RlbCIsIiRvYnNlcnZlIiwidmFsIiwiX21vZGUiLCJfZGVmYXVsdERhdGUiLCJEYXRlIiwicGFyc2UiLCJfZGlzcGxheU1vZGUiLCJfdmVydGljYWxNb2RlIiwiX2NvbXBhY3QiLCJfaG91cnMyNCIsInJlc3RyaWN0aW9ucyIsIm1pbmRhdGUiLCJzZXRIb3VycyIsIm1heGRhdGUiLCIkd2F0Y2giLCJpc0FycmF5IiwiJHJlbmRlciIsInNldERhdGUiLCIkbW9kZWxWYWx1ZSIsImZvckVhY2giLCJmaW5kIiwiaW5wdXQiLCJvbiIsInNldFRpbWVvdXQiLCJzZWxlY3QiLCJzYXZlVXBkYXRlRGF0ZSIsIiRzZXRWaWV3VmFsdWUiLCJkYXRlIiwic2F2ZUZuIiwib25TYXZlIiwiY2FuY2VsRm4iLCJvbkNhbmNlbCIsIiRwYXJlbnQiLCIkdmFsdWUiLCJjb250cm9sbGVyIiwiaSIsInRyYW5zbGF0aW9ucyIsImFkZFplcm8iLCJtaW4iLCJ0b1N0cmluZyIsInNsaWNlIiwibmV3VmFsIiwiX3llYXIiLCJnZXRGdWxsWWVhciIsIl9tb250aCIsImdldE1vbnRoIiwiX21pbnV0ZXMiLCJnZXRNaW51dGVzIiwiX2hvdXJzIiwiZ2V0SG91cnMiLCJ5ZWFyQ2hhbmdlIiwiZGlzcGxheSIsImZ1bGxUaXRsZSIsIl90aW1lU3RyaW5nIiwidGl0bGUiLCJzdXBlciIsIm1haW4iLCJ0cnVzdEFzSHRtbCIsInN1YiIsIl9tb250aHMiLCJfYWxsTW9udGhzIiwicmVzdWx0IiwicHVzaCIsIm9mZnNldE1hcmdpbiIsImdldERheSIsImlzVmlzaWJsZSIsImQiLCJpc0Rpc2FibGVkIiwiY3VycmVudERhdGUiLCJpc1ByZXZNb250aEJ1dHRvbkhpZGRlbiIsImlzTmV4dE1vbnRoQnV0dG9uSGlkZGVuIiwiY2xhc3MiLCJjbGFzc1N0cmluZyIsImdldFRpbWUiLCJzZXRGdWxsWWVhciIsIm1vbnRoQ2hhbmdlIiwiaXNOYU4iLCJNYXRoIiwibWF4IiwiZ2V0RGF0ZSIsIl9pbmNNb250aCIsIm1vbnRocyIsImxlbiIsIl9pbmNIb3VycyIsImluYyIsIl9pbmNNaW51dGVzIiwicGFyc2VJbnQiLCJzZXRBTSIsImIiLCJpc0FNIiwib2xkVmFsIiwiaW50TWluIiwic2V0TWludXRlcyIsInNldE5vdyIsIm1vZGVDbGFzcyIsIm1vZGVTd2l0Y2giLCJtb2RlU3dpdGNoVGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsTUFBTUEsY0FBYyxZQUFwQjs7b0JBRWVBLFc7OztBQUVmLG9CQUFRQyxNQUFSLENBQWVELFdBQWYsRUFBNEIsRUFBNUIsRUFDQ0UsS0FERCxDQUNPLGtCQURQLEVBQzJCO0FBQ3pC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QXNCLElBQXRCLEdBQTZCbEIsTUFBTWtCLFlBQW5DLEdBQWtEbEIsTUFBTWMsS0FBTixLQUFnQixNQUFoQixHQUF5QixNQUF6QixHQUFrQyxNQUF4RztBQUFBLFNBQW5CO0FBQ0EsZUFBT2QsTUFBTTRHLGNBQU4sR0FBdUI7QUFBQSxpQkFBU2pILGVBQWVSLFFBQXhCLFVBQzlCYSxNQUFNYyxLQUFOLEtBQWdCLE1BQWhCLEdBQXlCbkIsZUFBZVAsS0FBeEMsR0FBZ0RPLGVBQWVOLFFBRGpDO0FBQUEsU0FBOUI7QUFFRCxPQWxRVztBQS9FUCxLQUFQO0FBb1ZELEdBdlYyQixDQTNCOUIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBhbmd1bGFyIGZyb20gJ2FuZ3VsYXInO1xuXG5jb25zdCBNT0RVTEVfTkFNRSA9ICdzY0RhdGVUaW1lJztcblxuZXhwb3J0IGRlZmF1bHQgTU9EVUxFX05BTUU7XG5cbmFuZ3VsYXIubW9kdWxlKE1PRFVMRV9OQU1FLCBbXSlcbi52YWx1ZSgnc2NEYXRlVGltZUNvbmZpZycsIHtcbiAgZGVmYXVsdFRoZW1lOiAnbWF0ZXJpYWwnLFxuICBhdXRvc2F2ZTogZmFsc2UsXG4gIGRlZmF1bHRNb2RlOiAnZGF0ZScsXG4gIGRlZmF1bHREYXRlOiB1bmRlZmluZWQsIC8vIHNob3VsZCBiZSBkYXRlIG9iamVjdCEhXG4gIGRpc3BsYXlNb2RlOiB1bmRlZmluZWQsXG4gIGRlZmF1bHRPcmllbnRhdGlvbjogZmFsc2UsXG4gIGRpc3BsYXlUd2VudHlmb3VyOiBmYWxzZSxcbiAgY29tcGFjdDogZmFsc2UsXG59LFxuKS52YWx1ZSgnc2NEYXRlVGltZUkxOG4nLCB7XG4gIHByZXZpb3VzTW9udGg6ICdQcmV2aW91cyBNb250aCcsXG4gIG5leHRNb250aDogJ05leHQgTW9udGgnLFxuICBpbmNyZW1lbnRIb3VyczogJ0luY3JlbWVudCBIb3VycycsXG4gIGRlY3JlbWVudEhvdXJzOiAnRGVjcmVtZW50IEhvdXJzJyxcbiAgaW5jcmVtZW50TWludXRlczogJ0luY3JlbWVudCBNaW51dGVzJyxcbiAgZGVjcmVtZW50TWludXRlczogJ0RlY3JlbWVudCBNaW51dGVzJyxcbiAgc3dpdGNoQW1QbTogJ1N3aXRjaCBBTS9QTScsXG4gIG5vdzogJ05vdycsXG4gIGNhbmNlbDogJ0NhbmNlbCcsXG4gIHNhdmU6ICdTYXZlJyxcbiAgd2Vla2RheXM6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLFxuICBzd2l0Y2hUbzogJ1N3aXRjaCB0bycsXG4gIGNsb2NrOiAnQ2xvY2snLFxuICBjYWxlbmRhcjogJ0NhbGVuZGFyJyxcbn0sXG4pLmRpcmVjdGl2ZSgndGltZURhdGVQaWNrZXInLCBbJyRmaWx0ZXInLCAnJHNjZScsICckcm9vdFNjb3BlJywgJyRwYXJzZScsICdzY0RhdGVUaW1lSTE4bicsICdzY0RhdGVUaW1lQ29uZmlnJyxcbiAgZnVuY3Rpb24gKCRmaWx0ZXIsICRzY2UsICRyb290U2NvcGUsICRwYXJzZSwgc2NEYXRlVGltZUkxOG4sIHNjRGF0ZVRpbWVDb25maWcpIHtcbiAgICBjb25zdCBfZGF0ZUZpbHRlciA9ICRmaWx0ZXIoJ2RhdGUnKTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgX3dlZWtkYXlzOiAnPT90ZFdlZWtkYXlzJyxcbiAgICAgIH0sXG4gICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgICB0ZW1wbGF0ZVVybCh0RWxlbWVudCwgdEF0dHJzKSB7XG4gICAgICAgIGlmICgodEF0dHJzLnRoZW1lID09IG51bGwpIHx8ICh0QXR0cnMudGhlbWUgPT09ICcnKSkgeyB0QXR0cnMudGhlbWUgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRUaGVtZTsgfVxuXG4gICAgICAgIHJldHVybiB0QXR0cnMudGhlbWUuaW5kZXhPZignLycpIDw9IDAgPyBgc2NEYXRlVGltZS0ke3RBdHRycy50aGVtZX0udHBsYCA6IHRBdHRycy50aGVtZTtcbiAgICAgIH0sXG5cbiAgICAgIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkZWZhdWx0TW9kZScsIHZhbCA9PiB7XG4gICAgICAgICAgaWYgKCh2YWwgIT09ICd0aW1lJykgJiYgKHZhbCAhPT0gJ2RhdGUnKSkgeyB2YWwgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRNb2RlOyB9XG5cbiAgICAgICAgICByZXR1cm4gc2NvcGUuX21vZGUgPSB2YWw7XG4gICAgICAgIH0pO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnZGVmYXVsdERhdGUnLCB2YWwgPT5cbiAgICAgICAgc2NvcGUuX2RlZmF1bHREYXRlID0gKHZhbCAhPSBudWxsKSAmJiBEYXRlLnBhcnNlKHZhbCkgPyBEYXRlLnBhcnNlKHZhbClcbiAgICAgICAgOiBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHREYXRlLFxuICAgICAgKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2Rpc3BsYXlNb2RlJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPT0gJ2Z1bGwnKSAmJiAodmFsICE9PSAndGltZScpICYmICh2YWwgIT09ICdkYXRlJykpIHsgdmFsID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5TW9kZTsgfVxuXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLl9kaXNwbGF5TW9kZSA9IHZhbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdvcmllbnRhdGlvbicsIHZhbCA9PiBzY29wZS5fdmVydGljYWxNb2RlID0gKHZhbCAhPSBudWxsKSA/IHZhbCA9PT0gJ3RydWUnIDogc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0T3JpZW50YXRpb24pO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnY29tcGFjdCcsIHZhbCA9PiBzY29wZS5fY29tcGFjdCA9ICh2YWwgIT0gbnVsbCkgPyB2YWwgPT09ICd0cnVlJyA6IHNjRGF0ZVRpbWVDb25maWcuY29tcGFjdCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdkaXNwbGF5VHdlbnR5Zm91cicsIHZhbCA9PiBzY29wZS5faG91cnMyNCA9ICh2YWwgIT0gbnVsbCkgPyB2YWwgOiBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlUd2VudHlmb3VyKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoJ21pbmRhdGUnLCB2YWwgPT4ge1xuICAgICAgICAgIGlmICgodmFsICE9IG51bGwpICYmIERhdGUucGFyc2UodmFsKSkge1xuICAgICAgICAgICAgc2NvcGUucmVzdHJpY3Rpb25zLm1pbmRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKCdtYXhkYXRlJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiBEYXRlLnBhcnNlKHZhbCkpIHtcbiAgICAgICAgICAgIHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlID0gbmV3IERhdGUodmFsKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5yZXN0cmljdGlvbnMubWF4ZGF0ZS5zZXRIb3VycygyMywgNTksIDU5LCA5OTkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNjb3BlLl93ZWVrZGF5cyA9IHNjb3BlLl93ZWVrZGF5cyB8fCBzY0RhdGVUaW1lSTE4bi53ZWVrZGF5cztcbiAgICAgICAgc2NvcGUuJHdhdGNoKCdfd2Vla2RheXMnLCB2YWx1ZSA9PiB7XG4gICAgICAgICAgaWYgKCh2YWx1ZSA9PSBudWxsKSB8fCAhYW5ndWxhci5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLl93ZWVrZGF5cyA9IHNjRGF0ZVRpbWVJMThuLndlZWtkYXlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmdNb2RlbC4kcmVuZGVyID0gKCkgPT4gc2NvcGUuc2V0RGF0ZShuZ01vZGVsLiRtb2RlbFZhbHVlICE9IG51bGwgPyBuZ01vZGVsLiRtb2RlbFZhbHVlIDogc2NvcGUuX2RlZmF1bHREYXRlLCAobmdNb2RlbC4kbW9kZWxWYWx1ZSAhPSBudWxsKSk7XG5cbiAgICAgICAgLy8gU2VsZWN0IGNvbnRlbnRzIG9mIGlucHV0cyB3aGVuIGZvY2N1c3NlZCBpbnRvXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChlbGVtZW50LmZpbmQoJ2lucHV0JyksXG4gICAgICAgIGlucHV0ID0+XG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KGlucHV0KS5vbignZm9jdXMnLCAoKSA9PiBzZXRUaW1lb3V0KCgoKSA9PiBpbnB1dC5zZWxlY3QoKSksIDEwKSksXG4gICAgICApO1xuXG4gICAgICAgIHNjb3BlLmF1dG9zYXZlID0gZmFsc2U7XG4gICAgICAgIGlmICgoYXR0cnMuYXV0b3NhdmUgIT0gbnVsbCkgfHwgc2NEYXRlVGltZUNvbmZpZy5hdXRvc2F2ZSkge1xuICAgICAgICAgIHNjb3BlLnNhdmVVcGRhdGVEYXRlID0gKCkgPT4gbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHNjb3BlLmRhdGUpO1xuICAgICAgICAgIHJldHVybiBzY29wZS5hdXRvc2F2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzYXZlRm4gPSAkcGFyc2UoYXR0cnMub25TYXZlKTtcbiAgICAgICAgY29uc3QgY2FuY2VsRm4gPSAkcGFyc2UoYXR0cnMub25DYW5jZWwpO1xuICAgICAgICBzY29wZS5zYXZlVXBkYXRlRGF0ZSA9ICgpID0+IHRydWU7XG5cbiAgICAgICAgc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUobmV3IERhdGUoc2NvcGUuZGF0ZSkpO1xuICAgICAgICAgIHJldHVybiBzYXZlRm4oc2NvcGUuJHBhcmVudCwgeyAkdmFsdWU6IG5ldyBEYXRlKHNjb3BlLmRhdGUpIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzY29wZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FuY2VsRm4oc2NvcGUuJHBhcmVudCwge30pO1xuICAgICAgICAgIHJldHVybiBuZ01vZGVsLiRyZW5kZXIoKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJ3NjRGF0ZVRpbWVJMThuJywgZnVuY3Rpb24gKHNjb3BlLCBzY0RhdGVUaW1lSTE4bikge1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgc2NvcGUuX2RlZmF1bHREYXRlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0RGF0ZTtcbiAgICAgICAgc2NvcGUuX21vZGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRlZmF1bHRNb2RlO1xuICAgICAgICBzY29wZS5fZGlzcGxheU1vZGUgPSBzY0RhdGVUaW1lQ29uZmlnLmRpc3BsYXlNb2RlO1xuICAgICAgICBzY29wZS5fdmVydGljYWxNb2RlID0gc2NEYXRlVGltZUNvbmZpZy5kZWZhdWx0T3JpZW50YXRpb247XG4gICAgICAgIHNjb3BlLl9ob3VyczI0ID0gc2NEYXRlVGltZUNvbmZpZy5kaXNwbGF5VHdlbnR5Zm91cjtcbiAgICAgICAgc2NvcGUuX2NvbXBhY3QgPSBzY0RhdGVUaW1lQ29uZmlnLmNvbXBhY3Q7XG4gICAgICAgIHNjb3BlLnRyYW5zbGF0aW9ucyA9IHNjRGF0ZVRpbWVJMThuO1xuICAgICAgICBzY29wZS5yZXN0cmljdGlvbnMgPSB7XG4gICAgICAgICAgbWluZGF0ZTogdW5kZWZpbmVkLFxuICAgICAgICAgIG1heGRhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5hZGRaZXJvID0gZnVuY3Rpb24gKG1pbikge1xuICAgICAgICAgIGlmIChtaW4gPiA5KSB7IHJldHVybiBtaW4udG9TdHJpbmcoKTsgfSByZXR1cm4gKGAwJHttaW59YCkuc2xpY2UoLTIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLnNldERhdGUgPSBmdW5jdGlvbiAobmV3VmFsLCBzYXZlKSB7XG4gICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxuXG4gICAgICAgICAgc2NvcGUuZGF0ZSA9IG5ld1ZhbCA/IG5ldyBEYXRlKG5ld1ZhbCkgOiBuZXcgRGF0ZSgpO1xuICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl95ZWFyID0gc2NvcGUuZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl9tb250aCA9IHNjb3BlLmRhdGUuZ2V0TW9udGgoKTtcbiAgICAgICAgICBzY29wZS5jbG9jay5fbWludXRlcyA9IHNjb3BlLmFkZFplcm8oc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgIHNjb3BlLmNsb2NrLl9ob3VycyA9IHNjb3BlLl9ob3VyczI0ID8gc2NvcGUuZGF0ZS5nZXRIb3VycygpIDogc2NvcGUuZGF0ZS5nZXRIb3VycygpICUgMTI7XG4gICAgICAgICAgaWYgKCFzY29wZS5faG91cnMyNCAmJiAoc2NvcGUuY2xvY2suX2hvdXJzID09PSAwKSkgeyBzY29wZS5jbG9jay5faG91cnMgPSAxMjsgfVxuXG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmNhbGVuZGFyLnllYXJDaGFuZ2Uoc2F2ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc2NvcGUuZGlzcGxheSA9IHtcbiAgICAgICAgICBmdWxsVGl0bGUoKSB7XG4gICAgICAgICAgICBjb25zdCBfdGltZVN0cmluZyA9IHNjb3BlLl9ob3VyczI0ID8gJ0hIOm1tJyA6ICdoOm1tIGEnO1xuICAgICAgICAgICAgaWYgKChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdmdWxsJykgJiYgIXNjb3BlLl92ZXJ0aWNhbE1vZGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsIGBFRUVFIGQgTU1NTSB5eXl5LCAke190aW1lU3RyaW5nfWApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICd0aW1lJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgX3RpbWVTdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ0VFRSBkIE1NTSB5eXl5Jyk7XG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCBgZCBNTU0geXl5eSwgJHtfdGltZVN0cmluZ31gKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdGl0bGUoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuX21vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgKHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ2RhdGUnID8gJ0VFRUUnIDogYEVFRUUgJHtcbiAgICAgICAgICAgICAgc2NvcGUuX2hvdXJzMjQgPyAnSEg6bW0nIDogJ2g6bW0gYSdcbiAgICAgICAgICAgIH1gKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnTU1NTSBkIHl5eXknKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc3VwZXIoKSB7XG4gICAgICAgICAgICBpZiAoc2NvcGUuX21vZGUgPT09ICdkYXRlJykge1xuICAgICAgICAgICAgICByZXR1cm4gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ01NTScpO1xuICAgICAgICAgICAgfSByZXR1cm4gJyc7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIG1haW4oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChcbiAgICAgICAgICBzY29wZS5fbW9kZSA9PT0gJ2RhdGUnID8gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2QnKVxuICAgICAgICAgIDpcbiAgICAgICAgICAgIHNjb3BlLl9ob3VyczI0ID8gX2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ0hIOm1tJylcbiAgICAgICAgICAgIDogYCR7X2RhdGVGaWx0ZXIoc2NvcGUuZGF0ZSwgJ2g6bW0nKX08c21hbGw+JHtfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnYScpfTwvc21hbGw+YCxcbiAgICAgICAgKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc3ViKCkge1xuICAgICAgICAgICAgaWYgKHNjb3BlLl9tb2RlID09PSAnZGF0ZScpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9kYXRlRmlsdGVyKHNjb3BlLmRhdGUsICd5eXl5Jyk7XG4gICAgICAgICAgICB9IHJldHVybiBfZGF0ZUZpbHRlcihzY29wZS5kYXRlLCAnSEg6bW0nKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLmNhbGVuZGFyID0ge1xuICAgICAgICAgIF9tb250aDogMCxcbiAgICAgICAgICBfeWVhcjogMCxcbiAgICAgICAgICBfbW9udGhzOiBbXSxcbiAgICAgICAgICBfYWxsTW9udGhzOiAoKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8PSAxMTsgaSsrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKF9kYXRlRmlsdGVyKG5ldyBEYXRlKDAsIGkpLCAnTU1NTScpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9KSgpKSxcbiAgICAgICAgICBvZmZzZXRNYXJnaW4oKSB7IHJldHVybiBgJHtuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCkuZ2V0RGF5KCkgKiAyLjd9cmVtYDsgfSxcblxuICAgICAgICAgIGlzVmlzaWJsZShkKSB7IHJldHVybiBuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0TW9udGgoKSA9PT0gdGhpcy5fbW9udGg7IH0sXG5cbiAgICAgICAgICBpc0Rpc2FibGVkKGQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpO1xuICAgICAgICAgICAgY29uc3QgeyBtaW5kYXRlIH0gPSBzY29wZS5yZXN0cmljdGlvbnM7XG4gICAgICAgICAgICBjb25zdCB7IG1heGRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIHJldHVybiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKGN1cnJlbnREYXRlIDwgbWluZGF0ZSkpIHx8ICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAoY3VycmVudERhdGUgPiBtYXhkYXRlKSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGlzUHJldk1vbnRoQnV0dG9uSGlkZGVuKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHNjb3BlLnJlc3RyaWN0aW9ucy5taW5kYXRlO1xuICAgICAgICAgICAgcmV0dXJuIChkYXRlICE9IG51bGwpICYmICh0aGlzLl9tb250aCA8PSBkYXRlLmdldE1vbnRoKCkpICYmICh0aGlzLl95ZWFyIDw9IGRhdGUuZ2V0RnVsbFllYXIoKSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGlzTmV4dE1vbnRoQnV0dG9uSGlkZGVuKCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHNjb3BlLnJlc3RyaWN0aW9ucy5tYXhkYXRlO1xuICAgICAgICAgICAgcmV0dXJuIChkYXRlICE9IG51bGwpICYmICh0aGlzLl9tb250aCA+PSBkYXRlLmdldE1vbnRoKCkpICYmICh0aGlzLl95ZWFyID49IGRhdGUuZ2V0RnVsbFllYXIoKSk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGNsYXNzKGQpIHtcbiAgICAgICAgICAgIGxldCBjbGFzc1N0cmluZyA9ICcnO1xuICAgICAgICAgICAgaWYgKChzY29wZS5kYXRlICE9IG51bGwpICYmIChuZXcgRGF0ZSh0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCkuZ2V0VGltZSgpID09PSBuZXcgRGF0ZShzY29wZS5kYXRlLmdldFRpbWUoKSkuc2V0SG91cnMoMCxcbiAgICAgICAgICAgIDAsIDAsIDApKSkge1xuICAgICAgICAgICAgICBjbGFzc1N0cmluZyArPSAnc2VsZWN0ZWQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV3IERhdGUodGhpcy5feWVhciwgdGhpcy5fbW9udGgsIGQpLmdldFRpbWUoKSA9PT0gbmV3IERhdGUoKS5zZXRIb3VycygwLCAwLCAwLCAwKSkge1xuICAgICAgICAgICAgICBjbGFzc1N0cmluZyArPSAnIHRvZGF5JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNsYXNzU3RyaW5nO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBzZWxlY3QoZCkge1xuICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRGdWxsWWVhcih0aGlzLl95ZWFyLCB0aGlzLl9tb250aCwgZCk7XG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbW9udGhDaGFuZ2Uoc2F2ZSkge1xuICAgICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxuXG4gICAgICAgICAgICBpZiAoKHRoaXMuX3llYXIgPT0gbnVsbCkgfHwgaXNOYU4odGhpcy5feWVhcikpIHsgdGhpcy5feWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTsgfVxuXG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgaWYgKChtaW5kYXRlICE9IG51bGwpICYmIChtaW5kYXRlLmdldEZ1bGxZZWFyKCkgPT09IHRoaXMuX3llYXIpICYmIChtaW5kYXRlLmdldE1vbnRoKCkgPj0gdGhpcy5fbW9udGgpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX21vbnRoID0gTWF0aC5tYXgobWluZGF0ZS5nZXRNb250aCgpLCB0aGlzLl9tb250aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgobWF4ZGF0ZSAhPSBudWxsKSAmJiAobWF4ZGF0ZS5nZXRGdWxsWWVhcigpID09PSB0aGlzLl95ZWFyKSAmJiAobWF4ZGF0ZS5nZXRNb250aCgpIDw9IHRoaXMuX21vbnRoKSkge1xuICAgICAgICAgICAgICB0aGlzLl9tb250aCA9IE1hdGgubWluKG1heGRhdGUuZ2V0TW9udGgoKSwgdGhpcy5fbW9udGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldEZ1bGxZZWFyKHRoaXMuX3llYXIsIHRoaXMuX21vbnRoKTtcbiAgICAgICAgICAgIGlmIChzY29wZS5kYXRlLmdldE1vbnRoKCkgIT09IHRoaXMuX21vbnRoKSB7IHNjb3BlLmRhdGUuc2V0RGF0ZSgwKTsgfVxuXG4gICAgICAgICAgICBpZiAoKG1pbmRhdGUgIT0gbnVsbCkgJiYgKHNjb3BlLmRhdGUgPCBtaW5kYXRlKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldERhdGUobWluZGF0ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICBzY29wZS5jYWxlbmRhci5zZWxlY3QobWluZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKG1heGRhdGUgIT0gbnVsbCkgJiYgKHNjb3BlLmRhdGUgPiBtYXhkYXRlKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldERhdGUobWF4ZGF0ZS5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgICBzY29wZS5jYWxlbmRhci5zZWxlY3QobWF4ZGF0ZS5nZXREYXRlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2F2ZSkgeyByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTsgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBfaW5jTW9udGgobW9udGhzKSB7XG4gICAgICAgICAgICB0aGlzLl9tb250aCArPSBtb250aHM7XG4gICAgICAgICAgICB3aGlsZSAoKHRoaXMuX21vbnRoIDwgMCkgfHwgKHRoaXMuX21vbnRoID4gMTEpKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLl9tb250aCA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aCArPSAxMjtcbiAgICAgICAgICAgICAgICB0aGlzLl95ZWFyLS07XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGggLT0gMTI7XG4gICAgICAgICAgICAgICAgdGhpcy5feWVhcisrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vbnRoQ2hhbmdlKCk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHllYXJDaGFuZ2Uoc2F2ZSkge1xuICAgICAgICAgICAgaWYgKHNhdmUgPT0gbnVsbCkgeyBzYXZlID0gdHJ1ZTsgfVxuXG4gICAgICAgICAgICBpZiAoKHNjb3BlLmNhbGVuZGFyLl95ZWFyID09IG51bGwpIHx8IChzY29wZS5jYWxlbmRhci5feWVhciA9PT0gJycpKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICBjb25zdCB7IG1pbmRhdGUgfSA9IHNjb3BlLnJlc3RyaWN0aW9ucztcbiAgICAgICAgICAgIGNvbnN0IHsgbWF4ZGF0ZSB9ID0gc2NvcGUucmVzdHJpY3Rpb25zO1xuICAgICAgICAgICAgaSA9IChtaW5kYXRlICE9IG51bGwpICYmIChtaW5kYXRlLmdldEZ1bGxZZWFyKCkgPT09IHNjb3BlLmNhbGVuZGFyLl95ZWFyKSA/IG1pbmRhdGUuZ2V0TW9udGgoKSA6IDA7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSAobWF4ZGF0ZSAhPSBudWxsKSAmJiAobWF4ZGF0ZS5nZXRGdWxsWWVhcigpID09PSBzY29wZS5jYWxlbmRhci5feWVhcikgPyBtYXhkYXRlLmdldE1vbnRoKCkgOiAxMTtcbiAgICAgICAgICAgIHNjb3BlLmNhbGVuZGFyLl9tb250aHMgPSBzY29wZS5jYWxlbmRhci5fYWxsTW9udGhzLnNsaWNlKGksIGxlbiArIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmNhbGVuZGFyLm1vbnRoQ2hhbmdlKHNhdmUpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHNjb3BlLmNsb2NrID0ge1xuICAgICAgICAgIF9taW51dGVzOiAnMDAnLFxuICAgICAgICAgIF9ob3VyczogMCxcbiAgICAgICAgICBfaW5jSG91cnMoaW5jKSB7XG4gICAgICAgICAgICB0aGlzLl9ob3VycyA9IHNjb3BlLl9ob3VyczI0XG4gICAgICAgICAgPyBNYXRoLm1heCgwLCBNYXRoLm1pbigyMywgdGhpcy5faG91cnMgKyBpbmMpKVxuICAgICAgICAgIDogTWF0aC5tYXgoMSwgTWF0aC5taW4oMTIsIHRoaXMuX2hvdXJzICsgaW5jKSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy5faG91cnMpKSB7IHJldHVybiB0aGlzLl9ob3VycyA9IDA7IH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgX2luY01pbnV0ZXMoaW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWludXRlcyA9IHNjb3BlLmFkZFplcm8oTWF0aC5tYXgoMCwgTWF0aC5taW4oNTksIHBhcnNlSW50KHRoaXMuX21pbnV0ZXMpICsgaW5jKSkpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNldEFNKGIpIHtcbiAgICAgICAgICAgIGlmIChiID09IG51bGwpIHsgYiA9ICF0aGlzLmlzQU0oKTsgfVxuXG4gICAgICAgICAgICBpZiAoYiAmJiAhdGhpcy5pc0FNKCkpIHtcbiAgICAgICAgICAgICAgc2NvcGUuZGF0ZS5zZXRIb3VycyhzY29wZS5kYXRlLmdldEhvdXJzKCkgLSAxMik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFiICYmIHRoaXMuaXNBTSgpKSB7XG4gICAgICAgICAgICAgIHNjb3BlLmRhdGUuc2V0SG91cnMoc2NvcGUuZGF0ZS5nZXRIb3VycygpICsgMTIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXNBTSgpIHsgcmV0dXJuIHNjb3BlLmRhdGUuZ2V0SG91cnMoKSA8IDEyOyB9LFxuICAgICAgICB9O1xuICAgICAgICBzY29wZS4kd2F0Y2goJ2Nsb2NrLl9taW51dGVzJywgKHZhbCwgb2xkVmFsKSA9PiB7XG4gICAgICAgICAgaWYgKCF2YWwpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICBjb25zdCBpbnRNaW4gPSBwYXJzZUludCh2YWwpO1xuICAgICAgICAgIGlmICghaXNOYU4oaW50TWluKSAmJiBpbnRNaW4gPj0gMCAmJiBpbnRNaW4gPD0gNTkgJiYgKGludE1pbiAhPT0gc2NvcGUuZGF0ZS5nZXRNaW51dGVzKCkpKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRlLnNldE1pbnV0ZXMoaW50TWluKTtcbiAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNjb3BlLiR3YXRjaCgnY2xvY2suX2hvdXJzJywgdmFsID0+IHtcbiAgICAgICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiAhaXNOYU4odmFsKSkge1xuICAgICAgICAgICAgaWYgKCFzY29wZS5faG91cnMyNCkge1xuICAgICAgICAgICAgICBpZiAodmFsID09PSAyNCkge1xuICAgICAgICAgICAgICAgIHZhbCA9IDEyO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbCA9PT0gMTIpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAwO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzY29wZS5jbG9jay5pc0FNKCkpIHsgdmFsICs9IDEyOyB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh2YWwgIT09IHNjb3BlLmRhdGUuZ2V0SG91cnMoKSkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRlLnNldEhvdXJzKHZhbCk7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5zYXZlVXBkYXRlRGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NvcGUuc2V0Tm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLnNldERhdGUoKTtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuc2F2ZVVwZGF0ZURhdGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBzY29wZS5tb2RlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsKSB7IHNjb3BlLl9tb2RlID0gc2NvcGUuX2Rpc3BsYXlNb2RlOyB9XG5cbiAgICAgICAgICByZXR1cm4gYCR7c2NvcGUuX3ZlcnRpY2FsTW9kZSA/ICd2ZXJ0aWNhbCAnIDogJyd9JHtcbiAgICAgICAgc2NvcGUuX2Rpc3BsYXlNb2RlID09PSAnZnVsbCcgPyAnZnVsbC1tb2RlJ1xuICAgICAgICA6IHNjb3BlLl9kaXNwbGF5TW9kZSA9PT0gJ3RpbWUnID8gJ3RpbWUtb25seSdcbiAgICAgICAgOiBzY29wZS5fZGlzcGxheU1vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW9ubHknXG4gICAgICAgIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICdkYXRlLW1vZGUnXG4gICAgICAgIDogJ3RpbWUtbW9kZSd9ICR7c2NvcGUuX2NvbXBhY3QgPyAnY29tcGFjdCcgOiAnJ31gO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLm1vZGVTd2l0Y2ggPSAoKSA9PiBzY29wZS5fbW9kZSA9IHNjb3BlLl9kaXNwbGF5TW9kZSAhPSBudWxsID8gc2NvcGUuX2Rpc3BsYXlNb2RlIDogc2NvcGUuX21vZGUgPT09ICdkYXRlJyA/ICd0aW1lJyA6ICdkYXRlJztcbiAgICAgICAgcmV0dXJuIHNjb3BlLm1vZGVTd2l0Y2hUZXh0ID0gKCkgPT4gYCR7c2NEYXRlVGltZUkxOG4uc3dpdGNoVG99ICR7XG4gICAgICAgIHNjb3BlLl9tb2RlID09PSAnZGF0ZScgPyBzY0RhdGVUaW1lSTE4bi5jbG9jayA6IHNjRGF0ZVRpbWVJMThuLmNhbGVuZGFyfWA7XG4gICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9LFxuXSk7XG4iXX0=
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-bootstrap.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><button type="button" ng-click="calendar._incMonth(-1)" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-left"></i></button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"> <button type="button" ng-click="calendar._incMonth(1)" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}" class="btn btn-link"><i class="fa fa-caret-right"></i></button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" class="btn btn-link day-cell">1</button> <button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" class="btn btn-link day-cell">2</button> <button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" class="btn btn-link day-cell">3</button> <button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" class="btn btn-link day-cell">4</button> <button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" class="btn btn-link day-cell">5</button> <button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" class="btn btn-link day-cell">6</button> <button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" class="btn btn-link day-cell">7</button> <button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" class="btn btn-link day-cell">8</button> <button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" class="btn btn-link day-cell">9</button> <button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" class="btn btn-link day-cell">10</button> <button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" class="btn btn-link day-cell">11</button> <button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" class="btn btn-link day-cell">12</button> <button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" class="btn btn-link day-cell">13</button> <button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" class="btn btn-link day-cell">14</button> <button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" class="btn btn-link day-cell">15</button> <button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" class="btn btn-link day-cell">16</button> <button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" class="btn btn-link day-cell">17</button> <button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" class="btn btn-link day-cell">18</button> <button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" class="btn btn-link day-cell">19</button> <button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" class="btn btn-link day-cell">20</button> <button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" class="btn btn-link day-cell">21</button> <button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" class="btn btn-link day-cell">22</button> <button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" class="btn btn-link day-cell">23</button> <button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" class="btn btn-link day-cell">24</button> <button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" class="btn btn-link day-cell">25</button> <button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" class="btn btn-link day-cell">26</button> <button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" class="btn btn-link day-cell">27</button> <button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" class="btn btn-link day-cell">28</button> <button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" class="btn btn-link day-cell">29</button> <button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" class="btn btn-link day-cell">30</button> <button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" class="btn btn-link day-cell">31</button></div></div><button type="button" ng-click="modeSwitch()" class="btn btn-link switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"> <button type="button" ng-click="clock._incHours(1)" class="btn btn-link hours up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incHours(-1)" class="btn btn-link hours down"><i class="fa fa-caret-down"></i></button> <input type="text" ng-model="clock._minutes"> <button type="button" ng-click="clock._incMinutes(1)" class="btn btn-link minutes up"><i class="fa fa-caret-up"></i></button> <button type="button" ng-click="clock._incMinutes(-1)" class="btn btn-link minutes down"><i class="fa fa-caret-down"></i></button></div><div ng-if="!_hours24" class="buttons"><button type="button" ng-click="clock.setAM()" class="btn btn-link">{{date | date:\'a\'}}</button></div></div></div></div><div class="buttons"><button type="button" ng-click="setNow()" class="btn btn-link">{{:: translations.now}}</button> <button type="button" ng-click="cancel()" ng-if="!autosave" class="btn btn-link">{{:: translations.cancel}}</button> <button type="button" ng-click="save()" ng-if="!autosave" class="btn btn-link">{{:: translations.save}}</button></div></div>');

}]);
'use strict';

angular.module('scDateTime').run(['$templateCache', function($templateCache) {

  $templateCache.put('scDateTime-material.tpl', '<div ng-class="modeClass()" class="time-date"><div ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="display"><div class="title">{{display.title()}}</div><div class="content"><div class="super-title">{{display.super()}}</div><div ng-bind-html="display.main()" class="main-title"></div><div class="sub-title">{{display.sub()}}</div></div></div><div class="control"><div class="full-title">{{display.fullTitle()}}</div><div class="slider"><div class="date-control"><div class="title"><md-button type="button" ng-click="calendar._incMonth(-1)" aria-label="{{:: translations.previousMonth}}" style="float: left" ng-class="{\'visuallyhidden\': calendar.isPrevMonthButtonHidden()}"><i class="fa fa-caret-left"></i></md-button><span class="month-part">{{date | date:\'MMMM\'}}<select ng-model="calendar._month" ng-change="calendar.monthChange()" ng-options="calendar._allMonths.indexOf(month) as month for month in calendar._months"></select></span> <input ng-model="calendar._year" ng-change="calendar.yearChange()" type="number" min="{{restrictions.mindate ? restrictions.mindate.getFullYear() : 0}}" max="{{restrictions.maxdate ? restrictions.maxdate.getFullYear() : NaN}}" class="year-part"><md-button type="button" ng-click="calendar._incMonth(1)" aria-label="{{:: translations.nextMonth}}" style="float: right" ng-class="{\'visuallyhidden\': calendar.isNextMonthButtonHidden()}"><i class="fa fa-caret-right"></i></md-button></div><div class="headers"><div ng-repeat="day in _weekdays track by $index" class="day-cell">{{day}}</div></div><div class="days"><md-button type="button" ng-style="{\'margin-left\': calendar.offsetMargin()}" ng-class="calendar.class(1)" ng-disabled="calendar.isDisabled(1)" ng-show="calendar.isVisible(1)" ng-click="calendar.select(1)" aria-label="1" class="day-cell">1</md-button><md-button type="button" ng-class="calendar.class(2)" ng-show="calendar.isVisible(2)" ng-disabled="calendar.isDisabled(2)" ng-click="calendar.select(2)" aria-label="2" class="day-cell">2</md-button><md-button type="button" ng-class="calendar.class(3)" ng-show="calendar.isVisible(3)" ng-disabled="calendar.isDisabled(3)" ng-click="calendar.select(3)" aria-label="3" class="day-cell">3</md-button><md-button type="button" ng-class="calendar.class(4)" ng-show="calendar.isVisible(4)" ng-disabled="calendar.isDisabled(4)" ng-click="calendar.select(4)" aria-label="4" class="day-cell">4</md-button><md-button type="button" ng-class="calendar.class(5)" ng-show="calendar.isVisible(5)" ng-disabled="calendar.isDisabled(5)" ng-click="calendar.select(5)" aria-label="5" class="day-cell">5</md-button><md-button type="button" ng-class="calendar.class(6)" ng-show="calendar.isVisible(6)" ng-disabled="calendar.isDisabled(6)" ng-click="calendar.select(6)" aria-label="6" class="day-cell">6</md-button><md-button type="button" ng-class="calendar.class(7)" ng-show="calendar.isVisible(7)" ng-disabled="calendar.isDisabled(7)" ng-click="calendar.select(7)" aria-label="7" class="day-cell">7</md-button><md-button type="button" ng-class="calendar.class(8)" ng-show="calendar.isVisible(8)" ng-disabled="calendar.isDisabled(8)" ng-click="calendar.select(8)" aria-label="8" class="day-cell">8</md-button><md-button type="button" ng-class="calendar.class(9)" ng-show="calendar.isVisible(9)" ng-disabled="calendar.isDisabled(9)" ng-click="calendar.select(9)" aria-label="9" class="day-cell">9</md-button><md-button type="button" ng-class="calendar.class(10)" ng-show="calendar.isVisible(10)" ng-disabled="calendar.isDisabled(10)" ng-click="calendar.select(10)" aria-label="10" class="day-cell">10</md-button><md-button type="button" ng-class="calendar.class(11)" ng-show="calendar.isVisible(11)" ng-disabled="calendar.isDisabled(11)" ng-click="calendar.select(11)" aria-label="11" class="day-cell">11</md-button><md-button type="button" ng-class="calendar.class(12)" ng-show="calendar.isVisible(12)" ng-disabled="calendar.isDisabled(12)" ng-click="calendar.select(12)" aria-label="12" class="day-cell">12</md-button><md-button type="button" ng-class="calendar.class(13)" ng-show="calendar.isVisible(13)" ng-disabled="calendar.isDisabled(13)" ng-click="calendar.select(13)" aria-label="13" class="day-cell">13</md-button><md-button type="button" ng-class="calendar.class(14)" ng-show="calendar.isVisible(14)" ng-disabled="calendar.isDisabled(14)" ng-click="calendar.select(14)" aria-label="14" class="day-cell">14</md-button><md-button type="button" ng-class="calendar.class(15)" ng-show="calendar.isVisible(15)" ng-disabled="calendar.isDisabled(15)" ng-click="calendar.select(15)" aria-label="15" class="day-cell">15</md-button><md-button type="button" ng-class="calendar.class(16)" ng-show="calendar.isVisible(16)" ng-disabled="calendar.isDisabled(16)" ng-click="calendar.select(16)" aria-label="16" class="day-cell">16</md-button><md-button type="button" ng-class="calendar.class(17)" ng-show="calendar.isVisible(17)" ng-disabled="calendar.isDisabled(17)" ng-click="calendar.select(17)" aria-label="17" class="day-cell">17</md-button><md-button type="button" ng-class="calendar.class(18)" ng-show="calendar.isVisible(18)" ng-disabled="calendar.isDisabled(18)" ng-click="calendar.select(18)" aria-label="18" class="day-cell">18</md-button><md-button type="button" ng-class="calendar.class(19)" ng-show="calendar.isVisible(19)" ng-disabled="calendar.isDisabled(19)" ng-click="calendar.select(19)" aria-label="19" class="day-cell">19</md-button><md-button type="button" ng-class="calendar.class(20)" ng-show="calendar.isVisible(20)" ng-disabled="calendar.isDisabled(20)" ng-click="calendar.select(20)" aria-label="20" class="day-cell">20</md-button><md-button type="button" ng-class="calendar.class(21)" ng-show="calendar.isVisible(21)" ng-disabled="calendar.isDisabled(21)" ng-click="calendar.select(21)" aria-label="21" class="day-cell">21</md-button><md-button type="button" ng-class="calendar.class(22)" ng-show="calendar.isVisible(22)" ng-disabled="calendar.isDisabled(22)" ng-click="calendar.select(22)" aria-label="22" class="day-cell">22</md-button><md-button type="button" ng-class="calendar.class(23)" ng-show="calendar.isVisible(23)" ng-disabled="calendar.isDisabled(23)" ng-click="calendar.select(23)" aria-label="23" class="day-cell">23</md-button><md-button type="button" ng-class="calendar.class(24)" ng-show="calendar.isVisible(24)" ng-disabled="calendar.isDisabled(24)" ng-click="calendar.select(24)" aria-label="24" class="day-cell">24</md-button><md-button type="button" ng-class="calendar.class(25)" ng-show="calendar.isVisible(25)" ng-disabled="calendar.isDisabled(25)" ng-click="calendar.select(25)" aria-label="25" class="day-cell">25</md-button><md-button type="button" ng-class="calendar.class(26)" ng-show="calendar.isVisible(26)" ng-disabled="calendar.isDisabled(26)" ng-click="calendar.select(26)" aria-label="26" class="day-cell">26</md-button><md-button type="button" ng-class="calendar.class(27)" ng-show="calendar.isVisible(27)" ng-disabled="calendar.isDisabled(27)" ng-click="calendar.select(27)" aria-label="27" class="day-cell">27</md-button><md-button type="button" ng-class="calendar.class(28)" ng-show="calendar.isVisible(28)" ng-disabled="calendar.isDisabled(28)" ng-click="calendar.select(28)" aria-label="28" class="day-cell">28</md-button><md-button type="button" ng-class="calendar.class(29)" ng-show="calendar.isVisible(29)" ng-disabled="calendar.isDisabled(29)" ng-click="calendar.select(29)" aria-label="29" class="day-cell">29</md-button><md-button type="button" ng-class="calendar.class(30)" ng-show="calendar.isVisible(30)" ng-disabled="calendar.isDisabled(30)" ng-click="calendar.select(30)" aria-label="30" class="day-cell">30</md-button><md-button type="button" ng-class="calendar.class(31)" ng-show="calendar.isVisible(31)" ng-disabled="calendar.isDisabled(31)" ng-click="calendar.select(31)" aria-label="31" class="day-cell">31</md-button></div></div><md-button type="button" ng-click="modeSwitch()" aria-label="{{modeSwitchText()}}" class="switch-control"><i class="fa fa-clock-o"></i><i class="fa fa-calendar"></i><span class="visuallyhidden">{{modeSwitchText()}}</span></md-button><div class="time-control"><div class="time-inputs"><input type="number" min="{{_hours24 ? 0 : 1}}" max="{{_hours24 ? 23 : 12}}" ng-model="clock._hours"><md-button type="button" ng-click="clock._incHours(1)" aria-label="{{:: translations.incrementHours}}" class="hours up"><i class="fa fa-caret-up"></i></md-button><md-button type="button" ng-click="clock._incHours(-1)" aria-label="{{:: translations.decrementHours}}" class="hours down"><i class="fa fa-caret-down"></i></md-button><input type="text" ng-model="clock._minutes"><md-button type="button" ng-click="clock._incMinutes(1)" aria-label="{{:: translations.incrementMinutes}}" class="minutes up"><i class="fa fa-caret-up"></i></md-button><md-button type="button" ng-click="clock._incMinutes(-1)" aria-label="{{:: translations.decrementMinutes}}" class="minutes down"><i class="fa fa-caret-down"></i></md-button></div><div ng-if="!_hours24" class="buttons"><md-button type="button" ng-click="clock.setAM()" aria-label="{{:: translations.switchAmPm}}">{{date | date:\'a\'}}</md-button></div></div></div></div><div class="buttons"><md-button type="button" ng-click="setNow()" aria-label="{{:: translations.now}}">{{:: translations.now}}</md-button><md-button type="button" ng-click="cancel()" ng-if="!autosave" aria-label="{{:: translations.cancel}}">{{:: translations.cancel}}</md-button><md-button type="button" ng-click="save()" ng-if="!autosave" aria-label="{{:: translations.save}}">{{:: translations.save}}</md-button></div></div>');

}]);