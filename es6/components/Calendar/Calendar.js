var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { compose } from 'recompose';

import FormPrevious from 'grommet-icons/icons/FormPrevious';
import FormNext from 'grommet-icons/icons/FormNext';
import Previous from 'grommet-icons/icons/Previous';
import Next from 'grommet-icons/icons/Next';


import { Box } from '../Box';
import { Button } from '../Button';
import { Keyboard } from '../Keyboard';
import { Heading } from '../Heading';

import { withTheme } from '../hocs';

import StyledCalendar, { StyledDay, StyledDayContainer, StyledWeek, StyledWeeks, StyledWeeksContainer } from './StyledCalendar';
import doc from './doc';
import { addDays, addMonths, betweenDates, daysApart, sameDay, subtractDays, subtractMonths, withinDates } from './utils';

var buildStartEnd = function buildStartEnd(reference, firstDayOfWeek) {
  var start = new Date(reference);
  start.setDate(1); // first of month
  start = subtractDays(start, start.getDay() - firstDayOfWeek); // beginning of week
  var end = addDays(start, 7 * 5 + 6); // 5 weeks to end of week
  return { start: start, end: end };
};

var buildState = function buildState(props) {
  var date = props.date,
      dates = props.dates,
      firstDayOfWeek = props.firstDayOfWeek;

  var reference = void 0;
  if (date) {
    reference = new Date(date);
  } else if (dates && dates.length > 0) {
    if (typeof dates[0] === 'string') {
      reference = new Date(dates[0]);
    } else if (Array.isArray(dates[0])) {
      reference = new Date(dates[0][0]);
    } else {
      reference = new Date();
    }
  } else {
    reference = new Date();
  }
  // if (props.locale) {
  //   reference.locale(props.locale);
  // }
  return _extends({}, buildStartEnd(reference, firstDayOfWeek), {
    reference: reference,
    active: new Date(reference)
  });
};

