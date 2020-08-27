let canvasWidth = 1280;
let canvasHeight = 720;
let xOffset = 0.0;
let yOffset = 0.0;
let locked = false;
let touchedState = null;
let touchedTransition = null;
let currentTransition = null;
let writingText = false;
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

class myCircle {
  constructor(x, y, knowledge, name = nextCircleID.toString()) {
    this.x = x;
    this.y = y;
    this.hover = false;
    this.editing = false;
    if (name !== undefined) {
      this.name = name
    }
    this.id = nextCircleID++;
    this.knowledge = knowledge;
  }

  display() {
    push();
    if (states.indexOf(this) === 0) { //root
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
    var displayText = this.name + ": [" + this.knowledge + "]";
    text(displayText, this.x, this.y);
    pop();
  }

  updateStatesKnownAgents() {
    print(knownAgents);
    //adiciona agentes novos com conhecimento vazio
    for (let agent of knownAgents) {
      if (!this.knowledge.hasOwnProperty(agent)) {
        this.knowledge[agent] = [];
        print("Incluindo: " + agent + ", state: " + this.name);
      }
    }

    //remove agentes antigos e seus conhecimentos
    for (let agent in this.knowledge) {
      if (!knownAgents.includes(agent)) {
        delete(this.knowledge[agent]);
        print("Deletando: " + agent + ", state: " + this.name);
        print(this.knowledge);
      }
    }
  }

}

class myTransition {
  constructor(originState, destinyState, sister) {
    this.originState = originState;
    this.destinyState = destinyState;
    this.hover = false;
    this.editing = false;
    this.source = originState.name;
    this.agents = ["a", "b"];
    this.sister = sister;
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
    //updateKnownAgents(this.agents);
    pop();
  }

