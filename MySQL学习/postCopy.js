const path = require("path");
const fs = require("fs");

// 修改文件扩展名
const util = {
    isFile: fileName => {
        return fs.lstatSync(fileName).isFile()
    }
}

const reName = (dir, ext) => {
    const dir_path = path.resolve(dir);
    console.log(dir_path);
    const fileList = fs.readdirSync(dir_path)
    console.log(fileList);
    for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i]
        file = path.join(dir, file)
        if (util.isFile(file)) {
            let parsed = path.parse(file)
            console.log(parsed)
            let newFileName = parsed.name + ext
            try {
                fs.renameSync(file, path.join(parsed.dir, newFileName))
                console.log(`${file} ========> ${path.join(parsed.dir, newFileName)}`);
            } catch (error) {
                throw (error)
            }
        }
    }
    console.log('done')
}

reName("./海报", ".jpg");