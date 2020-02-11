const defaultGraph = [
    {
        state: "x",
        relatedTo: {
            "a": ["Z"],
            "b": ["y", "z"]
        },
        knowledge: ["p"],
    },
    {
        state: "y",
        relatedTo: {
        },
        knowledge: ["p", "t"],
    },
    {
        state: "z",
        relatedTo: {
            "a": ["w"],
        },
        knowledge: ["s"],
    },
    {
        state: "w",
        relatedTo: {
        },
        knowledge: ["p", "t", "s"],
    },
]

function validateQuestionOnGraph(question, root) {
    var result = validateQuestionOnState(question, root);
    renderResult(result);
}

function inputGraphIsEmpty() {
    return (defaultGraph.length === 0) ? true : false;
}

function getGraphRoot() {
    return defaultGraph[0];
}

function renderResult(result) {
    console.log(result);
    document.getElementById('result').innerHTML = result;
}