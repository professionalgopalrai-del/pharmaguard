
const fs = require('fs');
const path = require('path');

async function testApi() {
    const filePath = path.join(process.cwd(), 'public/samples/sample_patient.vcf');
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'text/vcf' });

    const formData = new FormData();
    formData.append('vcfFile', blob, 'sample_patient.vcf');
    formData.append('drugs', 'Codeine,Warfarin');

    console.log('Sending request to http://localhost:3000/api/analyze...');

    try {
        const res = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: formData,
        });

        console.log(`Status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const text = await res.text();
            console.error('Error Body:', text);
            return;
        }

        const data = await res.json();
        console.log('Success!');
        console.log('Meta:', data.meta);
        if (data.results && data.results.length > 0) {
            console.log('First Result Full:', JSON.stringify(data.results[0], null, 2));
        } else {
            console.log('No results found.');
        }

    } catch (err) {
        console.error('Request failed:', err);
    }
}

testApi();
