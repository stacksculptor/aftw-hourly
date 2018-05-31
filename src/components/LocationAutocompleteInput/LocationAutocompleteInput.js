import React, { Component } from 'react';
import { any, arrayOf, bool, func, number, object, shape, string, oneOfType } from 'prop-types';
import { Field } from 'react-final-form';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { getPlacePredictions, getPlaceDetails } from '../../util/googleMaps';
import { ValidationError } from '../../components';

import css from './LocationAutocompleteInput.css';

const DEBOUNCE_WAIT_TIME = 200;
const KEY_CODE_ARROW_UP = 38;
const KEY_CODE_ARROW_DOWN = 40;
const KEY_CODE_ENTER = 13;
const KEY_CODE_TAB = 9;
const KEY_CODE_ESC = 27;
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const TOUCH_TAP_RADIUS = 5; // Movement within 5px from touch start is considered a tap

const Icon = () => (
  <svg
    className={css.iconSvg}
    width="21"
    height="22"
    viewBox="0 0 21 22"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      className={css.iconSvgGroup}
      transform="matrix(-1 0 0 1 20 1)"
      strokeWidth="2"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 14l5.241 5.241" />
      <circle cx="7.5" cy="7.5" r="7.5" />
    </g>
  </svg>
);

// Touch devices need to be able to distinguish touches for scrolling and touches to tap
const getTouchCoordinates = nativeEvent => {
  const touch = nativeEvent && nativeEvent.changedTouches ? nativeEvent.changedTouches[0] : null;
  return touch ? { x: touch.screenX, y: touch.screenY } : null;
};

// Renders the autocompletion prediction results in a list
const LocationPredictionsList = props => {
  const {
    rootClassName,
    className,
    predictions,
    highlightedIndex,
    onSelectStart,
    onSelectMove,
    onSelectEnd,
  } = props;
  if (predictions.length === 0) {
    return null;
  }

  /* eslint-disable jsx-a11y/no-static-element-interactions */
  const item = (prediction, index) => {
    const isHighlighted = index === highlightedIndex;

    return (
      <li
        className={isHighlighted ? css.highlighted : null}
        key={prediction.id}
        onTouchStart={e => onSelectStart(getTouchCoordinates(e.nativeEvent))}
        onMouseDown={() => onSelectStart()}
        onTouchMove={e => onSelectMove(getTouchCoordinates(e.nativeEvent))}
        onTouchEnd={() => onSelectEnd(index)}
        onMouseUp={() => onSelectEnd(index)}
      >
        {prediction.description}
      </li>
    );
  };
  /* eslint-enable jsx-a11y/no-static-element-interactions */

  const classes = classNames(rootClassName || css.predictionsRoot, className);

  return (
    <div className={classes}>
      <ul className={css.predictions}>{predictions.map(item)}</ul>
      <div className={css.poweredByGoogle} />
    </div>
  );
};

LocationPredictionsList.defaultProps = {
  rootClassName: null,
  className: null,
  highlightedIndex: null,
};

LocationPredictionsList.propTypes = {
  rootClassName: string,
  className: string,
  predictions: arrayOf(
    shape({
      id: string.isRequired,
      description: string.isRequired,
      place_id: string.isRequired,
    })
  ).isRequired,
  highlightedIndex: number,
  onSelectStart: func.isRequired,
  onSelectMove: func.isRequired,
  onSelectEnd: func.isRequired,
};

// Get the current value with defaults from the given
// LocationAutocompleteInput props.
const currentValue = props => {
  const value = props.input.value || {};
  const { search = '', predictions = [], selectedPlaceId = null, selectedPlace = null } = value;
  return { search, predictions, selectedPlaceId, selectedPlace };
};

