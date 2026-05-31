const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'firebase', 'mockData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The items currently look like: { productId: "p1", name: ... }
// We need them to have an id as well: { id: "cart-item-1", productId: "p1", ... }
let i = 0;
content = content.replace(/\{ productId: /g, () => `{ id: "cart_item_${++i}", productId: `);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed CartItems in mockData.ts');