var Calendar = function (_Component) {
  _inherits(Calendar, _Component);

  function Calendar(props) {
    _classCallCheck(this, Calendar);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.setReference = function (reference) {
      var _this$props = _this.props,
          bounds = _this$props.bounds,
          firstDayOfWeek = _this$props.firstDayOfWeek;
      var _this$state = _this.state,
          start = _this$state.start,
          end = _this$state.end;

      if (betweenDates(reference, bounds)) {
        var nextStartEnd = buildStartEnd(reference, firstDayOfWeek);
        var nextState = {
          reference: reference,
          active: undefined
        };
        if (nextStartEnd.start.getTime() < start.getTime()) {
          nextState.start = nextStartEnd.start;
          nextState.slide = {
            direction: 'down',
            weeks: daysApart(start, nextStartEnd.start) / 7
          };
          clearTimeout(_this.timer);
          _this.timer = setTimeout(function () {
            return _this.setState({ end: nextStartEnd.end, slide: undefined });
          }, 1000);
        } else if (nextStartEnd.end.getTime() > end.getTime()) {
          nextState.end = nextStartEnd.end;
          nextState.slide = {
            direction: 'up',
            weeks: daysApart(nextStartEnd.end, end) / 7
          };
          clearTimeout(_this.timer);
          _this.timer = setTimeout(function () {
            return _this.setState({ start: nextStartEnd.start, slide: undefined });
          }, 1000);
        }
        _this.setState(nextState);
      }
    };

    _this.setActive = function (active) {
      var bounds = _this.props.bounds;
      var _this$state2 = _this.state,
          start = _this$state2.start,
          reference = _this$state2.reference,
          end = _this$state2.end;

      if (betweenDates(active, bounds)) {
        var nextState = { active: active };
        if (active.getTime() < start.getTime()) {
          nextState.start = subtractDays(start, 7);
          nextState.end = subtractDays(end, 7);
        } else if (active.getTime() > end.getTime()) {
          nextState.start = addDays(start, 7);
          nextState.end = addDays(end, 7);
        }
        if (active.getMonth() !== reference.getMonth()) {
          nextState.reference = new Date(active);
        }
        _this.setFocus = true;
        _this.setState(nextState);
      }
    };

    _this.onClickDay = function (dateString) {
      return function () {
        var onSelect = _this.props.onSelect;

        _this.setState({ active: new Date(dateString) });
        onSelect(dateString);
      };
    };

    _this.state = buildState(props);
    return _this;
  }

  Calendar.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    this.setState(buildState(nextProps));
  };

  Calendar.prototype.componentDidUpdate = function componentDidUpdate() {
    if (this.setFocus) {
      this.setFocus = false;
      if (this.activeRef) {
        findDOMNode(this.activeRef).focus();
      }
    }
  };

  Calendar.prototype.componentWillUnmount = function componentWillUnmount() {
    clearTimeout(this.timer);
  };

  Calendar.prototype.render = function render() {
    var _this2 = this;

    var _props = this.props,
        bounds = _props.bounds,
        date = _props.date,
        dates = _props.dates,
        disabled = _props.disabled,
        firstDayOfWeek = _props.firstDayOfWeek,
        locale = _props.locale,
        onSelect = _props.onSelect,
        size = _props.size,
        theme = _props.theme,
        rest = _objectWithoutProperties(_props, ['bounds', 'date', 'dates', 'disabled', 'firstDayOfWeek', 'locale', 'onSelect', 'size', 'theme']);

    var _state = this.state,
        active = _state.active,
        start = _state.start,
        reference = _state.reference,
        end = _state.end,
        slide = _state.slide;


    var previousMonth = subtractMonths(reference, 1);
    var nextMonth = addMonths(reference, 1);

    var weeks = [];
    var day = new Date(start);
    var days = void 0;

    var _loop = function _loop() {
      if (day.getDay() === firstDayOfWeek) {
        if (days) {
          weeks.push(React.createElement(
            StyledWeek,
            { key: day.getTime(), theme: theme },
            days
          ));
        }
        days = [];
      }

      var dateString = day.toISOString();
      var content = day.getDate();
      var isActive = active && sameDay(day, active);
      var selected = false;
      var inRange = false;
      var background = void 0;

      var selectedState = withinDates(day, date || dates);
      if (selectedState === 2) {
        selected = true;
      } else if (selectedState === 1) {
        inRange = true;
      }
      var dayDisabled = withinDates(day, disabled);
      if (selected) {
        background = 'brand';
        content = React.createElement(
          'strong',
          null,
          content
        );
      } else if (inRange) {
        background = { color: 'brand', opacity: 'weak' };
      }

      days.push(React.createElement(
        StyledDayContainer,
        { key: day.getTime(), size: size, theme: theme },
        React.createElement(
          Button,
          {
            ref: function ref(_ref) {
              if (isActive) _this2.activeRef = _ref;
            },
            a11yTitle: day.toDateString(),
            plain: true,
            active: isActive,
            hoverIndicator: !dayDisabled,
            onClick: dayDisabled ? undefined : _this2.onClickDay(dateString)
          },
          React.createElement(
            StyledDay,
            {
              background: background,
              otherMonth: day.getMonth() !== reference.getMonth(),
              size: size,
              theme: theme
            },
            content
          )
        )
      ));
      day = addDays(day, 1);
    };

    while (day.getTime() < end.getTime()) {
      _loop();
    }
    weeks.push(React.createElement(
      StyledWeek,
      { key: day.getTime(), theme: theme },
      days
    ));

    return React.createElement(
      StyledCalendar,
      _extends({ size: size, theme: theme }, rest),
      React.createElement(
        Keyboard,
        {
          onUp: function onUp(event) {
            event.preventDefault();
            _this2.setActive(addDays(active, -7));
          },
          onDown: function onDown(event) {
            event.preventDefault();
            _this2.setActive(addDays(active, 7));
          },
          onLeft: function onLeft() {
            return _this2.setActive(addDays(active, -1));
          },
          onRight: function onRight() {
            return _this2.setActive(addDays(active, 1));
          }
        },
        React.createElement(
          Box,
          null,
          React.createElement(
            Box,
            { direction: 'row', justify: 'between', align: 'center' },
            React.createElement(
              Heading,
              { level: 3, size: size, margin: 'none' },
              React.createElement(
                'strong',
                null,
                reference.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
              )
            ),
            React.createElement(
              Box,
              { direction: 'row', align: 'center' },
              React.createElement(Button, {
                a11yTitle: previousMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
                icon: size === 'small' ? React.createElement(FormPrevious, null) : React.createElement(Previous, { size: size }),
                onClick: onSelect && betweenDates(previousMonth, bounds) ? function () {
                  return _this2.setReference(previousMonth);
                } : undefined
              }),
              React.createElement(Button, {
                a11yTitle: nextMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
                icon: size === 'small' ? React.createElement(FormNext, null) : React.createElement(Next, { size: size }),
                onClick: onSelect && betweenDates(nextMonth, bounds) ? function () {
                  return _this2.setReference(nextMonth);
                } : undefined
              })
            )
          ),
          React.createElement(
            StyledWeeksContainer,
            { size: size, theme: theme },
            React.createElement(
              StyledWeeks,
              { slide: slide, size: size, theme: theme },
              weeks
            )
          )
        )
      )
    );
  };

  return Calendar;
}(Component);

Calendar.defaultProps = {
  firstDayOfWeek: 0,
  size: 'medium'
};


if (process.env.NODE_ENV !== 'production') {
  doc(Calendar);
}

export default compose(withTheme)(Calendar);