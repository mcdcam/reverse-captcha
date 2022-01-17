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

var Calculess = require('calculess');
var Calc = Calculess.prototype;

var popperObject;

var sha256 = require("js-sha256");

/* global BigInt */

// Generate pi before loading content, takes about half a second
var pi = generate_pi(10010);

// var demoindex = 0; // demo

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
      duration: 8,
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
      requiredcorrect: 2,
      numcorrect: 0,
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
    if (this.state.headercolor !== "popup-header") {
      // this is horrible but i'm lazy
      return;
    }
    if (
      this.state.inputvalue !== "" &&
      String(this.state.inputvalue) === String(this.state.challenge[3])
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
        this.state.numcorrect + "/" + this.state.requiredcorrect + " complete",
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
        this.state.numcorrect + "/" + this.state.requiredcorrect + " complete",
        "",
      ],
      headercolor: "popup-header-red",
      inputvalue: "",
      isplaying: false,
      numcorrect: 0,
    });
    setTimeout(() => this.refreshChallenge(), 2000);
  };

  showCorrect = () => {
    if (this.state.numcorrect + 1 >= this.state.requiredcorrect) {
      this.challengesComplete();
    }
    this.setState({
      challenge: [
        "Hmmm, you might actually be a robot",
        "correct",
        this.state.numcorrect+1 + "/" + this.state.requiredcorrect + " complete",
        "",
      ],
      headercolor: "popup-header-green",
      inputvalue: "",
      isplaying: false,
      numcorrect: this.state.numcorrect + 1,
    });
    setTimeout(() => this.refreshChallenge(), 2000);
  };

  challengesComplete = () => {
    this.hidePopper();
    this.setState({
      checkhidden: "",
      buttonhidden: "hidden",
      isplaying: false,
    });
  };

  refreshChallenge = () => {
    this.setState({
      duration: 4 + (this.state.duration - 4) * 0.85,
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
        - pi (see below)
        - ln
        - power (disabled because it's boring, feel free to add it back to `types`)
        - sha256
    <-------v2------->
        - integral of random trig function between random values
        - sum of the first n digits of pi
        - floating point math
        - decompose vector
        - volume of a rhombicosidodecahedron
        */

    var types = ["sqrt", "pi", "ln", "sha", 'integ', 'float', 'vector', 'wtf']; // prod
    const randomElement = types[Math.floor(Math.random() * types.length)]; //prod

    /*/-------------DEMO-------------//
    var demoorder = ["pi", 'vector', 'integ', 'float', 'wtf']; //demo
    const randomElement = demoorder[demoindex % demoorder.length]; // demo
    demoindex++; //demo
    //------------------------------/*/

    var topText;
    var bottomText;
    var answer;
    var footer;

    var rannum;

    switch (randomElement) {
      case "sqrt":
        topText = "Please enter the square root of";
        bottomText = Math.floor(Math.random() * 100000000);
        footer = "to 5 decimal places";
        answer = (Math.sqrt(bottomText) + Number.EPSILON).toFixed(5);
        break;
      case "pi":
        topText = "Please enter the sum of";
        rannum = Math.round(Math.random() * 9000 + 1000);
        bottomText = "the first " + rannum + " digits of pi";
        footer = "after the decimal point";
        answer = String(pi).split('').slice(1, rannum + 1).reduce((partial_sum, a) => partial_sum + Number(a), 0);
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
      case "integ":
        topText = "Please enter the integral of";
        let funcs = [Math.sin, Math.cos];
        let func = funcs[Math.floor(Math.random() * funcs.length)];
        rannum = Number((Math.random() * 95 + 5).toPrecision(3));
        bottomText = (func === Math.sin ? "sin(x)" : "cos(x)") + " for 0 < x < " + rannum;
        footer = "to 3 decimal places";
        answer = (Calc.integral(0, rannum, (x) => {return func(x)}, 10000) + Number.EPSILON).toFixed(3);
        break;
      case "vector":
        topText = "Please enter the horizontal component of";
        let magnitude = Number((Math.random()*100).toPrecision(3));
        let angle = Number((Math.random()*90).toPrecision(3));
        bottomText = "a vector with magnitude " + magnitude + " and direction " + angle + "°";
        footer = "to 3 decimal places";
        answer = (magnitude*Math.cos(angle*(Math.PI/180)) + Number.EPSILON).toFixed(3);
        break;
      case "float":
        // find floating point error
        rannum = (Math.random()*9.9+0.1).toFixed(1);
        let errornum = 0.1;
        let i = 0;
        // wow, i hate this
        while (String(Number(rannum) + errornum) === String(parseFloat((Number(rannum) + errornum).toFixed(10)))) {
          if (i > 100) {
            rannum = (Math.random()*9.9+0.1).toFixed(1);
            errornum = 0.1;
            i = 0;
          }
          errornum = Number((Number(errornum) + 0.1).toFixed(1));
          i++;
        }

        topText = "Please enter the result of";
        bottomText = rannum + ' + ' + errornum;
        footer = "according to javascript";
        answer = Number(rannum) + errornum;
        break;
      case "wtf":
        rannum = Number((Math.random() * 99 + 1).toFixed(0));
        topText = "Please enter the volume of a";
        bottomText = "rhombicosidodecahedron with edge length " + rannum;
        footer = "to 2 decimal places";
        answer = (((rannum**3)/3)*(60+29*Math.sqrt(5))).toFixed(2);
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
