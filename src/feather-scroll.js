import React, { Component } from 'react';

export default class FeatherScroll extends Component {
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

  constructor(props) {
    super(props);
    const state = this.getStateFromProps(props);
    this.state = { ...state, scrollTimeout: null, isScrolling: false };
  }

// scroll control subscription and getter
  subscribeToScroll() {
    window.addEventListener('scroll', this.handleScrollWrapper);
  }
  unsubscribeFromScroll() {
    window.removeEventListener('scroll', this.handleScrollWrapper);
  }
  getScrollTop() {
    return window.pageYOffset;
  }

// view getters

// returns the scrolling height of the container
  getScrollMax(elementHeight, elementCount) {
    return elementHeight * elementCount;
  }
// finds first visible element
  getViewStart(viewTop, elementHeight) {
    return Math.floor(viewTop / elementHeight);
  }
// finds last visible element
  getViewEnd(viewBottom, elementHeight) {
    return Math.floor(viewBottom / elementHeight);
  }

  // calculates the height for the top and bottom pads.
  getPadding(viewStart, viewEnd, elementHeight, elementCount) {
    return {
      paddingTop: Math.ceil(viewStart * elementHeight),
      paddingBottom: Math.ceil((elementCount - viewEnd + 1) * elementHeight)
    };
  }

// calculate component state
  getStateFromProps(props) {
    const { children, isLoading, bufferFactor, elementHeight, loadBuffer, windowFactor, placeholder } = props;
    const childCount = React.Children.count(children);
    const range = window.innerHeight * bufferFactor * windowFactor;
    const viewState = this.getViewState(range, childCount, elementHeight, windowFactor);
    return { childCount, isLoading, bufferFactor, loadBuffer, elementHeight, range, windowFactor, placeholder, ...viewState };
  }

//calculate viewing state
  getViewState(range, elementCount, elementHeight, windowFactor) {
    const falseStart = window.innerHeight * (1 - windowFactor);
    const batchStart = this.getScrollTop();
    const batchEnd = batchStart + range;
    const scrollMax = this.getScrollMax(elementHeight, elementCount);
    const viewTop = Math.max(0, batchStart - range + falseStart);
    const viewBottom = Math.min(scrollMax, batchEnd + falseStart);
    return {
      visibleStart: this.getViewStart(viewTop, elementHeight),
      visibleEnd: this.getViewEnd(viewBottom, elementHeight),
    };
  }

  componentDidMount() {
    this.subscribeToScroll();
  };

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps));
  };

  componentDidUpdate(prevProps,prevState) {
    const { childCount, range, elementHeight: height, windowFactor } = this.state;
    const hasLoadedKids = childCount !== prevState.childCount;
    if (hasLoadedKids) {
      const newViewState = this.getViewState(range, childCount, height, windowFactor);
      this.setState(newViewState);
      this.shouldImmediatelyLoad();
    }
  };

  componentWillUnmount() {
    this.unsubscribeFromScroll();
  };
// force state to stay in 'scrolling' mode to deal with OSX inertial scrolling
  scrollCooloff() {
    const { scrollTimeout }  = this.state;
    if (scrollTimeout) { clearTimeout(scrollTimeout); }

    const id = setTimeout(() => {
      this.setState({ isScrolling: false, scrollTimeout: undefined });
    }, this.props.inertialDelay);

    this.setState({ isScrolling: true, scrollTimeout: id });
  };

  shouldLoad(scrollTop) {
    const { childCount: count, loadBuffer, elementHeight: height } = this.state;
    const position = this.getScrollMax(height, count) - window.innerHeight;
    return scrollTop > position - loadBuffer;
  };

  handleLoad() {
    this.setState({ isLoading: true }, () => this.props.handleLoad());
  }

  handleScrollWrapper = () => {
    this.handleScroll(this.getScrollTop());
  }

  handleScroll(scrollTop) {
    this.scrollCooloff();

    const { range, childCount, elementHeight: height, windowFactor } = this.state;
    const newViewState = this.getViewState(range, childCount, height, windowFactor);

    if (this.props.handleLoad && this.shouldLoad(scrollTop) && !this.state.isLoading) {
      this.setState({...newViewState});
      this.handleLoad();
    } else {
      this.setState({...newViewState});
    }
  };

  shouldImmediatelyLoad() {
    const {childCount: count, elementHeight: height} = this.state;
    if (this.getScrollMax(height, count) < window.innerHeight) {
      this.handleLoad();
    }
  }

  render() {
    const { visibleStart, visibleEnd, childCount, isScrolling, isLoading, elementHeight: height, placeholder } = this.state;
    const { children } = this.props;
    const elements = do {
      if (childCount > 1) children.slice(visibleStart, visibleEnd + 1);
      else children;
    };

    const padding = this.getPadding(visibleStart, visibleEnd, height, childCount);
    const wrapperStyles = do {
      if (isScrolling) ({ ...padding, pointerEvents: 'none' });
      else ({ ...padding });
    }

    return (
      <div className={this.props.className}>
        <div style={padding}>
          {elements}
          {isLoading? placeholder : null}
        </div>
      </div>
    );
  }

}

 FeatherScroll.defaultProps = {
  handleLoad: () => {},
  isLoading: false,
  inertialDelay: 150,
  className: '',
  bufferFactor: 1,
  loadBuffer: 500,
  windowFactor: 1,
  placeholder: <div>LOADING...</div>,
};
