'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FeatherScroll = function (_Component) {
  _inherits(FeatherScroll, _Component);

  // props: {
  //   className: string,
  //   elementHeight: number,
  //   loadBuffer: number,
  //   bufferFactor: number,
  //   isLoading: boolean,
  //   inertialDelay: number,
  //   windowFactor: number,
  //   placeholder: any,
  //   handleLoad: ()=> void,
  // }

  function FeatherScroll(props) {
    _classCallCheck(this, FeatherScroll);

    var _this = _possibleConstructorReturn(this, (FeatherScroll.__proto__ || Object.getPrototypeOf(FeatherScroll)).call(this, props));

    _this.handleScrollWrapper = function () {
      _this.handleScroll(_this.getScrollTop());
    };

    var state = _this.getStateFromProps(props);
    _this.state = _extends({}, state, { scrollTimeout: null, isScrolling: false });
    return _this;
  }

  // scroll control subscription and getter


  _createClass(FeatherScroll, [{
    key: 'subscribeToScroll',
    value: function subscribeToScroll() {
      window.addEventListener('scroll', this.handleScrollWrapper);
    }
  }, {
    key: 'unsubscribeFromScroll',
    value: function unsubscribeFromScroll() {
      window.removeEventListener('scroll', this.handleScrollWrapper);
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      return window.pageYOffset;
    }

    // view getters

    // returns the scrolling height of the container

  }, {
    key: 'getScrollMax',
    value: function getScrollMax(elementHeight, elementCount) {
      return elementHeight * elementCount;
    }
    // finds first visible element

  }, {
    key: 'getViewStart',
    value: function getViewStart(viewTop, elementHeight) {
      return Math.floor(viewTop / elementHeight);
    }
    // finds last visible element

  }, {
    key: 'getViewEnd',
    value: function getViewEnd(viewBottom, elementHeight) {
      return Math.floor(viewBottom / elementHeight);
    }

    // calculates the height for the top and bottom pads.

  }, {
    key: 'getPadding',
    value: function getPadding(viewStart, viewEnd, elementHeight, elementCount) {
      return {
        paddingTop: Math.ceil(viewStart * elementHeight),
        paddingBottom: Math.ceil((elementCount - viewEnd + 1) * elementHeight)
      };
    }

    // calculate component state

  }, {
    key: 'getStateFromProps',
    value: function getStateFromProps(props) {
      var children = props.children,
          isLoading = props.isLoading,
          bufferFactor = props.bufferFactor,
          elementHeight = props.elementHeight,
          loadBuffer = props.loadBuffer,
          windowFactor = props.windowFactor,
          placeholder = props.placeholder;

      var childCount = _react2.default.Children.count(children);
      var range = window.innerHeight * bufferFactor * windowFactor;
      var viewState = this.getViewState(range, childCount, elementHeight, windowFactor);
      return _extends({ childCount: childCount, isLoading: isLoading, bufferFactor: bufferFactor, loadBuffer: loadBuffer, elementHeight: elementHeight, range: range, windowFactor: windowFactor, placeholder: placeholder }, viewState);
    }

    //calculate viewing state

  }, {
    key: 'getViewState',
    value: function getViewState(range, elementCount, elementHeight, windowFactor) {
      var falseStart = window.innerHeight * (1 - windowFactor);
      var batchStart = this.getScrollTop();
      var batchEnd = batchStart + range;
      var scrollMax = this.getScrollMax(elementHeight, elementCount);
      var viewTop = Math.max(0, batchStart - range + falseStart);
      var viewBottom = Math.min(scrollMax, batchEnd + falseStart);
      return {
        visibleStart: this.getViewStart(viewTop, elementHeight),
        visibleEnd: this.getViewEnd(viewBottom, elementHeight)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.subscribeToScroll();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState(this.getStateFromProps(nextProps));
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var _state = this.state,
          childCount = _state.childCount,
          range = _state.range,
          height = _state.elementHeight,
          windowFactor = _state.windowFactor;

      var hasLoadedKids = childCount !== prevState.childCount;
      if (hasLoadedKids) {
        var newViewState = this.getViewState(range, childCount, height, windowFactor);
        this.setState(newViewState);
        this.shouldImmediatelyLoad();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.unsubscribeFromScroll();
    }
  }, {
    key: 'scrollCooloff',

    // force state to stay in 'scrolling' mode to deal with OSX inertial scrolling
    value: function scrollCooloff() {
      var _this2 = this;

      var scrollTimeout = this.state.scrollTimeout;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      var id = setTimeout(function () {
        _this2.setState({ isScrolling: false, scrollTimeout: undefined });
      }, this.props.inertialDelay);

      this.setState({ isScrolling: true, scrollTimeout: id });
    }
  }, {
    key: 'shouldLoad',
    value: function shouldLoad(scrollTop) {
      var _state2 = this.state,
          count = _state2.childCount,
          loadBuffer = _state2.loadBuffer,
          height = _state2.elementHeight;

      var position = this.getScrollMax(height, count) - window.innerHeight;
      return scrollTop > position - loadBuffer;
    }
  }, {
    key: 'handleLoad',
    value: function handleLoad() {
      var _this3 = this;

      this.setState({ isLoading: true }, function () {
        return _this3.props.handleLoad();
      });
    }
  }, {
    key: 'handleScroll',
    value: function handleScroll(scrollTop) {
      this.scrollCooloff();

      var _state3 = this.state,
          range = _state3.range,
          childCount = _state3.childCount,
          height = _state3.elementHeight,
          windowFactor = _state3.windowFactor;

      var newViewState = this.getViewState(range, childCount, height, windowFactor);

      if (this.props.handleLoad && this.shouldLoad(scrollTop) && !this.state.isLoading) {
        this.setState(_extends({}, newViewState));
        this.handleLoad();
      } else {
        this.setState(_extends({}, newViewState));
      }
    }
  }, {
    key: 'shouldImmediatelyLoad',
    value: function shouldImmediatelyLoad() {
      var _state4 = this.state,
          count = _state4.childCount,
          height = _state4.elementHeight;

      if (this.getScrollMax(height, count) < window.innerHeight) {
        this.handleLoad();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _state5 = this.state,
          visibleStart = _state5.visibleStart,
          visibleEnd = _state5.visibleEnd,
          childCount = _state5.childCount,
          isScrolling = _state5.isScrolling,
          isLoading = _state5.isLoading,
          height = _state5.elementHeight,
          placeholder = _state5.placeholder;
      var children = this.props.children;

      var elements = childCount > 1 ? children.slice(visibleStart, visibleEnd + 1) : children;

      var padding = this.getPadding(visibleStart, visibleEnd, height, childCount);
      var wrapperStyles = isScrolling ? _extends({}, padding, { pointerEvents: 'none' }) : _extends({}, padding);

      return _react2.default.createElement(
        'div',
        { className: this.props.className },
        _react2.default.createElement(
          'div',
          { style: padding },
          elements,
          isLoading ? placeholder : null
        )
      );
    }
  }]);

  return FeatherScroll;
}(_react.Component);

exports.default = FeatherScroll;


FeatherScroll.defaultProps = {
  handleLoad: function handleLoad() {},
  isLoading: false,
  inertialDelay: 150,
  className: '',
  bufferFactor: 1,
  loadBuffer: 500,
  windowFactor: 1,
  placeholder: _react2.default.createElement(
    'div',
    null,
    'LOADING...'
  )
};
module.exports = exports['default'];