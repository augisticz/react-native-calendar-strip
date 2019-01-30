/**
 * Created by bogdanbegovic on 8/20/16.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { polyfill } from 'react-lifecycles-compat';
import moment from 'moment'
import {
  Text,
  View,
  LayoutAnimation,
  TouchableOpacity,
  Dimensions
} from "react-native";
import styles from "./Calendar.style.js";

const { width, height } = Dimensions.get('window')

class CalendarDay extends Component {
  static propTypes = {
    date: PropTypes.object.isRequired,
    onDateSelected: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    enabled: PropTypes.bool.isRequired,

    marking: PropTypes.any,
    markedDates: PropTypes.array,

    showDayName: PropTypes.bool,
    showDayNumber: PropTypes.bool,

    calendarColor: PropTypes.string,

    dateNameStyle: PropTypes.any,
    dateNumberStyle: PropTypes.any,
    weekendDateNameStyle: PropTypes.any,
    weekendDateNumberStyle: PropTypes.any,
    highlightDateNameStyle: PropTypes.any,
    highlightDateNumberStyle: PropTypes.any,
    disabledDateNameStyle: PropTypes.any,
    disabledDateNumberStyle: PropTypes.any,
    disabledDateOpacity: PropTypes.number,
    styleWeekend: PropTypes.bool,
    customStyle: PropTypes.object,

    daySelectionAnimation: PropTypes.object,
    allowDayTextScaling: PropTypes.bool
  };

  // Reference: https://medium.com/@Jpoliachik/react-native-s-layoutanimation-is-awesome-4a4d317afd3e
  static defaultProps = {
    daySelectionAnimation: {
      type: "", // animations disabled by default
      duration: 300,
      borderWidth: 1,
      borderHighlightColor: "black",
      highlightColor: "yellow",
      animType: LayoutAnimation.Types.easeInEaseOut,
      animUpdateType: LayoutAnimation.Types.easeInEaseOut,
      animProperty: LayoutAnimation.Properties.opacity,
      animSpringDamping: undefined // Only applicable for LayoutAnimation.Types.spring,
    },
    styleWeekend: true,
    showDayName: true,
    showDayNumber: true
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selected,
      ...this.calcSizes(props)
    };
  }

  componentDidUpdate(prevProps, prevState) {
    newState = {};
    let doStateUpdate = false;

    if (this.props.selected !== prevProps.selected) {
      if (this.props.daySelectionAnimation.type !== "") {
        let configurableAnimation = {
          duration: this.props.daySelectionAnimation.duration || 300,
          create: {
            type:
              this.props.daySelectionAnimation.animType ||
              LayoutAnimation.Types.easeInEaseOut,
            property:
              this.props.daySelectionAnimation.animProperty ||
              LayoutAnimation.Properties.opacity
          },
          update: {
            type:
              this.props.daySelectionAnimation.animUpdateType ||
              LayoutAnimation.Types.easeInEaseOut,
            springDamping: this.props.daySelectionAnimation.animSpringDamping
          },
          delete: {
            type:
              this.props.daySelectionAnimation.animType ||
              LayoutAnimation.Types.easeInEaseOut,
            property:
              this.props.daySelectionAnimation.animProperty ||
              LayoutAnimation.Properties.opacity
          }
        };
        LayoutAnimation.configureNext(configurableAnimation);
      }
      newState.selected = this.props.selected;
      doStateUpdate = true;
    }

    if (prevProps.size !== this.props.size) {
      newState = { ...newState, ...this.calcSizes(this.props) };
      doStateUpdate = true;
    }

    if (doStateUpdate) {
      this.setState(newState);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.selected !== nextProps.selected) {
      this.setState({ selected: nextProps.selected })
    }
  }

  calcSizes(props) {
    return {
      containerSize: Math.round(props.size),
      containerPadding: Math.round(props.size / 5),
      containerBorderRadius: Math.round(props.size / 2),
      dateNameFontSize: Math.round(props.size / 5),
      dateNumberFontSize: Math.round(props.size / 2.9)
    };
  }

  renderDots() {
    if (!this.props.markedDates || this.props.markedDates.length === 0) {
      return;
    }
    const marking = this.props.marking || {};
    const baseDotStyle = [styles.dot, styles.visibleDot];
    let validDots = <View style={[styles.dot]} />; // default empty view for no dots case

    if (marking.dots && Array.isArray(marking.dots) && marking.dots.length > 0) {
      // Filter out dots so that we we process only those items which have key and color property
      validDots = marking.dots.filter(d => (d && d.color)).map((dot, index) => {
        return (
          <View key={dot.key ? dot.key : index} style={[baseDotStyle,
            { backgroundColor: marking.selected && dot.selectedDotColor ? dot.selectedDotColor : dot.color }]} />
        );
      });
    }

    return (
      <View style={styles.dotsContainer}>
        {validDots}
      </View>
    );
  }

  renderTriangle = () => {
    triangleStyle = {
      position: 'absolute',
      top: 0,
      left: '38%',
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 7,
      borderRightWidth: 7,
      borderBottomWidth: 7,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#AD0B0E',
      transform: [
        { rotate: '180deg' }
      ]
    }

    if (this.props.showDayName && this.props.showDayNumber) {
      if (this.state.selected) {
        return <View style={triangleStyle} />
      }
    }

  }

  render() {
    // Defaults for disabled state
    let currentDateStyle = {}
    let dateNameStyle = [styles.dateName, this.props.enabled ? this.props.dateNameStyle : this.props.disabledDateNameStyle];
    let dateNumberStyle = [styles.dateNumber, this.props.enabled ? this.props.dateNumberStyle : this.props.disabledDateNumberStyle];
    let dateViewStyle = this.props.enabled
      ? [{ backgroundColor: "transparent" }]
      : [{ opacity: this.props.disabledDateOpacity }];

    let customStyle = this.props.customStyle;
    if (customStyle) {
      dateNameStyle.push(customStyle.dateNameStyle);
      dateNumberStyle.push(customStyle.dateNumberStyle);
      dateViewStyle.push(customStyle.dateContainerStyle);
    }
    if (this.props.enabled && this.state.selected) {
      // Enabled state
      //The user can disable animation, so that is why I use selection type
      //If it is background, the user have to input colors for animation
      //If it is border, the user has to input color for border animation
      switch (this.props.daySelectionAnimation.type) {
        case "background":
          dateViewStyle.push({ backgroundColor: 'transparent' });
          break;
        case "border":
          dateViewStyle.push({
            borderColor: this.props.daySelectionAnimation.borderHighlightColor,
            borderWidth: this.props.daySelectionAnimation.borderWidth
          });
          break;
        default:
          // No animation styling by default
          break;
      }

      dateNameStyle = [styles.dateName, this.props.dateNameStyle];
      dateNumberStyle = [styles.dateNumber, this.props.dateNumberStyle];
      if (
        this.props.styleWeekend &&
        (this.props.date.isoWeekday() === 6 ||
          this.props.date.isoWeekday() === 7)
      ) {
        dateNameStyle = [
          styles.weekendDateName,
          this.props.weekendDateNameStyle
        ];
        dateNumberStyle = [
          styles.weekendDateNumber,
          this.props.weekendDateNumberStyle
        ];
      }
      if (this.state.selected) {
        dateNameStyle = [styles.dateName, this.props.highlightDateNameStyle];
        dateNumberStyle = [
          styles.dateNumber,
          this.props.highlightDateNumberStyle
        ];
      }
    }

    if ((moment(this.props.date).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD'))) {
      // Enabled state
      //The user can disable animation, so that is why I use selection type
      //If it is background, the user have to input colors for animation
      //If it is border, the user has to input color for border animation
      switch (this.props.daySelectionAnimation.type) {
        case "background":
          dateViewStyle.push({ backgroundColor: this.props.daySelectionAnimation.highlightColor });
          break;
        case "border":
          dateViewStyle.push({
            borderColor: this.props.daySelectionAnimation.borderHighlightColor,
            borderWidth: this.props.daySelectionAnimation.borderWidth
          });
          break;
        default:
          // No animation styling by default
          break;
      }

      dateNameStyle = [styles.dateName, this.props.dateNameStyle];
      dateNumberStyle = [styles.dateNumber, this.props.dateNumberStyle];
      if (
        this.props.styleWeekend &&
        (this.props.date.isoWeekday() === 6 ||
          this.props.date.isoWeekday() === 7)
      ) {
        dateNameStyle = [
          styles.weekendDateName,
          this.props.weekendDateNameStyle
        ];
        dateNumberStyle = [
          styles.weekendDateNumber,
          this.props.weekendDateNumberStyle
        ];
      }

      if ((moment(this.props.date).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD')) && this.state.selected) {
        dateNameStyle = [styles.dateName, { color: '#AD0B0E' }];

        dateNumberStyle = [
          styles.dateNumber,
          {
            fontSize: this.props.highlightDateNumberStyle.fontSize,
            marginTop: 2.5,
            color: '#AD0B0E'
          }

        ];

        currentDateStyle.backgroundColor = 'transparent'
      } else if ((moment(this.props.date).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD')) && !this.state.selected) {
        dateNameStyle = [styles.dateName, { color: '#EAD7D7' }];

        dateNumberStyle = [
          styles.dateNumber,
          {
            fontSize: this.props.highlightDateNumberStyle.fontSize,
            marginTop: 2.5,
            color: '#EAD7D7'
          }

        ];

        currentDateStyle.backgroundColor = 'transparent'
      }
    }

    let responsiveDateContainerStyle = {
      width: this.state.containerSize,
      height: this.state.containerSize,
      borderRadius: this.state.containerBorderRadius,
      padding: this.state.containerPadding
    };

    return (
      <TouchableOpacity
        onPress={this.props.onDateSelected.bind(this, this.props.date)}
      >
        {this.renderTriangle()}
        <View
          key={this.props.date}
          style={[
            styles.dateContainer,
            responsiveDateContainerStyle
          ]}
        >
          {this.props.showDayName && (
            <Text
              style={[dateNameStyle, { fontSize: this.state.dateNameFontSize }]}
              allowFontScaling={this.props.allowDayTextScaling}
            >
              {this.props.date.format("ddd").toUpperCase().substring(0, 2)}
            </Text>
          )}
          {this.props.showDayNumber && (
            <View style={[
              dateViewStyle,
              currentDateStyle
            ]}>
              <Text
                style={[
                  { fontSize: this.state.dateNumberFontSize },
                  dateNumberStyle
                ]}
                allowFontScaling={this.props.allowDayTextScaling}
              >
                {this.props.date.date()}
              </Text>
              {this.renderDots()}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

polyfill(CalendarDay);

export default CalendarDay;
