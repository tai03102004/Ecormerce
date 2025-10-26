'use strict';
const {
    mongoose
} = require('mongoose');
const os = require('os');
const process = require('process');

const _SECOND = 5000;
const countConnects = async () => {
    const numberConnect = mongoose.connections.length;
    console.log('Number connections: ', numberConnect);
}

const checkOverload = async () => {
    setInterval(() => {
        const numberConnect = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsed = process.memoryUsage().rss / 1024 / 1024;
        // Example maxium number of connections based on number of CPU cores
        const maxConnections = numCores * 5;
        if (numberConnect > maxConnections) {
            console.warn(`Overload detected: ${numberConnect} connections (max: ${maxConnections})`);
        }
        console.log(`Number of connections: ${numberConnect}`);
        console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`);
    }, _SECOND);
}

module.exports = {
    checkOverload,
    countConnects
};