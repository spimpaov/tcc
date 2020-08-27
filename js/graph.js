function createDatabase(agents, propositions) {
    var states =  calculateGraphStates(propositions);
    var relations = calculateGraphRelations(states.length, agents);
    var database = {states, relations};
    return database
}

function calculateGraphStates(propositions) {
    const statesCombination = (propositions) => { 
        const results = [[]];
        for (const value of propositions) {
            const copy = [...results];
            for (const prefix of copy) {
                results.push(prefix.concat(value));
            }
        }
        return results;
    };

    var statesList = statesCombination(propositions);
    var graphStates = [];
    for (var i = 0; i < statesList.length; i++) {
        graphStates.push({
            "name": i,
            "variables": statesList[i],
        });
    }
    return graphStates;
}

function calculateGraphRelations (numOfStates, agents) { 
    const graphRelations = [];
    for (var i = 0; i < numOfStates - 1; i++) {
        for (var j = i + 1; j < numOfStates; j++) {
            graphRelations.push({
                "source": i, 
                "target": j, 
                "agents": agents,
            });
        }
    }
    return graphRelations;
};