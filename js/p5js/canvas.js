let xOffset = 0.0;
let yOffset = 0.0;
let locked = false;
let touchedState = null;
let touchedTransition = null;
let currentTransition = null;
let writingText = false;
let stateRadius = 50;
let nextCircleID = 0;

//lista de estados
let states = [];

//lista de transições
let transitions = [];

//lista de transições ainda inacabadas
let arrows = [];

class myCircle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = nextCircleID++;
    this.hover = false;
    this.editing = false;
    this.text = this.id;
  }

  display() {
    push();
    if (this.editing) {
      stroke(255, 119, 51);
      fill(255, 187, 153);
    } else if (this.hover) {
      stroke(250, 100, 100);
      fill(255, 204, 204);
    } else {
      stroke(100, 100, 100);
      fill(200, 200, 200);
    }
    strokeWeight(3);
    ellipse(this.x, this.y, 2 * stateRadius);
    pop();
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y);
  }
}

class myTransition {
  constructor(originState, destinyState) {
    this.originState = originState;
    this.destinyState = destinyState;
    this.hover = false;
    this.editing = false;
    this.text = 'a,b';
  }

  display() {
    var originVector = createVector(this.originState.x, this.originState.y);
    var destinyVector;
    if (this.destinyState === null) {
      let fillColor = color(217, 217, 217);
      destinyVector = createVector(mouseX, mouseY);
      this.drawArrow(originVector, destinyVector, fillColor, true);
    } else {
      let fillColor = (this.hover) ? color(250, 100, 100) : color(51, 51, 51);
      destinyVector = createVector(this.destinyState.x, this.destinyState.y);
      this.drawArrow(originVector, destinyVector, fillColor, false);
    }
  }

