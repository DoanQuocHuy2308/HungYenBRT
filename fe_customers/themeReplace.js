const fs = require('fs');
const path = require('path');

const directory = './app';
const appJsonPath = './app.json';

const colorRules = [
    // Revert recent Green
    { regex: /#15803d/gi, replacement: '#5D4037' },
    { regex: /#16a34a/gi, replacement: '#5E3A21' },
    { regex: /#86efac/gi, replacement: '#DDB892' },
    { regex: /text-green-50\b/g, replacement: 'text-[#F5E6D3]' },
    { regex: /text-green-300\b/g, replacement: 'text-[#DDB892]' },

    // Replace all Blue variants matching hexes
    { regex: /#2563eb/gi, replacement: '#5D4037' }, // blue-600 -> Dark Brown
    { regex: /#1d4ed8/gi, replacement: '#4E342E' }, // blue-700 -> Darker Brown
    { regex: /#3b82f6/gi, replacement: '#7A5448' }, // blue-500 -> Med Brown
    { regex: /#0284c7/gi, replacement: '#5D4037' }, // sky-600 -> Dark Brown
    { regex: /#0ea5e9/gi, replacement: '#8D6E63' }, // sky-500 -> Med Brown

    // Tailwind Blue Classes -> Tailwind Neutral/Brown (Amber/Orange)
    { regex: /bg-blue-900/g, replacement: 'bg-stone-900' },
    { regex: /text-blue-800/g, replacement: 'text-[#4E342E]' },
    { regex: /bg-blue-800/g, replacement: 'bg-[#4E342E]' },
    { regex: /text-blue-700/g, replacement: 'text-[#5D4037]' },
    { regex: /bg-blue-700/g, replacement: 'bg-[#5D4037]' },
    { regex: /border-blue-700/g, replacement: 'border-[#5D4037]' },
    { regex: /text-blue-600/g, replacement: 'text-[#5D4037]' },
    { regex: /bg-blue-600/g, replacement: 'bg-[#5D4037]' },
    { regex: /border-blue-600/g, replacement: 'border-[#5D4037]' },
    { regex: /text-blue-500/g, replacement: 'text-[#7A5448]' },
    { regex: /bg-blue-500/g, replacement: 'bg-[#7A5448]' },
    { regex: /border-blue-500/g, replacement: 'border-[#7A5448]' },
    { regex: /focus:border-blue-500/g, replacement: 'focus:border-[#7A5448]' },
    { regex: /border-blue-400/g, replacement: 'border-[#DDB892]' },
    { regex: /bg-blue-400/g, replacement: 'bg-[#DDB892]' },
    { regex: /bg-blue-300/g, replacement: 'bg-[#E6CBA8]' },
    { regex: /bg-blue-200/g, replacement: 'bg-[#EFDDC4]' },
    { regex: /border-blue-200/g, replacement: 'border-[#EFDDC4]' },
    { regex: /shadow-blue-200/g, replacement: 'shadow-orange-200' },
    { regex: /bg-blue-100/g, replacement: 'bg-[#FDFBF7]' },
    { regex: /border-blue-100/g, replacement: 'border-[#FDFBF7]' },
    
    // Shadows and opacity handling
    { regex: /shadow-blue-900\/(\d+)/g, replacement: 'shadow-stone-900/$1' },
    { regex: /shadow-blue-500\/(\d+)/g, replacement: 'shadow-stone-900/$1' },
    { regex: /bg-blue-50\/(\d+)/g, replacement: 'bg-[#FDFBF7]/$1' },
    { regex: /bg-blue-50\b/g, replacement: 'bg-[#FDFBF7]' },
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.expo' || file === '.git') return;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(directory);
files.push(appJsonPath);

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        colorRules.forEach(rule => {
            newContent = newContent.replace(rule.regex, rule.replacement);
        });
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated colors in ${file}`);
        }
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
});
