var operators = {
    "!": 
    {
        name: "not",
        number_of_operands: 1, 
        number_of_extra_characters: 0,
        method: function(operands) { 
            return !operands[0]; 
        }
    },
    "U":
    {
        name: "or",
        number_of_operands: 2,
        number_of_extra_characters: 0,
        method : function(operands) { 
            return operands[0] || operands[1]; 
        }
    },
    "^": 
    {
        name: "and",
        number_of_operands: 2,
        number_of_extra_characters: 0,
        method : function(operands) { 
            return operands[0] && operands[1]; 
        }
    },
    "K": 
    {
        name: "knows",
        number_of_operands: 1,
        number_of_extra_characters: 1,
        method : function(operands) { 
            return operands[0]; 
        }
    },
    "B": 
    {
        name: "believes",
        number_of_operands: 1,
        number_of_extra_characters: 1,
        method : function(operands) { 
            return operands[0]; 
        }
    },
}

// Pilha que guarda somente os operandos referentes ao operador que 
// está sendo avaliado no momento (incluindo o próprio operando)
var executionStack = [];

function validateQuestionOnState(question, currentState) {

    for (var index = 0; index < question.length; index++) {
        var char = question[index];
        pushToStack(char);
        if (isOperator(char)) {
            var operator = operators[char];
            // console.log("operator:" + operator);
            // console.log("extra: " + operator.number_of_extra_characters);

            // for (var extra = 0; extra < operator.number_of_extra_characters; extra++) {
            //     console.log("push do char extra: " + question[index + extra + 1]);
            //     pushToStack(question[index + extra + 1]);
            //     index++;
            // }
            var result = calculate(operator, currentState);
            pushToStack(result);
        }
    }

    var output = undefined;
    if (executionStack.length === 1) {
        output = getValue(executionStack[0], currentState.knowledge);
    } else {
        //invalid input!
        renderInvalidQuestion();
        output = undefined;
    }
    resetStack();
    return output;
}

function isOperator(char) {
    return (char in operators) ? true : false;
}

function getValue(element, database) {
    return (element === true || database.includes(element)) ? true : false;
}

function pushToStack(element) {
    executionStack.push(element);
    console.log(executionStack);
}

function popFromStack() {
    element = executionStack.pop();
    try {
        if (element == undefined) throw new Error("Invalid input!");
    } catch (err) {
        handleInvalidInput(err);
    }
    return element;
}

function handleInvalidInput(errMessage) {
    console.log(errMessage);
    renderInvalidQuestion();
}

function resetStack() {
    executionStack.length = 0;
}

// calculate faz o pop da pilha dos operandos e do operador
// sendo avaliado, além de executar a função definida no operador
function calculate(operator, currentState) {
    // var operand_extra_chars = [];
    var operands = [];

    // //pop dos extras
    // for (var i = 0; i < operator.number_of_extra_characters; i++) {
    //     operand_extra_chars[i] = popFromStack();
    // }

    //pop do operador
    popFromStack();
    
    //pop dos operandos
    for (var i = 0; i < operator.number_of_operands; i++) {
        operands[i] = getValue(popFromStack(), currentState.knowledge);
    }
    return operator.method(operands);
}