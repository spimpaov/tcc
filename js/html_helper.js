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

  renderOutput(output);
}

function updateDatabaseFromCanvas() {
  database.states = states;
  database.relations = transitions;
}

function renderOutput(output) {
  document.getElementById('result').textContent = output;
  handleFadeInEffect();
}

// [COSMÉTICO] Função de Fade-in
function handleFadeInEffect() {
  document.getElementById('result').className = "";
  setTimeout(function() {
    document.getElementById('result').classList.add("animatee");
  }, 100);
}