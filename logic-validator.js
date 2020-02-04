var operators = {
    "!": 
    {
        name: "not",
        number_of_operands: 1, 
        method: function(operands) { return !operands[0]; }
    },
    "U":
    {
        name: "or",
        number_of_operands: 2,
        method : function(operands) { return operands[0] || operands[1]; }
    },
    "^": 
    {
        name: "and",
        number_of_operands: 2,
        method : function(operands) { return operands[0] && operands[1]; }
    },
}

var executionStack = [];

function iterateInput(input) {
    for (let char of input) {
        pushToStack(char);
        if (isOperator(char)) {
            pushToStack(calculate());
        }
    }
    validateResult();
    resetStack();
}

function validateResult() {
    if (executionStack.length != 1) {
        renderInvalidQuestion();
    }
}

function isOperator(char) {
    return (char in operators) ? true : false;
}

function getValue(char) {
    return (char in database) ? database[char] : false;
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

//TODO: fazer ele sair do iterateInput por inteiro
function handleInvalidInput(errMessage) {
    console.log(errMessage);
    renderInvalidQuestion();
}

function resetStack() {
    executionStack.length = 0;
}

function calculate() {
    var operator = operators[executionStack.pop()];
    var operands = [];
    
    console.log(operator.number_of_operands);
    for (var i = 0; i < operator.number_of_operands; i++) {
        operands[i] = getValue(popFromStack());
    }
    return operator.method(operands);
}