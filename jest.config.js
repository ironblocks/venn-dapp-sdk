module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};