# featherScroll
a react infinite scroll container with constant space complexity

# Props
* className: {string}, a CSS Class to be applied to the outer container
* elementHeight: {number}, the pixel height of the repeating elements
* loadBuffer: {number}, number of pixels from the bottom of the list the component should trigger a load from.
* bufferFactor: {number}, a factor (1+) denoting how many additional list elements should be rendered. a factor of 1 will render no additional components, giving no loading buffer. a factor of 2 will render three times as many components as are visible, with an extra set on either side of the visible group. Suggested factor is 1.5-2.  
* isLoading: {boolean}, whether or not the container is loading
* inertialDelay: {number}, time in ms to prevent retriggering scroll events
* windowFactor: {number}, a factor (0 - 1) denoting how much of the window a small scale scroll container takes up.
* placeholder: JSX, a loader animation to be displayed while loading more assets.
* handleLoad: {Function}, function to trigger when loading.




**WIP**
