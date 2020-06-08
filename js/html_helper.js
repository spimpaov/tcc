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

function setAgents() {
  var agents = document.getElementById('agents').value;
  knownAgents = agents;
  updateKnownAgents();
  renderOutput("✓ [" + knownAgents + "]", 'agents-output');
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

function openQuestionHelpText() {
  var modal = document.getElementById("modal_pergunta");
  modal.style.display = "block";
} 

function openCanvasHelpText() {
  var modal = document.getElementById("modal_canvas");
  modal.style.display = "block";
} 
