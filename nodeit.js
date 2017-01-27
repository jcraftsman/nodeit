const COMPIL_TARGET_DIR = __dirname + '/target';
var fs = require('fs');

var dependencies = [];

function include(name, dependency, callback) {
    dependencies.push({'name': name, 'dependency': dependency, 'callback': callback});
    return this;
}

function modularize(fileName) {

    var src = parse(fileName);

    eval(src.fileContent);

    for (var index in src.functionNames) {
        var functionName = src.functionNames[index];
        exports[functionName] = eval(functionName);
    }
    return this;
}

function compile(fileName) {
    var src = parse(fileName);
    var functionNames = src.functionNames;
    var compiledFileContent = src.fileContent;

    for (var index in functionNames) {
        var functionName = functionNames[index];
        compiledFileContent += '\nexports.' + functionName + ' = ' + functionName + ';'
    }
    if (!fs.existsSync(COMPIL_TARGET_DIR)) {
        fs.mkdirSync(COMPIL_TARGET_DIR);
    }
    var compiledFilePath = COMPIL_TARGET_DIR + '/' + removeDirFromPath(src);
    fs.writeFileSync(compiledFilePath, compiledFileContent);
    return require(compiledFilePath);
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

function parse(fileName) {
    var rootDir = __dirname + '/../../';
    fileName += fileName.endsWith('.js') ? '' : '.js';
    var sourceFile = fs.readFileSync(rootDir + fileName);
    var fileContent = declareDependencies() + sourceFile.toString();
    var functionNames = extractFunctionNames(fileContent);
    return {fileName: fileName, fileContent: fileContent, functionNames: functionNames};
}

function removeDirFromPath(src) {
    return src.fileName.substring(src.fileName.lastIndexOf('/') + 1);
}

exports.modularize = modularize;
exports.include = include;
exports.compile = compile;
