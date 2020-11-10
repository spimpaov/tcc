var announcementHistory = [];
var currentTimelineIndex = 0;

// [INPUT] Calcula a expressão definida em $("#input")
function calculateBasedOnUserInput() {
  updateDatabaseFromCanvas();
  if (database.states.length == 0) {
    renderOutput("✗ Banco de dados vazio!");
    return;
  }

  var input = document.getElementById('input').value;
  var result = calculate_input(input);
  var output = result;
  if (result != null && result != undefined) {
    if (result) {
      output = "✓ "
    } else {
      output = "✗ "
    }
    output += result + "!";
  } else {
    output = "✗ Valor indefinido!";
  }

  renderOutput(output, 'result');
}

function updateDatabaseFromCanvas() {
  database.states = states;
  database.relations = transitions;
}

function setAgentsAndPropositions() {
  var agentsList = document.getElementById('agents').value.split(",");
  var propositionsList = document.getElementById('propositions').value.split(",");
  createDatabase(agentsList, propositionsList);
  updateAnnouncementHistory(null, null, 0);
  var lastTimelineBtn = document.getElementById("announcement-history-ol").lastChild.lastChild;
  highlightTimelineBtn(lastTimelineBtn);
  convertDatabaseToCanvasGraph();
  createInitialDBTextInput(agentsList);
  renderOutput("✓", 'create-graph-output');
}

function makeAnnouncement() {
  var agents = document.getElementById("announcement-agent").value.split(",");
  var proposition = document.getElementById("announcement-proposition").value;
  private_announcement(agents, proposition);
  var lastTimelineBtn = document.getElementById("announcement-history-ol").lastChild.lastChild;
  highlightTimelineBtn(lastTimelineBtn);
  renderOutput("✓", 'announcement-output');
}

function updateAnnouncementHistory(agents, proposition, resetToPos = -1) {
  if (resetToPos !== -1) {
    var timeline = document.getElementById("announcement-history-ol");
    for (var i = announcementHistory.length-1; i >= resetToPos; i--) {
      announcementHistory.pop();
      timeline.removeChild(timeline.lastChild);
    }
  }
  currentTimelineIndex++;
  var databaseClone = lodash.cloneDeep(database);
  announcementHistory.push(databaseClone);
  addButtonToAnnouncementTimeLine(agents, proposition);
}

function addButtonToAnnouncementTimeLine(agents, proposition) {
  var ol = document.getElementById("announcement-history-ol");
  var li = document.createElement("li");
  ol.appendChild(li);
  var btn = document.createElement("BUTTON");
  li.appendChild(btn);
  btn.addEventListener('click', setPosInTimeline, false);
  if (agents === null && proposition === null) {
    btn.innerHTML = "grafo inicial";
  } else {
    btn.innerHTML = agents + " aprende " + proposition;
  }
}

function setPosInTimeline() {
  var index = 0;
  var previous = this.parentElement.previousElementSibling;
  while (previous) {
    previous = previous.previousElementSibling;
    index++;
  }
  currentTimelineIndex = index + 1;
  database = lodash.cloneDeep(announcementHistory[index]);
  convertDatabaseToCanvasGraph();
  highlightTimelineBtn(this)
}

function highlightTimelineBtn(btn) {
  var ol = document.getElementById("announcement-history-ol");
  for (li of ol.children) {
    li.lastChild.classList.remove("timeline-btn-selected");
  }
  btn.className = "timeline-btn-selected";
}

function clearAnnouncementTimeline() {
  announcementHistory = [];
  var ol = document.getElementById("announcement-history-ol");
  while (ol.lastChild) {
    ol.removeChild(ol.lastChild);
  }
}

function createInitialDBTextInput(agents) {
  clearInitialDatabase();
  var initialDBInputs = document.getElementById("initial-db-inputs");
  for (var agent of agents) {
    var agentSpan = document.createElement('span');
    agentSpan.innerHTML = "<br>" + agent + ": ";
    agentSpan.agent = agent;
    initialDBInputs.appendChild(agentSpan);

    var agentInput = document.createElement('input');
    agentInput.type = 'text';
    agentInput.id = 'initial-db-' + agent;
    agentSpan.appendChild(agentInput);
  }
}

function setInitialDatabase() {
  var initialDBInputs = document.getElementById("initial-db-inputs");
  for (var agentSpan of initialDBInputs.childNodes) {
    var agentDB = agentSpan.lastChild.value.replace(/\s/g,'').split(",");
    for (var proposition of agentDB) {
      private_announcement([agentSpan.agent], proposition);
      var lastTimelineBtn = document.getElementById("announcement-history-ol").lastChild.lastChild;
      highlightTimelineBtn(lastTimelineBtn);
    }
  }
  renderOutput("✓", 'initial-db-output');
}

function clearInitialDatabase() {
  var initialDBInputs = document.getElementById("initial-db-inputs");
  while (initialDBInputs.lastChild) {
    initialDBInputs.removeChild(initialDBInputs.lastChild);
  }
}

function toggleCanvas() {
  var btnText;
  if (canvasIsActive) {
    canvasIsActive = false;
    btnText = "Ativar Canvas";
  } else {
    canvasIsActive = true;
    btnText = "Desativar Canvas";
  }
  document.getElementById("toggleCanvas").textContent = btnText;
}

function renderOutput(output, id) {
  document.getElementById(id).textContent = output;
  handleFadeInEffect(id);
}

function clearOkOutputs() {
  renderOutput("", 'load-example-output');
  renderOutput("", 'create-graph-output');
  renderOutput("", 'initial-db-output');
  renderOutput("", 'announcement-output');
  renderOutput("", 'result');
}

// [COSMÉTICO] Função de Fade-in
function handleFadeInEffect(id) {
  document.getElementById(id).className = "";
  setTimeout(function() {
    document.getElementById(id).classList.add("animatee");
  }, 100);
}

function openHelpText(id) {
  openHelper = true;
  var modal = document.getElementById(id);
  modal.style.display = "block";
}
