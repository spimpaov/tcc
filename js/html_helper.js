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
  var agents = document.getElementById('agents').value;
  var propositions = document.getElementById('propositions').value;
  var agentsList = agents.split(",");
  var propositionsList = propositions.split(",");
  database = createDatabase(agentsList, propositionsList);
  updateAnnouncementHistory(null, null, 0);
  convertDatabaseToCanvasGraph();
  renderOutput("✓", 'create-graph-output');
}

function makeAnnouncement() {
  var agent = document.getElementById("announcement-agent").value;
  var proposition = document.getElementById("announcement-proposition").value;
  updateDatabaseFromCanvas();
  update_database_based_on_announcement(agent, proposition);
  var resetToPos = (announcementHistory.length !== currentTimelineIndex) ? currentTimelineIndex : -1;
  updateAnnouncementHistory(agent, proposition, resetToPos);
  convertDatabaseToCanvasGraph();
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
