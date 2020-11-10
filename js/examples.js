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
      {"a,b,c": "'ana'{*a}'ana'!{*a}U!'beto'{*b}'beto'!{*b}U!^'carla'{*c}'carla'!{*c}U!^"},
    ],
  },
  {
    "id" : "dolev-yao-example-1",
    "name": "Dolev Yao Exemplo 1",
    "estado_real" : "7",
    "gerar_grafo": {
      "agents": "a,b,c",
      "propositions": "'M','Eb(M)','Ec(M)'",
    },
    "conhecimento_inicial": {
      "a": "'M','M''Ea(M)'>",
      "b": "'M''Eb(M)'>",
      "c": "'M''Ec(M)'>",
    },
    "anuncio_privado": [
      {"c": "'Eb(M)'"},
      {"b": "'Eb(M)'"},
      {"c": "'Ec(M)'"},
    ],
  },
  {
    "id" : "dolev-yao-example-2",
    "name": "Dolev Yao Exemplo 2",
    "estado_real" : "7",
    "gerar_grafo": {
      "agents": "a,b,c",
      "propositions": "'M','Eb(Ma)','Ea(Mb)'",
    },
    "conhecimento_inicial": {
      "a": "'M','M''Ea(Mb)'>",
      "b": "'M''Eb(Ma)'>",
      "c": "'M''Ec(Ma)'>,'M''Ec(Mb)'>",
    },
    "anuncio_privado": [
      {"c": "'Eb(Ma)'"},
      {"b": "'Eb(Ma)'"},
      {"c": "'Ea(Mb)'"},
    ],
  },
  {
    "id" : "dolev-yao-example-3",
    "name": "Dolev Yao Exemplo 3",
    "estado_real" : "31",
    "gerar_grafo": {
      "agents": "a,b,c",
      "propositions": "'M','Eb(Eb(M)a)','Ea(Ea(Ea(M)b)c)','Ec(Ec(Ea(M)b)a)','Ec(Ec(M)a)'",
    },
    "conhecimento_inicial": {
      "a": "'M','M''Ea(Ea(Ea(M)b)c)'>",
      "b": "'M''Eb(Eb(M)a)'>",
      "c": "'Ea(M)''Ec(Ec(Ea(M)b)a)'>,'M''Ec(Ec(M)a)'>",
    },
    "anuncio_privado": [
      {"b": "'Eb(Eb(M)a)'"},
      {"c": "'Ea(Ea(M)b)'"},
      {"a": "'Ea(Ea(Ea(M)b)c)'"},
      {"c": "'Ec(Ec(Ea(M)b)a)'"},
      {"a": "'Ea(Ea(M)c)'"},
      {"c": "'Ec(Ec(M)a)'"},
    ],
  },
]

function listExamplesInDropdown() {
  var dropdown = document.getElementById("examples-dropdown");
  examples.forEach(e => {
    var option = document.createElement("option");
    option.value = e.id;
    option.innerText = e.name;
    dropdown.appendChild(option);
  });
}

function setExampleToBeLoaded() {
  var setted = document.getElementById("examples-dropdown").value;
  loadExample(examples.find(f => f.id === setted));
  renderOutput("✓", "load-example-output");
}

function loadExample(e) {
  //gerar grafo
  document.getElementById('agents').value = e.gerar_grafo.agents;
  document.getElementById('propositions').value = e.gerar_grafo.propositions;
  setAgentsAndPropositions();

  // define estado real
  rootID = e.estado_real;

  //setar conhecimento inicial
  for (agent of e.gerar_grafo.agents.split(",")) {
    document.getElementById("initial-db-" + agent).value = e.conhecimento_inicial[agent];
  }
  setInitialDatabase();

  //anuncios privados
  for (var announce of e.anuncio_privado) {
    var key = Object.keys(announce)[0];
    document.getElementById("announcement-agent").value = key;
    document.getElementById("announcement-proposition").value = announce[key];
    makeAnnouncement();
  }

  //volta para a posição do grafo inicial
  var firstBtn = document.getElementById("announcement-history-ol").firstChild.firstChild;
  firstBtn.click();
}