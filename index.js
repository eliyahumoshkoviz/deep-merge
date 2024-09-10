const fs = require('fs');
const path = require('path');

const readJsonFile =
    (fileName) => {
        const filePath = path.join(__dirname, fileName);
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw error;
        }
    }

function findIdField(obj) {
    const idField = Object.keys(obj).find(key => key.toLowerCase().startsWith('id') || key.toLowerCase().endsWith('id'));
    return idField || null;
}

function mergeArrays(arr1, arr2) {
    const mergedArray = [...arr1];
    arr2.forEach(item2 => {
        const idField2 = findIdField(item2);
        if (idField2) {
            const existingItemIndex = mergedArray.findIndex(item1 => {
                const idField1 = findIdField(item1);
                return idField1 && item1[idField1] === item2[idField2];
            });
            if (existingItemIndex !== -1) mergedArray[existingItemIndex] = deepMerge(mergedArray[existingItemIndex], item2);
            else mergedArray.push(item2);
        } else {
            mergedArray.push(item2);
        }
    });
    return mergedArray;
}

function deepMerge(target, source) {
    if (typeof target !== 'object' || typeof source !== 'object') return target;
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (Array.isArray(source[key])) {
                if (!Array.isArray(target[key])) target[key] = [];
                target[key] = mergeArrays(target[key], source[key]);
            } else if (typeof source[key] === 'object') {
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function deepMergeWrapper(obj1, obj2) {
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        return obj1.map((item1, index) => {
            const item2 = obj2[index];
            return deepMerge(item1, item2);
        });
    } else if (Array.isArray(obj1) && !Array.isArray(obj2)) {
        return obj1.map(item => deepMerge(item, obj2));
    } else if (!Array.isArray(obj1) && Array.isArray(obj2)) {
        return obj2.map(item => deepMerge(obj1, item));
    } else {
        return deepMerge(obj1, obj2);
    }
}

const obj1 = readJsonFile('userDetails.json')
const obj2 = readJsonFile('updateUserDetails.json')
const mergedObj = deepMergeWrapper(obj1, obj2);
console.log(mergedObj);

