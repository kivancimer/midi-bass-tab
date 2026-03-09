const fs = require('fs');
const path = require('path');

const MIDI_DIR = './midi';
const OUTPUT_FILE = './midi-files.json';

function scanMidiFiles() {
    try {
        // Check if midi directory exists
        if (!fs.existsSync(MIDI_DIR)) {
            console.error(`Error: ${MIDI_DIR} directory not found`);
            process.exit(1);
        }

        // Read all files in the midi directory
        const files = fs.readdirSync(MIDI_DIR);
        
        // Filter and process MIDI files
        const midiFiles = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ext === '.mid' || ext === '.midi';
            })
            .map(file => {
                const filePath = path.join(MIDI_DIR, file);
                const stats = fs.statSync(filePath);
                
                // Create a clean display name
                let displayName = file
                    .replace(/\.(mid|midi)$/i, '')
                    .replace(/\s*\[bass\]\s*/i, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                // Format file size
                const sizeBytes = stats.size;
                let sizeStr;
                if (sizeBytes < 1024) {
                    sizeStr = `${sizeBytes} B`;
                } else if (sizeBytes < 1024 * 1024) {
                    sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`;
                } else {
                    sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
                }
                
                return {
                    name: file,
                    displayName: displayName,
                    size: sizeStr,
                    sizeBytes: sizeBytes,
                    modified: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        // Write the JSON file
        const output = {
            generatedAt: new Date().toISOString(),
            count: midiFiles.length,
            files: midiFiles
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        
        console.log(`✅ Scanned ${midiFiles.length} MIDI file(s)`);
        midiFiles.forEach(f => {
            console.log(`   • ${f.displayName} (${f.size})`);
        });
        console.log(`\n📄 Generated ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error scanning MIDI files:', error.message);
        process.exit(1);
    }
}

scanMidiFiles();