const csv = require('csv-parser');
const fs = require('fs');

const unique = new Set();
var encounterCnt = 0;

fs.createReadStream('./uofcincin_2021_encounters.csv')
.pipe(csv())
.on('data', (data) => {
    // console.log(data);
    console.log(data['Patient ID']);
    encounterCnt = encounterCnt + 1;
    unique.add(data['Patient ID']);
})
.on('end', () => {
    console.log(`Unique Patients : ${unique.size}`);
    console.log(`Total Encounters: ${encounterCnt}`);
});
