// Guarda o histórico de estados do grafo
var announcementHistory = [];
// Indica qual é o index da timeline que está selecionado no momento
var currentTimelineIndex = 0;

// Calcula a expressão definida no campo 'Pergunta'
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

// Atualiza a estrutura de database baseado no grafo desenhado no canvas
function updateDatabaseFromCanvas() {
  database.states = states;
  database.relations = transitions;
}

// Gera um grafo automaticamnete baseado num conjunto de agentes e um conjunto de proposições
function setAgentsAndPropositions() {
  var agentsList = document.getElementById('agents').value.split(",");
  var propositionsList = document.getElementById('propositions').value.split(",");

  // Calcula como deve ser definida a database
  createDatabase(agentsList, propositionsList);

  // Atualiza timeline
  updateAnnouncementHistory(null, null, 0);
  var lastTimelineBtn = document.getElementById("announcement-history-ol").lastChild.lastChild;
  highlightTimelineBtn(lastTimelineBtn);

  convertDatabaseToCanvasGraph();

  // Abre caixinhas do campo 'Conhecimento Inicial'
  createInitialDBTextInput(agentsList);

  renderOutput("✓", 'create-graph-output');
}

// Gera um anúncio baseado numa lista de agentes e uma proposição
function makeAnnouncement() {
  var agents = document.getElementById("announcement-agent").value.split(",");
  var proposition = document.getElementById("announcement-proposition").value;

  private_announcement(agents, proposition);

  // Atualiza timeline
  var lastTimelineBtn = document.getElementById("announcement-history-ol").lastChild.lastChild;
  highlightTimelineBtn(lastTimelineBtn);

  renderOutput("✓", 'announcement-output');
}

// Atualiza timeline de anúncios feitos
function updateAnnouncementHistory(agents, proposition, resetToPos = -1) {

  if (resetToPos !== -1) {
    // Remove da timeline todos os botões cujo índice é maior que resetToPos
    var timeline = document.getElementById("announcement-history-ol");
    for (var i = announcementHistory.length-1; i >= resetToPos; i--) {
      announcementHistory.pop();
      timeline.removeChild(timeline.lastChild);
    }
  }
  currentTimelineIndex++;

  // Clona database em seu estado atual e adiciona ao histórico
  var databaseClone = lodash.cloneDeep(database);
  announcementHistory.push(databaseClone);

  addButtonToAnnouncementTimeLine(agents, proposition);
}

// Cria um novo botão no histórico de anúncios
function addButtonToAnnouncementTimeLine(agents, proposition) {
  var ol = document.getElementById("announcement-history-ol");
  var li = document.createElement("li");
  ol.appendChild(li);

  var btn = document.createElement("BUTTON");
  li.appendChild(btn);
  btn.addEventListener('click', setPosInTimeline, false);

  if ((agents === null && proposition === null) || (agents === "" && proposition === "")) {
    // Chamada à função foi feita logo após geração automática de um grafo
    btn.innerHTML = "grafo inicial";
  } else {
    // Chama à função foi feita após um anúncio privado
    btn.innerHTML = agents + " aprende " + proposition;
  }
}

// Função definida para os botões criados na timeline de anúncios
function setPosInTimeline() {
  // Calcula qual o index do botão na timeline de anúncios
  var index = 0;
  var previous = this.parentElement.previousElementSibling;
  while (previous) {
    previous = previous.previousElementSibling;
    index++;
  }
  currentTimelineIndex = index + 1;

  // Resgata a database clonada para aquele índice
  database = lodash.cloneDeep(announcementHistory[index]);
  convertDatabaseToCanvasGraph();

  highlightTimelineBtn(this);
}

// Adiciona highlight num botão selecionado da timeline e remove highlight dos demais
function highlightTimelineBtn(btn) {
  var ol = document.getElementById("announcement-history-ol");
  for (li of ol.children) {
    li.lastChild.classList.remove("timeline-btn-selected");
  }
  btn.className = "timeline-btn-selected";
}

// Limpa o histórico de anúncios
function clearAnnouncementTimeline() {
  announcementHistory = [];
  var ol = document.getElementById("announcement-history-ol");
  while (ol.lastChild) {
    ol.removeChild(ol.lastChild);
  }
}

// Cria caixas de texto para setar o conhecimento inicial de cada um dos agentes passados
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

// Processa os conhecimentos iniciais definidos para vários agentes
function setInitialDatabase() {
  var initialDBInputs = document.getElementById("initial-db-inputs");
  for (var agentSpan of initialDBInputs.childNodes) {
    // Remove espaços em branco e separa proposições através da vírgula
    var agentDB = agentSpan.lastChild.value.replace(/\s/g,'').split(",");

    for (var proposition of agentDB) {
      // Realiza um anúncio privado
      private_announcement([agentSpan.agent], proposition);

      // Dá highlight no último botão da timeline
      var lastTimelineBtn = document.getElementById("announcement-history-ol").lastChild.lastChild;
      highlightTimelineBtn(lastTimelineBtn);
    }
  }
  renderOutput("✓", 'initial-db-output');
}

// Apaga elementos do campo 'Conhecimento Inicial'
function clearInitialDatabase() {
  var initialDBInputs = document.getElementById("initial-db-inputs");
  while (initialDBInputs.lastChild) {
    initialDBInputs.removeChild(initialDBInputs.lastChild);
  }
}

// Ativa ou desativa a exibição do canvas
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

// Exibe um output em texto para algum elemento definido pelo seu ID
function renderOutput(output, id) {
  document.getElementById(id).textContent = output;
  handleFadeInEffect(id);
}

// Limpa todos os outputs já renderizados
function clearOutputs() {
  renderOutput("", 'load-example-output');
  renderOutput("", 'create-graph-output');
  renderOutput("", 'initial-db-output');
  renderOutput("", 'announcement-output');
  renderOutput("", 'result');
}

// Abre um modal de ajuda definido pelo ID
function openHelpText(id) {
  openHelper = true;
  var modal = document.getElementById(id);
  modal.style.display = "block";
}


// [COSMÉTICO] Função de Fade-in
function handleFadeInEffect(id) {
  document.getElementById(id).className = "";
  setTimeout(function() {
    document.getElementById(id).classList.add("animatee");
  }, 100);
}