/*
  Location auto completion input component

  This component can work as the `component` prop to Redux Form's
  <Field /> component. it takes a custom input value shape, and
  controls the onChanged callback that is called with the value to
  syncronise to the form's Redux store.

  The component works by listening to the underlying input component
  and calling the Google Maps Places API for predictions. When the
  predictions arrive, those are passed to Redux Form in the onChange
  callback.

  See the LocationAutocompleteInput.example.js file for a usage
  example within a form.
*/
class LocationAutocompleteInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputHasFocus: false,
      selectionInProgress: false,
      touchStartedFrom: null,
      highlightedIndex: -1, // -1 means no highlight
    };

    // Ref to the input element.
    this.input = null;

    this.changeHighlight = this.changeHighlight.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.selectItemIfNoneSelected = this.selectItemIfNoneSelected.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handlePredictionsSelectStart = this.handlePredictionsSelectStart.bind(this);
    this.handlePredictionsSelectMove = this.handlePredictionsSelectMove.bind(this);
    this.handlePredictionsSelectEnd = this.handlePredictionsSelectEnd.bind(this);
    this.finalizeSelection = this.finalizeSelection.bind(this);

    // Debounce the method to avoid calling the API too many times
    // when the user is typing fast.
    this.predict = debounce(this.predict.bind(this), DEBOUNCE_WAIT_TIME, { leading: true });
  }

  // Interpret input key event
  onKeyDown(e) {
    if (e.keyCode === KEY_CODE_ARROW_UP) {
      // Prevent changing cursor position in input
      e.preventDefault();
      this.changeHighlight(DIRECTION_UP);
    } else if (e.keyCode === KEY_CODE_ARROW_DOWN) {
      // Prevent changing cursor position in input
      e.preventDefault();
      this.changeHighlight(DIRECTION_DOWN);
    } else if (e.keyCode === KEY_CODE_ENTER) {
      const { search, selectedPlace } = currentValue(this.props);

      if (search && !selectedPlace) {
        // Prevent form submit, try to select value instead.
        e.preventDefault();
        e.stopPropagation();
        this.selectItemIfNoneSelected();
      }
    } else if (e.keyCode === KEY_CODE_TAB) {
      this.selectItemIfNoneSelected();
    } else if (e.keyCode === KEY_CODE_ESC && this.input) {
      this.input.blur();
    }
  }

  // Handle input text change, fetch predictions if the value isn't empty
  onChange(e) {
    const onChange = this.props.input.onChange;
    const { predictions } = currentValue(this.props);
    const newValue = e.target.value;

    // Clear the current values since the input content is changed
    onChange({
      search: newValue,
      predictions: newValue ? predictions : [],
      selectedPlaceId: null,
      selectedPlace: null,
    });

    // Clear highlighted prediction since the input value changed and
    // results will change as well
    this.setState({ highlightedIndex: -1 });

    if (!newValue) {
      // No need to fetch predictions on empty input
      return;
    }

    this.predict(newValue);
  }

  // Change the currently highlighted item by calculating the new
  // index from the current state and the given direction number
  // (DIRECTION_UP or DIRECTION_DOWN)
  changeHighlight(direction) {
    this.setState((prevState, props) => {
      const { predictions } = currentValue(props);
      const currentIndex = prevState.highlightedIndex;
      let index = currentIndex;

      if (direction === DIRECTION_UP) {
        // Keep the first position if already highlighted
        index = currentIndex === 0 ? 0 : currentIndex - 1;
      } else if (direction === DIRECTION_DOWN) {
        index = currentIndex + 1;
      }

      // Check that the index is within the bounds
      if (index < 0) {
        index = -1;
      } else if (index >= predictions.length) {
        index = predictions.length - 1;
      }

      return { highlightedIndex: index };
    });
  }

  // Select the prediction in the given item. This will fetch the
  // place details and set it as the selected place.
  selectItem(index) {
    if (index < 0) {
      return;
    }
    const { predictions } = currentValue(this.props);
    if (index >= predictions.length) {
      return;
    }
    const prediction = predictions[index];
    const placeId = prediction.place_id;

    this.props.input.onChange({
      ...this.props.input,
      selectedPlaceId: placeId,
      selectedPlace: null,
    });

    getPlaceDetails(placeId)
      .then(place => {
        this.props.input.onChange({
          search: prediction.description,
          predictions: [],
          selectedPlaceId: placeId,
          selectedPlace: place,
        });
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
        this.props.input.onChange({
          ...this.props.input.value,
          selectedPlaceId: null,
          selectedPlace: null,
        });
      });
  }
  selectItemIfNoneSelected() {
    const { search, selectedPlaceId } = currentValue(this.props);
    if (search && !selectedPlaceId) {
      const index = this.state.highlightedIndex !== -1 ? this.state.highlightedIndex : 0;
      this.selectItem(index);
    }
  }
  predict(search) {
    const mapsLibLoaded = window.google && window.google.maps;
    if (!mapsLibLoaded) {
      throw new Error('Google Maps API must be loaded for LocationAutocompleteInput');
    }
    const onChange = this.props.input.onChange;
    getPlacePredictions(search)
      .then(results => {
        const { search: currentSearch } = currentValue(this.props);

        // If the earlier predictions arrive when the user has already
        // changed the search term, ignore and wait until the latest
        // predictions arrive. Without this logic, results for earlier
        // requests would override whatever the user had typed since.
        //
        // This is essentially the same as switchLatest in RxJS or
        // takeLatest in Redux Saga, without canceling the earlier
        // requests.
        if (results.search === currentSearch) {
          onChange({
            search: results.search,
            predictions: results.predictions,
            selectedPlaceId: null,
            selectedPlace: null,
          });
        }
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
        const value = currentValue(this.props);
        onChange({
          ...value,
          selectedPlaceId: null,
          selectedPlace: null,
        });
      });
  }

  finalizeSelection() {
    this.setState({ inputHasFocus: false, highlightedIndex: -1 });
    this.props.input.onBlur(currentValue(this.props));
  }

  handleOnBlur() {
    if (this.props.closeOnBlur && !this.state.selectionInProgress) {
      this.finalizeSelection();
    }
  }

  handlePredictionsSelectStart(touchCoordinates) {
    this.setState({
      selectionInProgress: true,
      touchStartedFrom: touchCoordinates,
      isSwipe: false,
    });
  }

  handlePredictionsSelectMove(touchCoordinates) {
    this.setState(prevState => {
      const touchStartedFrom = prevState.touchStartedFrom;
      const isTouchAction = !!touchStartedFrom;
      const isSwipe = isTouchAction
        ? Math.abs(touchStartedFrom.y - touchCoordinates.y) > TOUCH_TAP_RADIUS
        : false;

      return { selectionInProgress: false, isSwipe };
    });
  }

  handlePredictionsSelectEnd(index) {
    this.setState(prevState => {
      if (!prevState.isSwipe) {
        this.selectItem(index);
        this.finalizeSelection();
      }
      return { selectionInProgress: false, touchStartedFrom: null, isSwipe: false };
    });
  }

  render() {
    const {
      autoFocus,
      rootClassName,
      className,
      iconClassName,
      inputClassName,
      predictionsClassName,
      validClassName,
      placeholder,
      input,
      meta,
      inputRef,
    } = this.props;
    const { name, onFocus } = input;
    const { search, predictions } = currentValue(this.props);
    const { touched, valid } = meta || {};
    const isValid = valid && touched;

    const handleOnFocus = e => {
      this.setState({ inputHasFocus: true });
      onFocus(e);
    };

    const rootClass = classNames(rootClassName || css.root, className);
    const iconClass = classNames(iconClassName || css.icon);
    const inputClass = classNames(inputClassName || css.input, { [validClassName]: isValid });
    const predictionsClass = classNames(predictionsClassName);

    // Only render predictions when the input has focus. For
    // development and easier workflow with the browser devtools, you
    // might want to hardcode this to `true`. Otherwise the dropdown
    // list will disappear.
    const renderPredictions = this.state.inputHasFocus;

    return (
      <div className={rootClass}>
        <div className={iconClass}>
          <Icon />
        </div>
        <input
          className={inputClass}
          type="search"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          name={name}
          value={search}
          onFocus={handleOnFocus}
          onBlur={this.handleOnBlur}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          ref={node => {
            this.input = node;
            if (inputRef) {
              inputRef(node);
            }
          }}
        />
        {renderPredictions ? (
          <LocationPredictionsList
            rootClassName={predictionsClass}
            predictions={predictions}
            highlightedIndex={this.state.highlightedIndex}
            onSelectStart={this.handlePredictionsSelectStart}
            onSelectMove={this.handlePredictionsSelectMove}
            onSelectEnd={this.handlePredictionsSelectEnd}
          />
        ) : null}
      </div>
    );
  }
}

