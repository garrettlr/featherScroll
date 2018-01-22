// @flow
import React, { Component } from 'react';

export default class FeatherScroll extends Component {
  props: {
    className: string,
    elementHeight: number,
    loadBuffer: number,
    renderFactor: number,
    isLoading: boolean,
    inertialDelay: number,
    handleLoad: ()=> void,
  }

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
  getScrollTop = () => window.pageYOffset;

// view getters

// returns the scrolling height of the container
  getScrollMax = (elementHeight, elementCount) => elementHeight * elementCount;
// finds first visible element
  getViewStart = (viewTop, elementHeight) => Math.floor(viewTop / elementHeight);
// finds last visible element
  getViewEnd = (viewBottom, elementHeight) => Math.floor(viewBottom / elementHeight);

  // calculates the height for the top and bottom pads.
  getPadding = (viewStart, viewEnd, elementHeight, elementCount) => ({
    paddingTop: Math.ceil(viewStart * elementHeight),
    paddingBottom: Math.ceil((elementCount - viewEnd + 1) * elementHeight)
  });

// calculate component state
  getStateFromProps = props => {
    const { children, isLoading, renderFactor, elementHeight, loadBuffer } = props;
    const childCount = React.Children.count(children);
    const range = window.innerHeight * renderFactor;
    const viewState = this.getViewState(range, childCount, elementHeight);
    return { childCount, isLoading, renderFactor, loadBuffer, elementHeight, range, ...viewState };
  }

//calculate viewing state
  getViewState = (range, elementCount, elementHeight) => {
    const activeBatch = Math.floor(this.getScrollTop() / range);
    const batchStart = range * activeBatch;
    const batchEnd = batchStart + range;
    const scrollMax = this.getScrollMax(elementHeight, elementCount);
    const viewTop = Math.max(0, batchStart - window.innerHeight);
    const viewBottom = Math.min(scrollMax, batchEnd + window.innerHeight);

    return {
      visibleStart: this.getViewStart(viewTop, elementHeight),
      visibleEnd: this.getViewEnd(viewBottom, elementHeight)
    };
  }

  componentDidMount = () => { this.subscribeToScroll(); };

  componentWillReceiveProps = (nextProps) => {
    this.setState(this.getStateFromProps(nextProps));
  };

  componentDidUpdate = (prevProps,prevState) => {
    const { childCount, range, elementHeight: height } = this.state;
    const loadedKids = childCount !== prevState.childCount;
    if (loadedKids) {
      const newViewState = this.getViewState(range, childCount, height);
      this.setState(newViewState);
    }
  };

  componentWillUnmount = () => { this.unsubscribeFromScroll(); };
// force state to stay in 'scrolling' mode to deal with OSX inertial scrolling
  scrollCooloff = () => {
    const { scrollTimeout }  = this.state;
    if (scrollTimeout) { clearTimeout(scrollTimeout); }

    const id = setTimeout(() => {
      this.setState({ isScrolling: false, scrollTimeout: undefined });
    }, this.props.inertialDelay);

    this.setState({ isScrolling: true, scrollTimeout: id });
  };

  shouldLoad = scrollTop => {
    const { childCount: count, loadBuffer, elementHeight: height } = this.state;
    const position = this.getScrollMax(height, count) - window.innerHeight;
    return scrollTop > position - loadBuffer;
  };

  handleLoad = () => this.setState({ isLoading: true }, () => this.props.handleLoad());

  handleScrollWrapper = () => this.handleScroll(this.getScrollTop());

  handleScroll = (scrollTop) => {
    this.scrollCooloff();

    const { range, childCount, elementHeight: height } = this.state;
    const newViewState = this.getViewState(range, childCount, height);

    if (this.shouldLoad(scrollTop) && !this.state.isLoading) {
      this.setState({...newViewState});
      this.handleLoad();
    } else {
      this.setState({...newViewState});
    }
  };

  render() {
    const placeholder = <div>LOADING...</div>
    const { visibleStart, visibleEnd, childCount, isScrolling, isLoading, elementHeight: height } = this.state;
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
        <div style={wrapperStyles}>
          {elements}
          {isLoading? placeholder : null}
        </div>
      </div>
    );
  }

}

 InfiniteScroll.defaultProps = {
  handleLoad: () => {},
  isLoading: false,
  inertialDelay: 150,
  className: '',
  renderFactor: 2,
  loadBuffer: 500,
};
