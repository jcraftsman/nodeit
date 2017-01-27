var chai = require('chai');
var sinon = require('sinon');
var nodeit = require('../nodeit');
var fs = require('fs');

fs.mkdirSync = function () {

};


describe('nodeit', function () {
    beforeEach(function () {
        chai.should();
    });
    describe('modularize', function () {
        it('should export the function from a vanilla js file ', function () {
            // Given
            sinon.stub(fs, 'readFileSync').returns('function desired_function_to_wrap(){}');

            // When
            var wrappedModule = nodeit.modularize('fileName');

            // Then
            wrappedModule.desired_function_to_wrap.should.be.defined;
        });
        it('should export all the functions from a vanilla js file ', function () {
            // Given
            var fileContent = "" +
                "function desired_function_to_wrap() {" +
                "   return  'first wrap';" +
                "}" +
                "function another_desired_function_to_wrap() {" +
                "   return 'second wrap';" +
                "}";
            sinon.stub(fs, 'readFileSync').returns(fileContent);

            // When
            var wrappedModule = nodeit.modularize('fileName');

            // Then
            wrappedModule.desired_function_to_wrap().should.equal('first wrap');
            wrappedModule.another_desired_function_to_wrap().should.equal('second wrap');
        });

        afterEach(function () {
            fs.readFileSync.restore();
        });

    });
    describe('include', function () {
        it('should be defined', function () {
            nodeit.include.should.be.defined;
        });
        it('should add the dependency', function () {
            // Given
            sinon.stub(fs, 'readFileSync').returns('' +
                "function wrapped_function(){" +
                "   dep_name.inspect(0);" +
                "   return 'calling dependencies succeeded!';" +
                "}");

            // When
            var wrappedModule = nodeit.include('dep_name', 'util').modularize('fileName');

            // Then
            wrappedModule.wrapped_function().should.equal('calling dependencies succeeded!');
            fs.readFileSync.restore();

        });
    });

    describe('compile', function () {

        var doesDirExist, createDirectory, createCompiledFile, readSourceFile;
        beforeEach(function () {
            doesDirExist = sinon.stub(fs, 'existsSync');
            createDirectory = sinon.spy(fs, 'mkdirSync');
            createCompiledFile = sinon.spy(fs, 'writeFile');
            readSourceFile = sinon.stub(fs, 'readFileSync');
            readSourceFile.returns('');

        });

        it('should be defined', function () {
            nodeit.compile.should.be.defined;
        });
        it('should create target directory when it does not exist', function () {
            // Given
            doesDirExist.withArgs('./target').returns(false);

            // When
            nodeit.compile('');

            // Then
            sinon.assert.calledWith(createDirectory, './target');

        });
        it('should not create target directory when it exists', function () {
            // Given
            doesDirExist.withArgs('./target').returns(true);

            // When
            nodeit.compile('');

            // Then
            createDirectory.callCount.should.equal(0);

        });

        it('should create the compiled file within target directory', function () {
            // Given
            var sourceFileContent = "" +
                "function desired_function_to_wrap() {" +
                "   return  'first wrap';" +
                "}" +
                "function another_desired_function_to_wrap() {" +
                "   return 'second wrap';" +
                "}";
            readSourceFile.returns(sourceFileContent);


            // When
            nodeit.compile('vanilla');

            // Then
            var compiledContents = "" +
                "function desired_function_to_wrap() {" +
                "   return  'first wrap';" +
                "}" +
                "function another_desired_function_to_wrap() {" +
                "   return 'second wrap';" +
                "}\n" +
                "exports.desired_function_to_wrap = desired_function_to_wrap;\n" +
                "exports.another_desired_function_to_wrap = another_desired_function_to_wrap;";
            createCompiledFile.withArgs('./target/vanilla.js', compiledContents).calledOnce.should.equal(true);
            fs.readFileSync.restore();
        });

        afterEach(function () {
            readSourceFile.restore();
            createDirectory.restore();
            doesDirExist.restore();
            createCompiledFile.restore();

        });
    });
});
