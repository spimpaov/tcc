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
  new_relations = [];
  for (t of transitions) {
    if (database.relations.find((f) => f.source == t.target && f.target == t.source) === undefined
      && t.sister !== undefined) {
      new_relations.push(t);
    }
  }
  database.relations = new_relations;
}

function setAgentsAndPropositions() {
  var agents = document.getElementById('agents').value;
  var propositions = document.getElementById('propositions').value;
  var agentsList = agents.split(",");
  var propositionsList = propositions.split(",");
  database = createDatabase(agentsList, propositionsList);
  convertDatabaseToCanvasGraph();
  renderOutput("✓", 'create-graph-output');
}

function makeAnnouncement() {
  var agent = document.getElementById("announcement-agent").value;
  var proposition = document.getElementById("announcement-proposition").value;
  updateDatabaseFromCanvas();
  update_database_based_on_announcement(agent, proposition);
  convertDatabaseToCanvasGraph();
  renderOutput("✓", 'announcement-output');
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