  updateTransitionsKnownAgents() {
    if (this.source === this.target) {
      this.agents = knownAgents;
    } else  {
      this.agents = this.agents.filter((f) => knownAgents.includes(f));
    }
  }
}

// update agents for all self-state transitions
function updateKnownAgents() {
  for (let t of transitions) {
    t.updateTransitionsKnownAgents();
  }
  for (let s of states) {
    s.updateStatesKnownAgents();
  }
}

function setup() {
  var cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent("sketchHolder");
  rectMode(RADIUS);
  createDeafultDatabase();
}

function convertDatabaseToCanvasGraph(database) {
  clearCanvas();

  // cria estados
  var xOffset = 100;
  var yOffset = 100;
  var xJump = 300;
  var yJump = 300;
  var xMod = canvasWidth;
  var linha = 0;
  database.states.forEach(
    function (s, i) {
      var stateXPos = xOffset + (i % xMod)*xJump;
      if (stateXPos >= canvasWidth - xOffset && xMod === canvasWidth) {
        xMod = i;
        stateXPos = xOffset + (i % xMod)*xJump;
      }
      if (i != 0 && i % xMod === 0) {
        linha++;
      }
      var stateYPos = yOffset + linha*yJump;

      print("state: " + i + ", [ " + stateXPos + ", " + stateYPos + " ], ");
      createState(stateXPos, stateYPos, s.variables, s.name);
    }
  );

  // cria transições
  database.relations.forEach(
    function (r, i) {
      var sourceState = getStateByID(r.source);
      var targetState = getStateByID(r.target);
      if (sourceState !== null && targetState !== null) {
        var t0 = createTransition(sourceState, targetState, null);
        var t1 = createTransition(sourceState, targetState, t0)
        t0.sister = t1;
      } else {
        print("Estado de origem/destino não encontrado! ID source: " + r.source + ", ID target: " + r.target);
      }
    }
  );
}

function createDeafultDatabase() {
  var s0 = createState(258, 246, ["M"]);
  var s1 = createState(518, 246, []);
  var t0 = createTransition(s0, s1, null);
  var t1 = createTransition(s1, s0, t0);
  t0.sister = t1;
  updateDatabaseFromCanvas();
}

function draw() {
  background(240);
  mouseInsideCanvas = (mouseX >= 0 && mouseX <= 1280 && mouseY >= 0 && mouseY <= 720) ? true : false;

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
    if (touchedTransition.sister !== null && touchedTransition.sister !== undefined) {
      touchedTransition.sister.hover = true;
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

  //desenha texto durante modo de escrita
  if (writingStateText) {
    push();
    textSize(18);
    textAlign(RIGHT);
    text('Nome:', 195, 70);
    text('Variáveis:', 195, 100);
    pop();
  }

  if (writingTransitionText) {
    push();
    textSize(18);
    textAlign(RIGHT);
    text('Agentes:', 195, 70);
    pop();
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
  if (!writingText && (key === 's' || key === 'S')) {
    if (touchedState !== null) { //delete state
      deleteState(touchedState);
    } else { //create state
      createState(mouseX, mouseY, []);
    }

  //transition control
  } else if (!writingText && (key === 't' || key === 'T')) {
    if (touchedState !== null) {
      if (currentTransition !== null) { //fixate transition
        currentTransition.destinyState = touchedState;
        currentTransition.target = touchedState.name;
        var sisterTransition = createTransition(currentTransition.destinyState, currentTransition.originState, currentTransition);
        currentTransition.sister = sisterTransition;
        deleteTransitionDuplicates(currentTransition);
        deleteTransitionDuplicates(sisterTransition);
        currentTransition = null;
      } else { //create transition
        createTransition(touchedState, null, null);
      }
    } else if (touchedState === null) {
      if (currentTransition !== null) { //cancel current transition
        deleteTransition(currentTransition);
        currentTransition = null;
      } else if (touchedTransition !== null) { //delete touched transition
        deleteTransition(touchedTransition);
        deleteTransition(touchedTransition.sister);
        touchedTransition = null;
      }
    }

  //write control 
  } else if (!writingText && (key === 'w' || key === 'W') && currentTransition === null) {
    if (touchedState !== null) { //write to state
      writingText = true;
      editStateText(touchedState);
    } else if (touchedTransition !== null) { //write to transition
      writingText = true;
      editTransitionText(touchedTransition);
    }

  //define root
  } else if (!writingText && (key === 'r' || key === 'R') && touchedState !== null ) {
    setStateAsRoot(touchedState);

  //print info about current states and transitions
  } else if (!writingText && (key === 'i' || key === 'I')) {
    printInfo();
  }
}

function editStateText(s) {
  s.editing = true;
  writingStateText = true;
  let nameInput = createInput(s.name.toString(10));
  let variablesInput = createInput(JSON.stringify(s.knowledge));

  nameInput.position(200, 50);
  nameInput.parent("sketchHolder");

  variablesInput.position(nameInput.x, nameInput.y + nameInput.height + 5);
  variablesInput.parent("sketchHolder");
  let button = createButton('Submit');
  button.position(variablesInput.x + variablesInput.width + 5, variablesInput.y);
  button.parent("sketchHolder");


  button.mousePressed(function() {
    let index = states.indexOf(s);
    states[index].name = nameInput.value();
    states[index].knowledge = JSON.parse(variablesInput.value());
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
  if (t.sister !== undefined && t.sister !== null) {
    t.editing.sister = true;
  }
  writingTransitionText = true;
  let inp = createInput(t.agents.toString());
  inp.position(200, 50);
  inp.parent("sketchHolder");

  button = createButton('Submit');
  button.position(inp.x + inp.width + 5, inp.y);
  button.parent("sketchHolder");

  button.mousePressed(function() {
    let index = transitions.indexOf(t);
    transitions[index].agents = inp.value().replace(/\s/g,'').split(",");
    transitions[index].editing = false;
    if (transitions[index].sister !== undefined && transitions[index].sister !== null) {
      let sisterIndex = transitions.indexOf(t.sister);
      transitions[sisterIndex].agents = inp.value().replace(/\s/g,'').split(",");
      transitions[sisterIndex].editing = false;
    }
    writingText = false;
    writingTransitionText = false;
    button.remove();
    inp.remove();
  });
}

function setStateAsRoot(s) {
  let sIndex = states.indexOf(s);
  var lastRoot = states[0];
  states[0] = s;
  states[sIndex] = lastRoot;
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

//adds a new state to states array and create a transtition for itself
function createState(posX, posY, variables) {
  var newState = new myCircle(posX, posY, variables);
  states.push(newState);
  createTransition(newState, newState);
  return newState;
}

//delete given transition from transitions array
function deleteTransition(transition) {
  let index = transitions.indexOf(transition);
  transitions.splice(index, 1);
}

//adds a new transition to transitions array
function createTransition(origin, destiny, sister) {
  var transition = new myTransition(origin, destiny, sister);
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
function clearCanvas() {
  states = [];
  transitions = [];
  nextCircleID = 0;
  knownAgents = [];
}

function getStateByID(id) {
  for (var s of states) {
    if (s.id === id) {
      return s;
    }
  }
  return null;
}

//print current states and transitions
function printInfo() {
  print("Number os states: " + states.length);
  print("Number os transitions: " + transitions.length);
  print("CurrentStates: ");
  print(states);
  print("CurrentTransitions:");
  print(transitions);
  print("Root: " + states[0].id);
  // print("###############");
  // print(database);
}