const readline = require('readline');
const fs = require('fs');

const inputFileName = process.argv[3] || 'cities.txt';

const rl = readline.createInterface({
      input: fs.createReadStream(inputFileName)
});

const citiesMap = {};
const cities = [];

rl.on('line', (line) => {
	line = line.toLowerCase();
	if (citiesMap[line.charAt(0)] === undefined) {
		citiesMap[line.charAt(0)] = [];
	}
	citiesMap[line.charAt(0)].push(line);
	cities.push(line);
}).on('close', () => {
	const citiesMapResult = "const citiesMap = " + JSON.stringify(citiesMap) + ";\n";
	const citiesResult = "const cities = " + JSON.stringify(cities) + ";";
	fs.writeFileSync('cities.js', citiesMapResult + citiesResult, 'utf8');
} );
