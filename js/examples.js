let examples = [
  {
    "id": "muddy-children",
    "name": "Crianças com lama na testa",
    "estado_real" : "3",
    "gerar_grafo": {
      "agents": "a,b,c",
      "propositions": "'ana','beto','carla'",
    },
    "conhecimento_inicial": {
      "a": "'beto','carla'!",
      "b": "'ana','carla'!",
      "c": "'ana','beto'",
    },
    "anuncio_privado": [
      {"a,b,c": "'ana''beto'U'carla'U"},
      {"a,b,c": "'ana'{*a}'ana'!{*a}U!'beto'{*b}'beto'!{*b}U!^'carla'{*c}'carla'!{*c}U!^"},
      {"a,b,c": "'ana'{*a}'beto'{*b}^'carla'{*c}!^'carla'!{*c}!^"},
    ],
  },
  {
    "id" : "dolev-yao-example-1",
    "name": "Dolev Yao Exemplo 1",
    "estado_real" : "7",
    "gerar_grafo": {
      "agents": "a,b,z",
      "propositions": "'M','Eb(M)','Ez(M)'",
    },
    "conhecimento_inicial": {
      "a": "'M','M''Ea(M)'>",
      "b": "'M''Eb(M)'>",
      "z": "'M''Ez(M)'>",
    },
    "anuncio_privado": [
      {"z": "'Eb(M)'"},
      {"b": "'Eb(M)'"},
      {"z": "'Ez(M)'"},
    ],
  },
  {
    "id" : "dolev-yao-example-2",
    "name": "Dolev Yao Exemplo 2",
    "estado_real" : "7",
    "gerar_grafo": {
      "agents": "a,b,z",
      "propositions": "'M','Eb(Ma)','Ea(Mb)'",
    },
    "conhecimento_inicial": {
      "a": "'M','M''Ea(Mb)'>",
      "b": "'M''Eb(Ma)'>",
      "z": "'M''Ez(Ma)'>,'M''Ez(Mb)'>",
    },
    "anuncio_privado": [
      {"z": "'Eb(Ma)'"},
      {"b": "'Eb(Ma)'"},
      {"z": "'Ea(Mb)'"},
    ],
  },
  {
    "id" : "dolev-yao-example-3",
    "name": "Dolev Yao Exemplo 3",
    "estado_real" : "31",
    "gerar_grafo": {
      "agents": "a,b,z",
      "propositions": "'M','Eb(Eb(M)a)','Ea(Ea(Ea(M)b)z)','Ez(Ez(Ea(M)b)a)','Ez(Ez(M)a)'",
    },
    "conhecimento_inicial": {
      "a": "'M','M''Ea(Ea(Ea(M)b)z)'>",
      "b": "'M''Eb(Eb(M)a)'>",
      "z": "'Ea(M)''Ez(Ez(Ea(M)b)a)'>,'M''Ez(Ez(M)a)'>",
    },
    "anuncio_privado": [
      {"b": "'Eb(Eb(M)a)'"},
      {"z": "'Ea(Ea(M)b)'"},
      {"a": "'Ea(Ea(Ea(M)b)z)'"},
      {"z": "'Ez(Ez(Ea(M)b)a)'"},
      {"a": "'Ea(Ea(M)z)'"},
      {"z": "'Ez(Ez(M)a)'"},
    ],
  },
]

// Carrega JSON do Exemplo 3 Dolev Yao pré-processado (para demonstração)
function loadExampleDolev3JSON() {
  var data = JSON.parse(dolevJson);
  examples.push(data);
}

// Monta dropdown de opções em 'Carregar Exemplo' baseado nos exemplos definidos em código
function listExamplesInDropdown() {
  loadExampleDolev3JSON();

  var dropdown = document.getElementById("examples-dropdown");
  examples.forEach(e => {
    var option = document.createElement("option");
    option.value = e.id;
    option.innerText = e.name;
    dropdown.appendChild(option);
  });
}

// Seleciona exemplo que será carregado
function setExampleToBeLoaded() {
  var setted = document.getElementById("examples-dropdown").value;
  loadExample(examples.find(f => f.id === setted));
  renderOutput("✓", "load-example-output");
}

// Preenche todos os campos da interface e processa as funções para simular completamente o exemplo selecionado
function loadExample(e) {

  // Caso específico do Dolev Yao 3 (para demonstração)
  if (e.id === "dolev-yao-example-3-v2") {
    database = e.timeline[0];
    updateAnnouncementHistory(database.agents, database.propositions, 0);
    for (let i = 1; i < e.timeline.length; i++) {
      database = e.timeline[i];
      updateAnnouncementHistory(database.agents, database.propositions);
    }

  } else {
    // Gerar grafo
    document.getElementById('agents').value = e.gerar_grafo.agents;
    document.getElementById('propositions').value = e.gerar_grafo.propositions;
    setAgentsAndPropositions();

    // Setar conhecimento inicial
    for (agent of e.gerar_grafo.agents.split(",")) {
      document.getElementById("initial-db-" + agent).value = e.conhecimento_inicial[agent];
    }
    setInitialDatabase();

    // Fazer anúncios privados
    for (var announce of e.anuncio_privado) {
      var key = Object.keys(announce)[0];
      document.getElementById("announcement-agent").value = key;
      document.getElementById("announcement-proposition").value = announce[key];
      makeAnnouncement();
    }
  }

  // Define estado real
  rootID = e.estado_real;

  // Volta para a posição do grafo inicial
  var firstBtn = document.getElementById("announcement-history-ol").firstChild.firstChild;
  firstBtn.click();
}