const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'firebase', 'mockData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add updatedAt to all products
content = content.replace(/createdAt: new Date\(\)\.toISOString\(\)/g, 'createdAt: new Date().toISOString(),\n    updatedAt: new Date().toISOString()');

// Fix 2: Rename id to productId in CartItems
content = content.replace(/\{ id: "p/g, '{ productId: "p');

// Fix 3: Fix UPI casing
content = content.replace(/paymentMethod: "upi"/g, 'paymentMethod: "UPI"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed mockData.ts');
