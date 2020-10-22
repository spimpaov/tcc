let canvasWidth = 1280;
let canvasHeight = 720;
let xOffset = 0.0;
let yOffset = 0.0;
let locked = false;
let touchedState = null;
let touchedTransition = null;
let currentTransition = null;
let writingText = false;
let openHelper = false;
let writingStateText = false;
let writingTransitionText = false;
let stateRadius = 50;
let nextCircleID = 0;
let mouseInsideCanvas = false;
let knownAgents = ["a","b"];

//lista de estados
let states = [];

//lista de transições
let transitions = [];

//lista de transições ainda inacabadas
let arrows = [];

//variaveis para zoom e dragging
let zoom = 1.00;
let zMin = 0.05;
let zMax = 9.00;
let sensitivity = 0.05;
let offset = {"x": 0, "y": 0};
let dragging = false;
let lastMouse = {"x": 0, "y": 0};

class myCircle {
  constructor(x, y, variables, name = nextCircleID.toString()) {
    this.x = x;
    this.y = y;
    this.hover = false;
    this.editing = false;
    if (name !== undefined) {
      this.name = name
    }
    this.id = nextCircleID++;
    this.variables = variables;
  }

  display() {
    push();
    if (this.id == rootID) {
      strokeWeight(5);
    }
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
    ellipse(this.x, this.y, 2 * stateRadius);
    pop();
    push();
    textAlign(CENTER, CENTER);
    textSize(14);
    rectMode(CENTER);
    var displayText = this.name + ": [" + this.variables.join(", ") + "]";
    text(displayText, this.x, this.y, stateRadius*2, stateRadius*2);
    pop();
  }
}

class myTransition {
  constructor(originState, destinyState, agents = database.agents) {
    this.originState = originState;
    this.destinyState = destinyState;
    this.hover = false;
    this.editing = false;
    this.source = originState.name;
    this.agents = agents;
  }

  display() {
    var originVector = createVector(this.originState.x, this.originState.y);
    var destinyVector;
    if (this.destinyState === null) {
      let fillColor = color(217, 217, 217);
      var screenMousePos = worldSpaceToScreenSpace(mouseX, mouseY);
      destinyVector = createVector(screenMousePos.x, screenMousePos.y);
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
      triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    } else {
      this.drawTransitionText(resultVector);
      translate(resultVector.mag() - arrowSize - stateRadius, 0);
      noStroke();
    }
    pop();
  }

  drawTransitionText(arrow) {
    push();
    rotate(-arrow.heading());
    textAlign(CENTER, CENTER); 
    strokeWeight(5); 
    textStyle(BOLD);
    stroke(255, 255, 255);
    translate(arrow.x/2, arrow.y/2);
    text(this.agents, 0, 0);
    pop();
  }
}

function setup() {
  var cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent("sketchHolder");
  rectMode(RADIUS);

  //default graph
  updateAnnouncementHistory(null, null, 0);
  convertDatabaseToCanvasGraph();
}

function convertDatabaseToCanvasGraph() {
  var root = rootID;
  clearCanvas();

  // cria estados
  var xOffset = canvasWidth/2;
  var yOffset = canvasHeight/2;

  database.states.forEach(
    function (s, i) {
      var stateXPos = Math.cos(i * 360/database.states.length * 2 * Math.PI/360) * 300 + xOffset;
      var stateYPos = Math.sin(i * 360/database.states.length * 2 * Math.PI/360) * 300 + yOffset;
      createState(stateXPos, stateYPos, s.variables, s.name);
    }
  );

  // cria transições
  database.relations.forEach(
    function (r, i) {
      var sourceState = getStateByID(r.source);
      var targetState = getStateByID(r.target);
      if (sourceState !== null && targetState !== null && sourceState.id !== targetState.id) {
        createTransition(sourceState, targetState, r.agents);
      } 
    }
  );
  setStateAsRoot(root);
}

