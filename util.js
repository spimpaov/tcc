function validateJSON(json){
    try {
        var obj = JSON.parse(json);
    } catch (err) {
        console.error(err.message);
    }
    return obj;
}