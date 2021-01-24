// Banco de dados que descreve o grafo
let database = {
  "agents": ["a","b"],
}

// Raiz do grafo
let rootID = 0;

// Classe de 'operador'
const operator = class {
  constructor(name, pattern, operation, get_states_to_check, get_agent, validate_results, length) {
    // Nome do operador ('AND', 'OR', etc). Adicionado por motivos de debug
    this.name = name;
    // Expressão regular que define o operador. Usualmente, apenas um caractere ('AND' é '^', 'NOT' é '!', etc)
    this.pattern = pattern;
    // Função que recebe um array de operandos e opera em cima deles
    this.operation = operation;
    // Função que recebe (i) o estado atual e (ii) o agente atual, e retorna sobre quais estados aquele operador operará
    // Para os operadores de primeira ordem, a função retorna apenas o estado atual
    // Para operadores modais, a função retorna todos os vizinhos do estado atual visitáveis por arestas do agente atual
    this.get_states_to_check = get_states_to_check;
    // Função que extrai o agente da string que define o operador
    // Por exemplo, é esta função que entende que '{?a}' se refere ao agente 'a'
    this.get_agent = get_agent;
    // Função que recebe um conjunto de resultados (um para cada estado checado) e decide como combiná-los
    // Para os operadores de primeira ordem, receberá um array de apenas uma variável (checada no estado atual)
    // Para os operadores modais, a função retorna um array com N elementos, sendo N o conjunto de vizinhos visitados pela função acmia (get_states_to_check)
    this.validate_results = validate_results;
    // Quantidade de operandos esperada pelo operador
    this.length = length;
  }
}