function draw() {
  background(240);

  //desenha texto durante modo de escrita
  if (writingStateText) {
    push();
    textSize(18);
    textAlign(RIGHT);
    text('Nome:', 195, 70);
    text('Variáveis:', 195, 105);
    pop();
  }

  if (writingTransitionText) {
    push();
    textSize(18);
    textAlign(RIGHT);
    text('Agentes:', 195, 70);
    pop();
  }

  translate(offset.x, offset.y);
  scale(zoom);

  mouseInsideCanvas = (mouseX >= 0 && mouseX <= canvasWidth && mouseY >= 0 && mouseY <= canvasHeight) ? true : false;

  //reset states hover 
  for (let s of states) {
    s.hover = false;
  }
  //hover touched state if any
  if (!locked) {
    touchedState = cursorInsideAnyCircle();
  }
  if (!writingText && !openHelper && touchedState !== null) {
    touchedState.hover = true;
  }

  //reset transitions hover 
  for (let t of transitions) {
    t.hover = false;
  }

  //hover touched transition if any
  if (!writingText && !openHelper && touchedTransition !== null && currentTransition === null) {
    touchedTransition.hover = true;
    var touchedTransitionSister = getSisterTransition(touchedTransition);
    if (touchedTransitionSister !== undefined) {
      touchedTransitionSister.hover = true;
    }
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
  if (!mouseInsideCanvas) {
    return;
  }
  touchedState = cursorInsideAnyCircle();
  touchedTransition = cursorInsideAnyTransition();

  //state control
  if (!writingText && !openHelper && (key === 's' || key === 'S')) {
    if (touchedState !== null) { //delete state
      deleteState(touchedState);
    } else { //create state
      var screenMousePos = worldSpaceToScreenSpace(mouseX, mouseY);
      createState(screenMousePos.x, screenMousePos.y, []);
    }

  //transition control
  } else if (!writingText && !openHelper && (key === 't' || key === 'T')) {
    if (touchedState !== null) {
      if (currentTransition !== null) { //fixate transition
        currentTransition.destinyState = touchedState;
        currentTransition.target = touchedState.name;
        var sisterTransition = createTransition(currentTransition.destinyState, currentTransition.originState);
        deleteTransitionDuplicates(currentTransition);
        deleteTransitionDuplicates(sisterTransition);
        currentTransition = null;
      } else { //create transition
        createTransition(touchedState, null);
      }
    } else if (touchedState === null) {
      if (currentTransition !== null) { //cancel current transition
        deleteTransition(currentTransition);
        currentTransition = null;
      } else if (touchedTransition !== null) { //delete touched transition
        var touchedTransitionSister = getSisterTransition(touchedTransition);
        deleteTransition(touchedTransition);
        deleteTransition(touchedTransitionSister);
        touchedTransition = null;
      }
    }

  //write control 
  } else if (!writingText && !openHelper && (key === 'w' || key === 'W') && currentTransition === null) {
    if (touchedState !== null) { //write to state
      writingText = true;
      editStateText(touchedState);
    } else if (touchedTransition !== null) { //write to transition
      writingText = true;
      editTransitionText(touchedTransition);
    }

  //define root
  } else if (!writingText && !openHelper && (key === 'r' || key === 'R') && touchedState !== null ) {
    setStateAsRoot(touchedState.id);

  //print info about current states and transitions
  } else if (!writingText && !openHelper && (key === 'i' || key === 'I')) {
    printInfo();
  }
}

function editStateText(s) {
  s.editing = true;
  writingStateText = true;
  let nameInput = createInput(s.name.toString(10));
  let variablesInput = createInput(s.variables.toString());

  nameInput.position(200, 50);
  nameInput.parent("sketchHolder");

  variablesInput.position(nameInput.x, nameInput.y + nameInput.height + 5);
  variablesInput.parent("sketchHolder");
  let button = createButton('OK!');
  button.position(variablesInput.x + variablesInput.width + 5, variablesInput.y);
  button.parent("sketchHolder");
  
  button.mousePressed(function() {
    let index = states.indexOf(s);
    states[index].name = nameInput.value();
    states[index].variables = variablesInput.value().replace(/\s/g,'').split(",");
    states[index].editing = false;
    writingText = false;
    writingStateText = false;
    button.remove();
    nameInput.remove();
    variablesInput.remove();
  });
}

function editTransitionText(t) {
  t.editing = true;
  var sisterTransition = getSisterTransition(t);
  if (sisterTransition !== undefined) {
    sisterTransition.editing = true;
  }
  writingTransitionText = true;
  let inp = createInput(t.agents.toString());
  inp.position(200, 50);
  inp.parent("sketchHolder");

  button = createButton('OK!');
  button.position(inp.x + inp.width + 5, inp.y);
  button.parent("sketchHolder");

  button.mousePressed(function() {
    let index = transitions.indexOf(t);
    transitions[index].agents = inp.value().replace(/\s/g,'').split(",");
    transitions[index].editing = false;
    var sisterTransition = getSisterTransition(t);
    if (sisterTransition !== undefined) {
      let sisterIndex = transitions.indexOf(sisterTransition);
      transitions[sisterIndex].agents = inp.value().replace(/\s/g,'').split(",");
      transitions[sisterIndex].editing = false;
    }
    writingText = false;
    writingTransitionText = false;
    button.remove();
    inp.remove();
  });
}

function setStateAsRoot(id) {
  rootID = id;
} 

function mousePressed() {
  if (!writingText && !openHelper && touchedState !== null && locked === false) {
    locked = true;
    var screenMousePos = worldSpaceToScreenSpace(mouseX, mouseY)
    xOffset = screenMousePos.x - touchedState.x;
    yOffset = screenMousePos.y - touchedState.y;
  }
  else {
    dragging = true;
    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
  }
}

function mouseDragged() {
  if (!writingText && !openHelper && touchedState !== null && locked === true) {
    var screenMousePos = worldSpaceToScreenSpace(mouseX, mouseY)
    touchedState.x = screenMousePos.x - xOffset;
    touchedState.y = screenMousePos.y - yOffset;
  } 
  else if (!writingText && !openHelper && dragging && mouseInsideCanvas) {
    offset.x += (mouseX - lastMouse.x);
    offset.y += (mouseY - lastMouse.y);
    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
  }
}

function mouseReleased() {
  locked = false;
  dragging = false;
}

function mouseWheel(event) {
  if (mouseInsideCanvas) {
    if (!writingText && !openHelper) {
      zoom += sensitivity * event.delta;
      zoom = constrain(zoom, zMin, zMax);
    }
    return false;
  }
  return true;
}

//check if cursor is inside any of the states
function cursorInsideAnyCircle() {
  var mousePos = createVector(mouseX, mouseY);
  for (let i = states.length - 1; i >= 0; i--) {
    var statePos = screenSpaceToWorldSpace(states[i].x, states[i].y);
    if ((mousePos.x - statePos.x) * (mousePos.x - statePos.x) + (mousePos.y - statePos.y) * (mousePos.y - statePos.y) <= stateRadius * stateRadius * zoom * zoom) {
      return states[i];
    }
  }
  return null;
}

function screenSpaceToWorldSpace(xPos, yPos) {
  var x = (xPos * zoom) + offset.x;
  var y = (yPos * zoom) + offset.y;
  return createVector(x, y);
}

function worldSpaceToScreenSpace(xPos, yPos) {
  var x = (xPos - offset.x) / zoom;
  var y = (yPos - offset.y) / zoom;
  return createVector(x, y);
}

//check if cursor is inside any of the transitions
function cursorInsideAnyTransition() {
  for (let i = transitions.length - 1; i >= 0; i--) {
    if (transitions[i].destinyState === null || transitions[i].destinyState === null) {
      return false;
    }
    var originStatePos = screenSpaceToWorldSpace(transitions[i].originState.x, transitions[i].originState.y);
    var destinyStatePos = screenSpaceToWorldSpace(transitions[i].destinyState.x, transitions[i].destinyState.y);
    var d1 = dist(originStatePos.x, originStatePos.y, mouseX, mouseY);
    var d2 = dist(destinyStatePos.x, destinyStatePos.y, mouseX, mouseY);

    if (d1 <= stateRadius * zoom || d2 <= stateRadius * zoom) continue;

    const length = dist(originStatePos.x, originStatePos.y, destinyStatePos.x, destinyStatePos.y);

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
  if (stateID == rootID && states.length > 0) {
    setStateAsRoot(states[0].id);
  }
}

//adds a new state to states array and create a transtition for itself
function createState(posX, posY, variables) {
  var newState = new myCircle(posX, posY, variables);
  states.push(newState);
  createTransition(newState, newState);
  if (states.length === 1) { //primeiro estado criado
    setStateAsRoot(states[0].id);
  }
  return newState;
}

//delete given transition from transitions array
function deleteTransition(transition) {
  let index = transitions.indexOf(transition);
  transitions.splice(index, 1);
}

//adds a new transition to transitions array
function createTransition(origin, destiny, variables) {
  var transition = new myTransition(origin, destiny, variables);
  transitions.push(transition);
  if (destiny === null) {
    currentTransition = transitions[transitions.length - 1];
  } else {
    transition.target = destiny.name;
  }
  return transition;
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

//empty all states and transitions arrays
function clearCanvas(clearTimeline = false, clearDatabase = false) {
  states = [];
  transitions = [];
  nextCircleID = 0;
  if (clearTimeline) clearAnnouncementTimeline();
  if (clearDatabase) clearInitialDatabase();
}

function getStateByID(id) {
  for (var s of states) {
    if (s.id == id) {
      return s;
    }
  }
  return null;
}

function getSisterTransition(t) {
  return transitions.find((f) => f.source == t.target && f.target == t.source && t.source != f.source);
}

//print current states and transitions
function printInfo() {
  print("Number os states: " + states.length);
  print("Number os transitions: " + transitions.length);
  print("CurrentStates: ");
  print(states);
  print("CurrentTransitions:");
  print(transitions);
  print("Root ID: " + rootID);
  print("######Database######");
  print(database);
}