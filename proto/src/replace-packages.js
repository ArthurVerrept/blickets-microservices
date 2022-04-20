const fse = require('fs-extra')
const path = require('path')

async function main() {
    const gatewayFolderPath = path.join(__dirname, '../../gateways')
    const protoFilePath = path.join(__dirname, '../../proto/lib')
    const gatewayFolder = await fse.promises.opendir(gatewayFolderPath)
    for await (const folder of gatewayFolder) {
        if(!folder.isFile()) {
            fse.rmSync(path.join(gatewayFolderPath, folder.name, 'node_modules', 'proto-npm'), { recursive: true, force: true })
            let toFolder = path.join(gatewayFolderPath, folder.name, 'node_modules')
            try {
                let newPath = path.join(toFolder, 'proto-npm');

                fse.copySync(protoFilePath, newPath);
            } catch (err) {
                console.log(err)
            }   
        }
    }


    const servicesFolderPath = path.join(__dirname, '../../services')
    const servicesFolder = await fse.promises.opendir(servicesFolderPath)
    for await (const service of servicesFolder) {
        if(!service.isFile()) {
            fse.rmSync(path.join(servicesFolderPath, service.name, 'node_modules', 'proto-npm'), { recursive: true, force: true })
            let toFolder = path.join(servicesFolderPath, service.name, 'node_modules')
            try {
                let newPath = path.join(toFolder, 'proto-npm');
    
                fse.copySync(protoFilePath, newPath);
            } catch (err) {
                console.log(err)
            }   
        }
    }
}

main()