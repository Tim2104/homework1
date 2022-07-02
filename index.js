const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const args = yargs
.usage('Usage: $0 [options]')
.help('help')
.alias('help', 'h')
.version('0.0.1')
.alias('version', 'v')
.example('node $0 --entry ./path --dist ./path -D')
.option('entry', {
    alias : 'e',
    describe: 'путь к первому каталогу',
    demandOption: true
})
.option('dist', {
    alias : 'd',
    describe: 'путь ко второму каталогу',
    default: './dist'
})
.option('delete', {
    alias : 'D',
    describe: 'удалить/не удалить исходный каталог',
    default: false,
    boolean: true
})
.argv;


const config = {
    entry: path.join(__dirname, args.entry),
    dist: path.join(__dirname, args.dist),
    isDelete: args.delete
};

let folders = [];

function readDir(src) {
    fs.readdir(src, (err, array) => {
        if(err) throw err;

        for(let n = 0; n < array.length; n++) {
            let elem = array[n];

            let curPath = path.resolve(src, elem);

            fs.stat(curPath, (err, elem) => {
                if(err) throw err;

                if(elem.isDirectory()) {
                    readDir(curPath);
                }
                else {
                    
                    let newDir = config.dist + '/' + path.parse(curPath).name.toUpperCase();

                    if(!fs.existsSync(newDir)) {
                        fs.mkdir(newDir, {recursive: false}, (err) => {
                            if(err) throw err;
                        });

                        let newfile = newDir + '/' + path.parse(curPath).base;

                        fs.link(curPath, newfile, (err) => {
                            if(err) throw err;

                            console.log('copy' + curPath);
                        });

                    }

                }
            });

        }
    });
}

function removeFile(src) {

    fs.readdir(src, (err, array) => {
        if(err) throw err;
        
        for(let n = 0; n < array.length; n++) {
            let elem = array[n];

            let curPath = path.resolve(src, elem);

            fs.stat(curPath, (err, elem) => {
                if(err) throw err;

                if(elem.isDirectory()) {

                    removeFile(curPath);
                }
                else {
                    
                    fs.unlink(curPath, (err) => {
                        if(err) throw err;
                    });

                    console.log('delete file' + curPath);
                }
            });
        }
    });
}

function removeDir(src) {

    fs.readdir(src, (err, array) => {
        if(err) throw err;
        
        for(let n = 0; n < array.length; n++) {
            let elem = array[n];

            let curPath = path.resolve(src, elem);

            fs.stat(curPath, (err, elem) => {
                if(err) throw err;

                if(elem.isDirectory()) {

                    folders.unshift(curPath);
                    removeDir(curPath);
                }
            });

        }
    });
    for(let i = 0; i < folders.length; i++) {

        fs.rmdir(folders[i], (err) => {
            if(err) return;
        });

        console.log('delete dir');
    }
}

readDir(config.entry);

if(config.isDelete) {
    removeDir(config.entry);
    removeFile(config.entry);
    
}
