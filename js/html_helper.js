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
  database = createDatabase(agentsList, propositionsList);
  updateAnnouncementHistory(null, null, 0);
  convertDatabaseToCanvasGraph();
  createInitialDBTextInput(agentsList);
  renderOutput("✓", 'create-graph-output');
}

function makeAnnouncement() {
  var agent = document.getElementById("announcement-agent").value;
  var proposition = document.getElementById("announcement-proposition").value;
  private_announcement(agent, proposition);
  renderOutput("✓", 'announcement-output');
}

function updateAnnouncementHistory(agent, proposition, resetToPos = -1) {
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
  addButtonToAnnouncementTimeLine(agent, proposition);
}

function addButtonToAnnouncementTimeLine(agent, proposition) {
  var ol = document.getElementById("announcement-history-ol");
  var li = document.createElement("li");
  ol.appendChild(li);
  var btn = document.createElement("BUTTON");
  li.appendChild(btn);

  btn.addEventListener('click', function() {
    var index = 0;
    var previous = btn.parentElement.previousElementSibling;
    while (previous) {
      previous = previous.previousElementSibling;
      index++;   
    }
    currentTimelineIndex = index + 1;
    database = lodash.cloneDeep(announcementHistory[index]);
    convertDatabaseToCanvasGraph();
  }, false);

  if (agent === null && proposition === null) {
    btn.innerHTML = "grafo inicial";
  } else {
    btn.innerHTML = agent + " aprende " + proposition;
  }
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
    agentInput.value = '{M}{E' + agent + '(M)}>';
    agentSpan.appendChild(agentInput);
  }
}

function setInitialDatabase() {
  var initialDBInputs = document.getElementById("initial-db-inputs");
  for (var agentSpan of initialDBInputs.childNodes) {
    var agentDB = agentSpan.lastChild.value.replace(/\s/g,'').split(",");
    for (var proposition of agentDB) {
      private_announcement(agentSpan.agent, proposition);
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

function renderOutput(output, id) {
  document.getElementById(id).textContent = output;
  handleFadeInEffect(id);
}

// [COSMÉTICO] Função de Fade-in
function handleFadeInEffect(id) {
  document.getElementById(id).className = "";
  setTimeout(function() {
    document.getElementById(id).classList.add("animatee");
  }, 100);
}

function openHelpText(id) {
  var modal = document.getElementById(id);
  modal.style.display = "block";
}
