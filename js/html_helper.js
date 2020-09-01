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
  agentsList = agents.split(",");
  propositionsList = propositions.split(",");
  database = createDatabase(agentsList, propositionsList);
  convertDatabaseToCanvasGraph();
  renderOutput("✓", 'create-graph-output');
}

function makeAnnouncement() {
  var agent = document.getElementById("announcement-agent");
  var proposition = document.getElementById("announcement-proposition");
  database = update_database_based_on_announcement(agent, proposition);
  print(database);
  // convertDatabaseToCanvasGraph();
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
