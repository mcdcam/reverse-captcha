// My first proper react project
// Prepare for spaghetti code

import react from "react";
import React, { useState } from "react";
import ReactDOM from "react-dom";

import { usePopper } from "react-popper";

import { CountdownCircleTimer } from "react-countdown-circle-timer";

import "./index.css";

import logo from "./resources/logo.svg";
import check from "./resources/check.svg";

var popperObject;

var sha256 = require("js-sha256");

/* global BigInt */

const CaptchaChallenge = (props) => {
  return (
    <div>
      <input
        value={props.inputvalue}
        onChange={(evt) => props.updateInputValue(evt)}
        onKeyPress={(evt) => props.submitOnEnter(evt)}
        type={"text"}
        className="challenge-input"
      ></input>
    </div>
  );
};

const renderTime = ({ remainingTime }) => {
  if (remainingTime === 0) {
    return <div className="timer">:(</div>;
  }

  return (
    <div className="timer">
      <div className="value">{remainingTime}</div>
    </div>
  );
};

const CaptchaInner = (props) => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  popperObject = usePopper(referenceElement, popperElement, {
    placement: "right",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 16],
        },
      },
    ],
  });

  return (
    <div className="captcha">
      <div style={{ opacity: props.opacity }} className="popup-wrapper">
        <div
          className="popup"
          id="popup"
          data-show={props.showPopper}
          ref={setPopperElement}
          style={popperObject.styles.popper}
          {...popperObject.attributes.popper}
        >
          <div className={props.headercolor}>
            <div className="popup-header-text">
              <h3>{props.challenge[0]}</h3>
              <h1>{props.challenge[1]}</h1>
              <h4>{props.challenge[2]}</h4>
            </div>
          </div>
          <div className="challenge">
            <CaptchaChallenge
              updateInputValue={props.updateInputValue}
              inputvalue={props.inputvalue}
              className="challenge-inner"
              submitOnEnter={props.submitOnEnter}
            />
          </div>
          <div className="popup-footer">
            <CountdownCircleTimer
              key={props.countdownkey}
              size={54}
              strokeWidth={6}
              isPlaying={props.isplaying}
              duration={props.duration}
              colors={["#004777", "#F7B801", "#A30000"]}
              colorsTime={[5, 3, 0]}
              onComplete={props.timeUp}
            >
              {renderTime}
            </CountdownCircleTimer>
            <button
              type="button"
              onClick={props.verifyInputValue}
              id="submit-button"
              className="submit-button"
            >
              VERIFY
            </button>
          </div>
        </div>
      </div>
      <div className="button-area">
        <div className="grid-child button-wrapper">
          <button
            className={"button " + props.buttonhidden}
            type="button"
            onClick={props.openChallenge}
            ref={setReferenceElement}
          ></button>
          <img
            className={"check " + props.checkhidden}
            src={check}
            alt="checkmark"
          ></img>
        </div>
        <div className="grid-child-text">
          <p className="text">I'm a robot</p>
        </div>
        <div className="grid-child">
          <img className="logo" src={logo} alt="logo"></img>
        </div>
      </div>
    </div>
  );
};

