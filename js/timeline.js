// Guarda o histórico de estados do grafo
var announcementHistory = [];
// Indica qual é o index da timeline que está selecionado no momento
var currentTimelineIndex = 0;

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