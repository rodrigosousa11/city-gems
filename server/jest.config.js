module.exports = {
    testEnvironment: 'node',  
    setupFilesAfterEnv: ['./jest.setup.js'],  
    moduleFileExtensions: ['js', 'json', 'jsx', 'node'], 
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],  
    coverageDirectory: './coverage/',  
    collectCoverage: true,  
    collectCoverageFrom: ['**/controllers/*.js', '**/routes/*.js'],  
};