  // draw an arrow for a vector at a given base position
  drawArrow(base, vec, myColor, unfinished) {
    var resultVector = createVector(vec.x - base.x, vec.y - base.y);
    push();

    strokeWeight(3);
    if (this.editing) {
      stroke(255, 119, 51);
      fill(255, 119, 51);
    } else {
      fill(myColor);
      stroke(myColor);
    } 
    
    translate(base.x, base.y);
    line(0, 0, resultVector.x, resultVector.y);
    rotate(resultVector.heading());
    let arrowSize = 10;

    if (unfinished) {
      translate(resultVector.mag() - arrowSize, 0);
    } else {
      this.drawTransitionText(resultVector);
      translate(resultVector.mag() - arrowSize - stateRadius, 0);
      noStroke();
    }

    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  drawTransitionText(arrow) {
    push();
    rotate(-arrow.heading());
    textAlign(CENTER, CENTER);  
    textStyle(BOLD);
    stroke(255, 255, 255);
    translate(arrow.x/2, arrow.y/2);
    text(this.text, 0, 0);
    pop();
  }
}

function setup() {
  var cnv = createCanvas(1500, 800);
  cnv.parent("sketchHolder");
  rectMode(RADIUS);
  print(random(50));
}

function draw() {
  background(255);

  //reset states hover 
  for (let s of states) {
    s.hover = false;
  }
  //hover touched state if any
  if (!locked) {
    touchedState = cursorInsideAnyCircle();
  }
  if (!writingText && touchedState !== null) {
    touchedState.hover = true;
  }

  //reset transitions hover 
  for (let t of transitions) {
    t.hover = false;
  }

  //hover touched transition if any
  if (!writingText && touchedTransition !== null && currentTransition === null) {
    touchedTransition.hover = true;
  }

  touchedTransition = cursorInsideAnyTransition();

  //desenha as transições
  for (let i = 0; i < transitions.length; i++) {
    transitions[i].display();
  }

  //desenha os estados
  for (let i = 0; i < states.length; i++) {
    states[i].display();
  }

}

//check for any keyboard input
function keyTyped() {
  touchedState = cursorInsideAnyCircle();
  touchedTransition = cursorInsideAnyTransition();

  //state control
  if (!writingText && key === 's') {
    if (touchedState !== null) { //delete state
      deleteState(touchedState);
    } else { //create state
      states.push(new myCircle(mouseX, mouseY, 50));
    }

    //transition control
  } else if (!writingText && key === 't') {
    if (touchedState !== null) {
      if (currentTransition !== null) { //fixate transition
        currentTransition.destinyState = touchedState;
        deleteTransitionDuplicates(currentTransition);
        currentTransition = null;
      } else { //create transition
        var transition = new myTransition(touchedState, null);
        transitions.push(transition);
        currentTransition = transitions[transitions.length - 1];
      }
    } else if (touchedState === null) {
      if (currentTransition !== null) { //cancel current transition
        deleteTransition(currentTransition);
        currentTransition = null;
      } else if (touchedTransition !== null) { //delete touched transition
        deleteTransition(touchedTransition);
        touchedTransition = null;
      }

    }

  //write control 
  } else if (!writingText && key === 'w' && currentTransition === null) {
    if (touchedState !== null) { //write to state
      writingText = true;
      editStateText(touchedState);
    } else if (touchedTransition !== null) { //write to transition
      writingText = true;
      editTransitionText(touchedTransition);
    }

    //print info about current states and transitions
  } else if (!writingText && key === 'i') {
    printInfo();
  }
}

function editStateText(s) {
  s.editing = true;
  let inp = createInput(s.text.toString(10));
  inp.position(50, 50);
  inp.parent("sketchHolder");

  button = createButton('Submit');
  button.position(inp.x + inp.width, 50);
  button.parent("sketchHolder");

  button.mousePressed(function() {
    let index = states.indexOf(s);
    states[index].text = inp.value();
    states[index].editing = false;
    writingText = false;
    button.remove();
    inp.remove();
  });
}

function editTransitionText(t) {
  t.editing = true;
  let inp = createInput(t.text);
  inp.position(50, 50);
  inp.parent("sketchHolder");


  button = createButton('Submit');
  button.position(inp.x + inp.width, 50);
  button.parent("sketchHolder");

  button.mousePressed(function() {
    let index = transitions.indexOf(t);
    transitions[index].text = inp.value();
    transitions[index].editing = false;
    writingText = false;
    button.remove();
    inp.remove();
  });
}

function mousePressed() {
  if (!writingText && touchedState !== null && locked === false) {
    locked = true;
    xOffset = mouseX - touchedState.x;
    yOffset = mouseY - touchedState.y;
  }
}

function mouseDragged() {
  if (!writingText && touchedState !== null && locked === true) {
    touchedState.x = mouseX - xOffset;
    touchedState.y = mouseY - yOffset;
  }
}

function mouseReleased() {
  locked = false;
}

//check if cursor is inside any of the states
function cursorInsideAnyCircle() {
  for (let i = states.length - 1; i >= 0; i--) {
    if ((mouseX - states[i].x) * (mouseX - states[i].x) + (mouseY - states[i].y) * (mouseY - states[i].y) <= stateRadius * stateRadius) {
      return states[i];
    }
  }
  return null;
}

//check if cursor is inside any of the transitions
function cursorInsideAnyTransition() {
  for (let i = transitions.length - 1; i >= 0; i--) {
    if (transitions[i].destinyState === null || transitions[i].destinyState === null) {
      return false;
    }
    var d1 = dist(transitions[i].originState.x, transitions[i].originState.y, mouseX, mouseY);
    var d2 = dist(transitions[i].destinyState.x, transitions[i].destinyState.y, mouseX, mouseY);

    if (d1 <= stateRadius || d2 <= stateRadius) continue;

    const length = dist(transitions[i].originState.x, transitions[i].originState.y, transitions[i].destinyState.x, transitions[i].destinyState.y);

    const cond1 = (d1 + d2) - 0.5 <= length;
    const cond2 = (d1 + d2) + 0.5 >= length;

    if (cond1 && cond2) return transitions[i];
  }
  return null;
}

//delete given state from states array and all his transitions
function deleteState(state) {
  var stateID = state.id;
  var stateTransitions = getAllTransitionsOfState(stateID);
  for (let i = 0; i < stateTransitions.length; i++) {
    deleteTransition(stateTransitions[i]);
  }
  let index = states.indexOf(state);
  states.splice(index, 1);
}

//delete given transition from transitions array
function deleteTransition(transition) {
  let index = transitions.indexOf(transition);
  transitions.splice(index, 1);
}

//returns all transitions associated with a state by his id
function getAllTransitionsOfState(id) {
  var stateTransitions = [];
  for (let i = 0; i < transitions.length; i++) {
    if (transitions[i].originState.id === id || transitions[i].destinyState.id === id) {
      stateTransitions.push(transitions[i]);
    }
  }
  return stateTransitions;
}

//delete transition duplicates from transitions array
function deleteTransitionDuplicates(t) {
  //every new transition is already added to transitions array even before it is fixated,
  //a duplicate is present only if there is more than one copy of 't' in transitions
  var first = true;
  var duplicates = [];
  for (let i = 0; i < transitions.length; i++) {
    if (t.originState.id === transitions[i].originState.id && t.destinyState.id === transitions[i].destinyState.id) {
      if (first === true) {
        first = false;
      } else {
        duplicates.push(transitions[i]);
      }
    }
  }
  for (let i = 0; i < duplicates.length; i++) {
    let index = transitions.indexOf(duplicates[i]);
    transitions.splice(index, 1);
  }
}

//print current states and transitions
function printInfo() {
  print("Number os states: " + states.length);
  print("Number os transitions: " + transitions.length);
  print("CurrentStates: ");
  print(states);
  print("CurrentTransitions:");
  print(transitions);
}