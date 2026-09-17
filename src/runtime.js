const path=require("path");
const portable=Boolean(process.pkg)||process.env.AIDA_SEA==="1";
function appDir(){return portable?path.dirname(process.execPath):path.resolve(__dirname,"..");}
module.exports={appDir,envFile:path.join(appDir(),".env"),dataDir:path.join(appDir(),"data")};
