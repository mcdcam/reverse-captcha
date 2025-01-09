// Warning: This is my first proper React project, the code isn't great.

/* global BigInt */

import react from "react";
import React, { useState } from "react";
import ReactDOM from "react-dom";

import { usePopper } from "react-popper";

import { CountdownCircleTimer } from "react-countdown-circle-timer";

import "./index.css";

import logo from "./resources/logo.svg";
import check from "./resources/check.svg";

const Calculess = require("calculess");
const Calc = Calculess.prototype;

const sha256 = require("js-sha256");

// Generate pi before loading content, takes about half a second.
// We won't use more than 10k digits.
const pi = generate_pi(10000);

let popperObject;

const CaptchaChallenge = (props) => {
  return (
    <div>
      <input
        value={props.inputValue}
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
          <div className={props.headerColour}>
            <div className="popup-header-text">
              <h3>{props.challenge[0]}</h3>
              <h1>{props.challenge[1]}</h1>
              <h4>{props.challenge[2]}</h4>
            </div>
          </div>
          <div className="challenge">
            <CaptchaChallenge
              updateInputValue={props.updateInputValue}
              inputValue={props.inputValue}
              className="challenge-inner"
              submitOnEnter={props.submitOnEnter}
            />
          </div>
          <div className="popup-footer">
            <CountdownCircleTimer
              key={props.countdownKey}
              size={54}
              strokeWidth={6}
              isPlaying={props.isPlaying}
              duration={props.duration}
              colors={["#1a73e8", "#de5246", "#de5246"]}
              colorsTime={[props.duration, 1.5, 0]}
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
            className={"button " + props.buttonHidden}
            type="button"
            onClick={props.openChallenge}
            ref={setReferenceElement}
          ></button>
          <img
            className={"check " + props.checkHidden}
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
      duration: 8,
      checkHidden: "hidden",
      buttonHidden: "",
      headerColour: "popup-header",
      countdownKey: 0,
      inputValue: "",
      updateInputValue: this.updateInputValue,
      verifyInputValue: this.verifyInputValue,
      timeUp: this.timeUp,
      openChallenge: this.openChallenge,
      submitOnEnter: this.submitOnEnter,
      challenge: this.generateChallenge(),
      isPlaying: false,
      requiredCorrect: 2,
      numCorrect: 0,
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
      isPlaying: true,
    });
    this.showPopper();
  };

  updateInputValue = (evt) => {
    const val = evt.target.value;
    this.setState({
      inputValue: val,
    });
  };

  verifyInputValue = () => {
    if (this.state.headerColour !== "popup-header") {
      // this is horrible
      // FIXME: use a better method of storing/checking status/state
      return;
    }
    if (
      this.state.inputValue !== "" &&
      String(this.state.inputValue) === String(this.state.challenge[3])
    ) {
      this.showCorrect();
    } else {
      this.showError();
    }
  };

  timeUp = () => {
    this.setState({
      challenge: [
        "Hurry up, slowass",
        "try again",
        this.state.numCorrect + "/" + this.state.requiredCorrect + " complete",
        "",
      ],
      headerColour: "popup-header-red",
      inputValue: "",
      isPlaying: false,
    });
    setTimeout(() => this.refreshChallenge(), 2000);
  };

  showError = () => {
    this.setState({
      challenge: [
        "I dunno, you look pretty human to me",
        "try again",
        this.state.numCorrect + "/" + this.state.requiredCorrect + " complete",
        "",
      ],
      headerColour: "popup-header-red",
      inputValue: "",
      isPlaying: false,
      numCorrect: 0,
    });
    setTimeout(() => this.refreshChallenge(), 2000);
  };

  showCorrect = () => {
    if (this.state.numCorrect + 1 >= this.state.requiredCorrect) {
      this.challengesComplete();
    }
    this.setState({
      challenge: [
        "Hmmm, you might actually be a robot",
        "correct",
        this.state.numCorrect +
          1 +
          "/" +
          this.state.requiredCorrect +
          " complete",
        "",
      ],
      headerColour: "popup-header-green",
      inputValue: "",
      isPlaying: false,
      numCorrect: this.state.numCorrect + 1,
    });
    setTimeout(() => this.refreshChallenge(), 2000);
  };

  challengesComplete = () => {
    this.hidePopper();
    this.setState({
      checkHidden: "",
      buttonHidden: "hidden",
      isPlaying: false,
    });
  };

  refreshChallenge = () => {
    this.setState({
      duration: 4 + (this.state.duration - 4) * 0.9,
      headerColour: "popup-header",
      challenge: this.generateChallenge(),
      inputValue: "",
      countdownKey: this.state.countdownKey + 1,
      isPlaying: true,
    });
  };

  generateChallenge() {
    /*
        Challenge Types:
            - sqrt
            - pi
            - ln
            - power -- disabled
            - sha256
      
            <-------addded in v2------->
            - integral of random trig function between random values
            - sum of the first n digits of pi
            - floating point math
            - decompose vector
            - volume of a rhombicosidodecahedron
        */

    const types = [
      "sqrt",
      "pi",
      "ln",
      "sha",
      "integ",
      "float",
      "vector",
      "volume",
    ];
    const randomElement = types[Math.floor(Math.random() * types.length)];

    let topText;
    let bottomText;
    let answer;
    let footer;

    let randNum;

    switch (randomElement) {
      case "sqrt":
        topText = "Please enter the square root of";
        bottomText = Math.floor(Math.random() * 100000000);
        footer = "to 5 decimal places";
        answer = Math.sqrt(bottomText).toFixed(5);
        break;
      case "pi":
        topText = "Please enter the sum of";
        randNum = Math.round(Math.random() * 9000 + 1000);
        bottomText = "the first " + randNum + " digits of pi";
        footer = "after the decimal point";
        answer = String(pi)
          .split("")
          .slice(1, randNum + 1)
          .reduce((partial_sum, a) => partial_sum + Number(a), 0);
        break;
      case "ln":
        topText = "Please enter the natural log of";
        bottomText = Math.floor(Math.random() * 100000000);
        footer = "to 5 decimal places";
        answer = Math.log(bottomText).toFixed(5);
        break;
      case "pwr":
        topText = "Please enter";
        const num1 = Math.floor(Math.random() * 98 + 2);
        const num2 = (Math.random() * 10).toPrecision(6);
        bottomText = num1 + "^" + num2;
        footer = "as a number to 3 decimal places";
        answer = (num1 ** num2).toFixed(3);
        break;
      case "sha":
        topText = "Please enter the SHA-256 hash of";
        bottomText = '"' + Math.random().toString(36).substring(2, 15) + '"';
        footer = "hexadecimal encoded";
        answer = sha256(bottomText);
        break;
      case "integ":
        topText = "Please enter the definite integral of";
        const funcs = [Math.sin, Math.cos];
        const func = funcs[Math.floor(Math.random() * funcs.length)];
        randNum = Number((Math.random() * 95 + 5).toPrecision(3));
        bottomText =
          (func === Math.sin ? "sin(x)" : "cos(x)") + " from 0 to " + randNum;
        footer = "to 3 decimal places";
        answer = Calc.integral(
          0,
          randNum,
          (x) => {
            return func(x);
          },
          10000
        ).toFixed(3);
        break;
      case "vector":
        topText = "Please enter the horizontal component of";
        const magnitude = Number((Math.random() * 100).toPrecision(3));
        const angle = Number((Math.random() * 90).toPrecision(3));
        bottomText =
          "a vector with magnitude " +
          magnitude +
          " and direction " +
          angle +
          "°";
        footer = "to 3 decimal places";
        answer = (magnitude * Math.cos(angle * (Math.PI / 180))).toFixed(3);
        break;
      case "float":
        // find a floating point error
        randNum = Number((Math.random() * 9.9 + 0.1).toFixed(1));

        let errorNum = 0.1;
        let i = 0;
        while (
          String(randNum + errorNum) ===
          String(parseFloat((randNum + errorNum).toFixed(10)))
        ) {
          if (i > 100) {
            randNum = Number((Math.random() * 9.9 + 0.1).toFixed(1));
            errorNum = 0.1;
            i = 0;
          }
          errorNum = Number((errorNum + 0.1).toFixed(1));
          i++;
        }

        topText = "Please enter the result of";
        bottomText = randNum + " + " + errorNum;
        footer = "according to the people at IEEE";
        answer = Number(randNum) + errorNum;
        break;
      case "volume":
        randNum = Number((Math.random() * 99 + 1).toFixed(0));
        topText = "Please enter the volume of a";
        bottomText = "rhombicosidodecahedron with edge length " + randNum;
        footer = "to 2 decimal places";
        answer = ((randNum ** 3 / 3) * (60 + 29 * Math.sqrt(5))).toFixed(2);
        break;
      default:
        throw new Error(`No challenge of type ${randomElement} exists`);
    }
    return [topText, bottomText, footer, answer];
  }

  render() {
    return (
      <CaptchaInner
        showPopper={this.state.showPopper}
        opacity={this.state.opacity}
        duration={this.state.duration}
        checkHidden={this.state.checkHidden}
        buttonHidden={this.state.buttonHidden}
        headerColour={this.state.headerColour}
        countdownKey={this.state.countdownKey}
        challenge={this.state.challenge}
        inputValue={this.state.inputValue}
        updateInputValue={this.state.updateInputValue}
        verifyInputValue={this.state.verifyInputValue}
        timeUp={this.state.timeUp}
        openChallenge={this.state.openChallenge}
        submitOnEnter={this.state.submitOnEnter}
        isPlaying={this.state.isPlaying}
      ></CaptchaInner>
    );
  }
}

ReactDOM.render(<Captcha />, document.getElementById("root"));

//------------------> Helper Functions <------------------\\

// Generate `n` decimal places of pi (plus the leading 3).
// The returned value is a BigInt, e.g. generate_pi(2) = 314n
function generate_pi(n) {
  n += 20;
  let i = 1n;
  let x = 3n * 10n ** BigInt(n);
  let pi = x;
  while (x > 0) {
    x = (x * i) / ((i + 1n) * 4n);
    pi += x / (i + 2n);
    i += 2n;
  }
  return pi / 10n ** 20n;
}