LocationAutocompleteInput.defaultProps = {
  autoFocus: false,
  closeOnBlur: true,
  rootClassName: null,
  className: null,
  iconClassName: null,
  inputClassName: null,
  predictionsClassName: null,
  validClassName: null,
  placeholder: '',
  meta: null,
  inputRef: null,
};

LocationAutocompleteInput.propTypes = {
  autoFocus: bool,
  rootClassName: string,
  className: string,
  closeOnBlur: bool,
  iconClassName: string,
  inputClassName: string,
  predictionsClassName: string,
  validClassName: string,
  placeholder: string,
  input: shape({
    name: string.isRequired,
    value: oneOfType([
      shape({
        search: string,
        predictions: any,
        selectedPlace: propTypes.place,
      }),
      string,
    ]),
    onChange: func.isRequired,
    onFocus: func.isRequired,
    onBlur: func.isRequired,
  }).isRequired,
  meta: shape({
    valid: bool.isRequired,
    touched: bool.isRequired,
  }),
  inputRef: func,
};

export default LocationAutocompleteInput;

class LocationAutocompleteInputFieldComponent extends Component {
  render() {
    /* eslint-disable no-unused-vars */
    const { rootClassName, labelClassName, ...restProps } = this.props;
    const { input, label, meta, valueFromForm, ...otherProps } = restProps;
    /* eslint-enable no-unused-vars */

    const value = typeof valueFromForm !== 'undefined' ? valueFromForm : input.value;
    const locationAutocompleteProps = { label, meta, ...otherProps, input: { ...input, value } };
    const labelInfo = label ? (
      <label className={labelClassName} htmlFor={input.name}>
        {label}
      </label>
    ) : null;

    return (
      <div className={rootClassName}>
        {labelInfo}
        <LocationAutocompleteInput {...locationAutocompleteProps} />
        <ValidationError fieldMeta={meta} />
      </div>
    );
  }
}

LocationAutocompleteInputFieldComponent.defaultProps = {
  rootClassName: null,
  labelClassName: null,
  type: null,
  label: null,
};

LocationAutocompleteInputFieldComponent.propTypes = {
  rootClassName: string,
  labelClassName: string,
  input: shape({
    onChange: func.isRequired,
    name: string.isRequired,
  }).isRequired,
  label: string,
  meta: object.isRequired,
};

export const LocationAutocompleteInputField = props => {
  return <Field component={LocationAutocompleteInputFieldComponent} {...props} />;
};
