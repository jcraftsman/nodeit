var fs = require('fs');

var dependencies = [];

function include(name, dependency, callback) {
    dependencies.push({'name': name, 'dependency': dependency, 'callback': callback});
    return this;
}

function modularize(fileName) {

    var rootDir = __dirname + '/';
    fileName += fileName.endsWith('.js') ? '' : '.js';
    var sourceFile = fs.readFileSync(rootDir + fileName);
    var fileContent = sourceFile.toString();
    var functionNames = extractFunctionNames(fileContent);
    fileContent = declareDependencies() + fileContent;
    eval(fileContent);

    for (var index in functionNames) {
        exports[functionNames[index]] = eval(functionNames[index]);
    }
    return this;
}

function declareDependencies() {
    var declareDependencies = '';
    for (var depIndex in dependencies) {
        var oneDependency = dependencies[depIndex];
        declareDependencies += 'var ' + oneDependency.name +
            " = require('" + oneDependency.dependency + "'," + oneDependency.callback + ');\n';
    }
    return declareDependencies;
}

function extractFunctionNames(fileContent) {
    var rawFunctionNames = fileContent.match(/function (.*?)\(/g);
    var functionNames = [];
    for (var functionIndex in rawFunctionNames) {
        var functionName = rawFunctionNames[functionIndex].replace('function ', '').replace('(', '').trim();
        if (functionName) {
            functionNames.push(functionName);
        }
    }
    return functionNames;
}

exports.modularize = modularize;
exports.include = include;