operators = [
  new operator(
    name = "NOT",
    pattern = /\!/,
    operation = function(p) {
      return !p[0];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 1
  ),
  new operator(
    name = "AND",
    pattern = /\^/,
    operation = function(p) {
      return p[0] && p[1];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "OR",
    pattern = /\U/,
    operation = function(p) {
      return p[0] || p[1];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "IMPLIES",
    pattern = /\>/,
    operation = function(p) {
      return !p[0] || p[1];
    },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  ),
  new operator(
    name = "EXISTS",
    pattern = /\{\?\w\}/,
    operation = function(p) { return p[0]; },
    get_states_to_check = get_all_state_neighbors,
    get_agent = function(string) { return string.match(/\w/)[0] },
    validate_results = function(r) {
      // Verdadeiro se ao menos um for verdadeiro
      var trues = r.filter((f) => f);
      return trues.length > 0;
    },
    length = 1
  ),
  new operator(
    name = "FOR EACH",
    pattern = /\{\*\w\}/,
    operation = function(p) { return p[0]; },
    get_states_to_check = get_all_state_neighbors,
    get_agent = function(string) { return string.match(/\w/)[0] },
    validate_results = function(r) {
      // Apenas verdadeiro se não houver um falso
      var trues = r.filter((f) => f);
      return trues.length == r.length;
    },
    length = 1
  ),
  new operator(
    name = "PUBLIC ANNOUNCEMENT",
    pattern = /\@/,
    operation = function(p) { return p[1]; },
    get_states_to_check = get_current_state,
    get_agent = function(s) { return undefined },
    validate_results = get_first_and_only_result,
    length = 2
  )
]

function calculate_input(expression) {
  // Espera expressão em notação pós-fixada

  // Transforma expressão de 'string' para 'array de caracteres'
  var stack = []
  for (let character of expression) {
    stack.push(character);
  }

  var root_state = database.states.find((f) => f.id == rootID);
  // Checa se expressão é válida
  if (is_valid_expression(stack)) {
    // Calcula o valor da expressão começando no fim da pilha. Esta função é recursiva e esta chamada em
    // particular pode ser entendido como a 'main'
    return calculate(stack, stack.length - 1, root_state, database.states.slice(0)).value;
  }

  return throw_error();
}

// Calcula recursivamente o valor da expressão na pilha começando no índice 'index', sendo avaliada no estado 'state'
function calculate(stack, index, state, valid_states) {
  // Impossível estar acessando índices negativos na pilha
  if (index < 0) {
    return throw_error();
  }

  var op_string_obj = get_op_string(stack, index, forwards = false);
  // Obtém a string referente ao operador/operando atual
  var op_string = op_string_obj.op_string;
  // Atualiza o índice da pilha para o fim do operador/operando
  // Necessário pois alguns operadores têm mais de um caractere (como '{?a}'), e portanto o salto do índice é diferente de 1
  index = op_string_obj.new_index;

  if (is_operator(op_string)) {
    // Transforma string de operador em objeto 'operator'
    var operator = get_operator(op_string);

    var deepest_index = index;
    var operation_results = [];

    // Caso operador seja 'anúncio público', é do formato [phi]psi
    if (operator.name == 'PUBLIC ANNOUNCEMENT') {
      var phi_states = [];

      // Calcula todos os estados em que phi é verdadeiro
      for (let state of valid_states) {
        var operand = calculate(stack, index - 1, state, valid_states);
        if (operand.value) {
          phi_states.push(state);
        }
      }

      // Estes serão os únicos estados em que o operador poderá ser avaliado
      valid_states = phi_states;
    }

    // Obtém os estados sobre os quais o operador operará de fato. Subconjunto de phi_states
    var states_to_check = operator.get_states_to_check(state, operator.get_agent(op_string), valid_states);

    // Para cada estado a se checar, calcula o valor da operação determinada pelo operador
    for (let state_to_check of states_to_check) {
      var operands = []
      var last_index = index;

      // Para cada operando esperado pelo operador, calcula o valor da pilha naquele índice
      for (var i = 0; i < operator.length; i++) {
        var operand = calculate(stack, last_index - 1, state_to_check, valid_states);
        last_index = operand.index;
        operands.push(operand.value);
      }

      // Faz o operador operar sobre os operandos obtidos
      var operation_result = operator.operation(operands);
      operation_results.push(operation_result);
      // A variável 'deepest index' armazena o índice do último operando visitado dentro daquele operador
      // Necessária para controlar onde começa e termina cada operando
      deepest_index = last_index;
    }

    return {"index": deepest_index, "value": operator.validate_results(operation_results)};
  }

  // Caso caractere atual não seja um operador, retorna seu valor no estado atual
  return {"index": index, "value": get_variable_value_at_state(op_string, state)};
}

// Determina o valor de uma variável num estado
function get_variable_value_at_state(op_string, state) {
  if (state.variables !== null && state.variables !== undefined) {
    return state.variables.find((f) => f == op_string) != undefined;
  } else {
    return false;
  }
}

// Determina se string é operador
function is_operator(operation) {
  return get_operator(operation) != null;
}

// Obtém operador a partir de string
function get_operator(operation) {
  return operators.find((f) => operation.search(f.pattern) != -1);
}

// Obtém string referente ao operador/operando atual
function get_op_string(array, index, forwards = true) {
  var op_string = array[index];

  var index_start_char = index;
  var index_end_char = index;

  // Alguns operadores levam mais de um caractere. Este snippet garante que o operador inteiro
  // será retornado, ao invés de selecionar apenas o primeiro caractere. Operadores de mais de um caractere
  // são delimitados por chaves { }.
  if (forwards) {
    if (op_string == "{") {
      var i = 0;
      for (i = index_start_char; i < array.length && array[i] != "}"; i++);
      index_end_char = i;
      index = index_end_char;
    } else if (op_string == "'") {
      var i = index_start_char+1;
      for (i = index_start_char+1; i < array.length && array[i] != "'"; i++);
      index_end_char = i;
      index = index_end_char;
    }
  } else /*backwards*/ {
    if (op_string == "}") {
      var i = 0;
      for (i = index_end_char; i >= 0 && array[i] != "{"; i--);
      index_start_char = i;
      index = index_start_char;
    } else if ( op_string == "'") {
      var i = index_end_char-1;
      for (i = index_end_char-1; i >= 0 && array[i] != "'"; i--);
      index_start_char = i;
      index = index_start_char;
    }
  }

  op_string = array.slice(index_start_char, index_end_char + 1).join("");
  return {"op_string": op_string, "new_index": index};
}

// Obtém objeto 'estado' a partir do id do estado
function get_state_by_id(id) {
  return database.states.find((f) => f.id == id);
}

// Retorna estado atual como array
function get_current_state(current_state, agent, valid_states) {
  return [current_state];
}

// Retorna estados que são vizinhos do estado atual por transição do agente 'agent'
function get_all_state_neighbors(current_state, agent, valid_states) {
  return database.relations
    .filter((f) => f.source == current_state.id
      && f.agents.includes(agent)
      && valid_states.map((s) => s.id).includes(f.target))
    .map((f) => get_state_by_id(f.target));
}

// Retorna primeiro resultado do array
function get_first_and_only_result(results) {
  if (results.length != 1) {
    return throw_error();
  }
  return results[0];
}

// Retorna array com o par de transições irmãs (source->target e target->source)
function get_symmetric_transition(sourceID, targetID) {
  var t = [];
  for (let i = 0; i < database.relations.length; i++) {
    if ((database.relations[i].source === sourceID && database.relations[i].target === targetID)
      || (database.relations[i].source === targetID && database.relations[i].target === sourceID)) {
        t.push(database.relations[i]);
    }
  }
  return t;
}

// Retorna uma lista de transições que devem ser apagadas do grafo baseado no anúncio realizado
function update_database_based_on_announcement(agents, proposition) {
  var marked = {};
  var stack = [];

  // Monta o stack baseado na pergunta
  for (let character of proposition) {
    stack.push(character);
  }

  for (let a of agents) {
    marked[a] = [];

    for (let s of database.states) {
      try {
        // Calcula o resultado da pergunta para um estado 's' do grafo
        var s_result = calculate(stack.slice(0), stack.length - 1, s, database.states.slice(0)).value;
      }
      catch(err) {
        return undefined;
      }

      var s_neighbors = get_all_state_neighbors(s, a, database.states);
      for (let n of s_neighbors) {
        // Calcula o resultado da pergunta para um vizinho imediato 'n' do estado 's' por 'a'
        var n_result = calculate(stack.slice(0), stack.length - 1, n, database.states.slice(0)).value;

        if (s_result != n_result) {
          // Se o resultado da pergunta em 's' for diferente do resultado em 'n',
          // marca a transição entre eles para ser posteriormente removida do grafo
          marked[a].push(...get_symmetric_transition(s.id, n.id));
        }
      }
    }
  }

  return marked;
}

// Remove do grafo transições de um determinado agente
function delete_relations(marked) {
  for (a in marked) {
    for (t of marked[a]) {
      var t_index = database.relations.indexOf(t);
      if (t_index > -1) {
        let a_index = database.relations[t_index].agents.indexOf(a);
        if (a_index > -1) {
          // Atualiza lista de agentes da transição removendo o agente 'a'
          database.relations[t_index].agents = database.relations[t_index].agents.filter(f => f != a);
        }
        for (r of database.relations) {
          // Se a lista de agentes da transição ficou vazia, apaga a transição completamente
          database.relations = database.relations.filter(f => f.agents.length !== 0);
        }
      }
    }

  }
}

// Atualiza o grafo baseado num anúncio privado feito
function private_announcement(agents, proposition) {
  updateDatabaseFromCanvas();

  if (proposition != '') {
    // Marca as transições que precisam ser removidas e depois apaga elas
    // Precisam ser dois passos separados para garantir que não haja inconsistência em anúncios para um conjunto de agentes
    var marked = update_database_based_on_announcement(agents, proposition);
    delete_relations(marked);

    // Atualiza timeline de anúncios
    var resetToPos = (announcementHistory.length !== currentTimelineIndex) ? currentTimelineIndex : -1;
    updateAnnouncementHistory(agents, proposition, resetToPos);

    convertDatabaseToCanvasGraph();
  }
}

// Checa se expressão possui ordem de operandos e operadores válida
function is_valid_expression(expression) {
  var counter = 0;

  for (var i = 0; i < expression.length; i++) {
    var op_string_obj = get_op_string(expression, i, forwards = true);
    var op_string = op_string_obj.op_string;
    i = op_string_obj.new_index;

    if (is_operator(op_string)) {
      var operator = get_operator(op_string);
      counter -= operator.length;

      if (counter < 0) {
        return false;
      }
    }
    counter++;
  }
  return counter == 1;
}

// Lançamento genérico de erro
function throw_error() {
  console.error("This should not be happening.");
  return undefined;
}