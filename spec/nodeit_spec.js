var chai = require('chai');
var sinon = require('sinon');
var nodeit = require('../nodeit');
var fs = require('fs');


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

            //Then
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

            //Then
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

            //Then
            wrappedModule.wrapped_function().should.equal('calling dependencies succeeded!');
        })
    });
});
