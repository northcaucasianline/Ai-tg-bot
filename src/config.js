const path=require("path");
const {envFile}=require("./runtime");
require("dotenv").config({path:envFile});
module.exports={dryRun:String(process.env.DRY_RUN||"false").toLowerCase()==="true",envFile};