class Captcha extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      opacity: 0,
      popperShown: undefined,
      duration: 5,
      checkhidden: "hidden",
      buttonhidden: "",
      headercolor: "popup-header",
      countdownkey: 0,
      inputvalue: "",
      updateInputValue: this.updateInputValue,
      verifyInputValue: this.verifyInputValue,
      timeUp: this.timeUp,
      openChallenge: this.openChallenge,
      submitOnEnter: this.submitOnEnter,
      challenge: this.generateChallenge(),
      isplaying: false,
    };
  }

  showPopper = () => {
    this.setState({
      showPopper: "",
      opacity: 1,
    });

    // We need to tell Popper to update the tooltip position
    // after we show the tooltip, otherwise it will be incorrect
    popperObject.update();
  };

  hidePopper = () => {
    this.setState({
      opacity: 0,
    });
    setTimeout(() => {
      this.setState({
        showPopper: undefined,
      });
    }, 200);
  };

  submitOnEnter = (evt) => {
    if (evt.key === "Enter") {
      this.verifyInputValue();
    }
  };

  openChallenge = () => {
    this.setState({
      isplaying: true,
    });
    this.showPopper();
  };

  updateInputValue = (evt) => {
    const val = evt.target.value;
    this.setState({
      inputvalue: val,
    });
  };

  verifyInputValue = () => {
    if (this.state.headercolor === "popup-header-red") {
      // this is horrible but i'm lazy
      return;
    }
    if (
      this.state.inputvalue !== "" &&
      String(this.state.inputvalue) === String(this.state.challenge[3])
    ) {
      this.hidePopper();
      this.setState({
        checkhidden: "",
        buttonhidden: "hidden",
        isplaying: false,
      });
    } else {
      this.showError();
      setTimeout(() => this.refreshChallenge(), 2000);
    }
  };

  timeUp = () => {
    this.setState({
      challenge: [
        "Hurry up, slowass",
        "try again",
        "​", //ZWS
        "",
      ],
      headercolor: "popup-header-red",
      inputvalue: "",
      isplaying: false,
    });
    setTimeout(() => this.refreshChallenge(), 2000);
  };

  showError = () => {
    this.setState({
      challenge: [
        "I dunno, you look pretty human to me",
        "try again",
        "​", //ZWS
        "",
      ],
      headercolor: "popup-header-red",
      inputvalue: "",
      isplaying: false,
    });
  };

  refreshChallenge = () => {
    this.setState({
      duration: 2 + (this.state.duration - 2) * 0.75,
      headercolor: "popup-header",
      challenge: this.generateChallenge(),
      inputvalue: "",
      countdownkey: this.state.countdownkey + 1,
      isplaying: true,
    });
  };

  generateChallenge() {
    /*
        - sqrt
        - pi
        - ln
        - power
        - sha256
        */

    var types = ["sqrt", "pi", "ln", "pwr", "sha"];

    const randomElement = types[Math.floor(Math.random() * types.length)];

    var topText;
    var bottomText;
    var answer;
    var footer;

    switch (randomElement) {
      case "sqrt":
        topText = "Please enter the square root of";
        bottomText = Math.floor(Math.random() * 100000000);
        footer = "to 5 decimal places";
        answer = (Math.sqrt(bottomText) + Number.EPSILON).toFixed(5);
        break;
      case "pi":
        topText = "Please enter";
        let rannum = Math.round(Math.random() * 900 + 100);
        bottomText = "the " + ordinal_suffix_of(rannum) + " digit of pi";
        footer = "after the decimal point";
        answer = nth_digit_of_pi(rannum);
        break;
      case "ln":
        topText = "Please enter the natural log of";
        bottomText = Math.floor(Math.random() * 100000000);
        footer = "to 5 decimal places";
        answer = (Math.log(bottomText) + Number.EPSILON).toFixed(5);
        break;
      case "pwr":
        topText = "Please enter";
        let num1 = Math.floor(Math.random() * 98 + 2);
        let num2 = (Math.random() * 10).toPrecision(6);
        bottomText = num1 + "^" + num2;
        footer = "as a number to 3 decimal places";
        answer = (num1 ** num2 + Number.EPSILON).toFixed(3);
        break;
      case "sha":
        topText = "Please enter the SHA-256 hash of";
        bottomText = Math.random().toString(36).substring(2, 15);
        footer = "hexadecimal encoded";
        answer = sha256(bottomText);
        break;
      default:
        console.log("Error: switch case no match");
    }
    return [topText, bottomText, footer, answer];
  }

  render() {
    return (
      <CaptchaInner
        showPopper={this.state.showPopper}
        opacity={this.state.opacity}
        duration={this.state.duration}
        checkhidden={this.state.checkhidden}
        buttonhidden={this.state.buttonhidden}
        headercolor={this.state.headercolor}
        countdownkey={this.state.countdownkey}
        challenge={this.state.challenge}
        inputvalue={this.state.inputvalue}
        updateInputValue={this.state.updateInputValue}
        verifyInputValue={this.state.verifyInputValue}
        timeUp={this.state.timeUp}
        openChallenge={this.state.openChallenge}
        submitOnEnter={this.state.submitOnEnter}
        isplaying={this.state.isplaying}
      ></CaptchaInner>
    );
  }
}

ReactDOM.render(<Captcha />, document.getElementById("root"));

//------------------> Helper Functions <------------------\\

function ordinal_suffix_of(i) {
  var j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}

function nth_digit_of_pi(n) {
  n += 20;
  let i = 1n;
  let x = 3n * 10n ** BigInt(n);
  let pi = x;
  while (x > 0) {
    x = (x * i) / ((i + 1n) * 4n);
    pi += x / (i + 2n);
    i += 2n;
  }
  return (pi / 10n ** 20n) % 10n;
}
