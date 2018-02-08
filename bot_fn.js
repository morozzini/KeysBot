module.exports.botstr = require("./bot_string.js");

module.exports.getCommand = instr => {
    if (!instr)
        return `${this.botstr.err_text_Prefix} ${this.botstr.err_text_NotSetInStr}`;

    let command={err : false};

    let splstr = instr.trim().replace(/^<@\d{18}>,?\s*/, "").replace(/\s{2,}/g, " ").split(/\s+/);
    
    let isHelp = false;
    let iHelp = 0;
    let iStart = 0;
    let iEnd = splstr.length;

    if(this.checkCommand(splstr[iStart]).cmd === `help`){
        iHelp = iStart;
        isHelp = true;
        iStart++;
    }
    else if(this.checkCommand(splstr[iEnd-1]).cmd === `help`){
        iHelp = iEnd-1;
        isHelp = true;
        iEnd--;
    }

    
    for (let i = iStart; i < iEnd; i++){
        comm = this.checkCommand(splstr[i]);
        
        if(!(`cmd` in command)){
            if(!comm.err){
                command.cmd = comm.cmd;
                if(comm.scmd != ``){
                    command.scmd = comm.scmd;
                }
            }
            else{
                command.err = true;
                command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_UnknownCommand, splstr[i])}`;
            }
        }
        else{
            if(!(`scmd` in command) && (!this.checkCommand(`${command.cmd}${splstr[i]}`).err)){
                comm = this.checkCommand(`${command.cmd}${splstr[i]}`);
                command.cmd = comm.cmd;
                command.scmd = comm.scmd;
            }
            else if (/^(getkey)$/.test(command.cmd)){
                if(/^\d+$/.test(splstr[i])){
                    if(!(`id` in command)){
                        command.id = splstr[i];
                    }
                    else{
                        command.err = true;
                        command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,` (${this.botstr.err_text_WrongUseCommand_WrongIndex})`])}`;
                    }
                }
                else{
                    command.err = true;
                    command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, command.cmd)}`;
                }
            }
            else if (/^(del|set|stop)$/.test(command.cmd)){
                if(/^(\d+(-\d+)?,?)+$/.test(splstr[i])){
                    if(!(`id` in command)){
                        command.id = splstr[i].replace(/,/g, " ");
                    }
                    else{
                        command.id += ` ${splstr[i].replace(/,/g, " ")}`;
                    }
                }
                else{
                    command.err = true;
                    command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, command.cmd)}`;
                }
            }
            else if (/^(start)$/.test(command.cmd)){
                if(/^(\d+(-\d+)?,?)+$/.test(splstr[i])){
                    if(!(`id` in command)){
                        command.id = splstr[i].replace(/,/g, " ");
                    }
                    else{
                        command.id += ` ${splstr[i].replace(/,/g, " ")}`;
                    }
                }
                else if (/^(\d+[hms]){1,3}$/.test(splstr[i])){
                    if(!(`time` in command)){
                        command.time = this.getTimeOut(splstr[i]);
                    }
                    else if((`time` in command)){
                        command.time += this.getTimeOut(splstr[i]);
                    }
                    
                    if(command.time > 86400000){ //24 часа
                        command.time = 86400000;
                    }
                    else if (command.time < 300000){ //5 минут
                        command.time = 300000;
                    }
                }
                else{
                    command.err = true;
                    command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, command.cmd)}`;
                }
            }
            else if (/^add$/.test(command.cmd)){
                if (!(`name` in command)){
                    command.name = `${splstr[i]}`;
                }
                else if(i == (iEnd-1)){
                    command.key = splstr[i];
                }
                else{
                    command.name += ` ${splstr[i]}`;
                }
            }
            else{
                command.err = true;
                command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, `${command.cmd}${('scmd' in command)?command.scmd:''}`)}`;
            }
        }

        if(command.err){
            break;
        }
    }

    if(isHelp){
        if(`cmd` in command){
            if(command.cmd != `help`){
                command.scmd = (`scmd` in command)?`${command.cmd}${command.scmd}`:`${command.cmd}`;
                command.cmd = `help`;
            }
            command.err = false;
            delete command.prm;
            delete command.id;
            delete command.time;
            delete command.name;
            delete command.key;
        }
        else if (!command.err){
            command = this.checkCommand(splstr[iHelp]);
        }
    }
    else if(!command.err && /^(getkey|del|set)$/.test(command.cmd)){
        if(!(`id` in command)){
            command.err = true;
            command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,` (${this.botstr.err_text_WrongUseCommand_UnsetIndex})`])}`;
        }
    }
    else if(!command.err && /^start$/.test(command.cmd)){
        if(!(`id` in command)){
            command.err = true;
            command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,` (${this.botstr.err_text_WrongUseCommand_UnsetIndex})`])}`;
        }
        else if (!(`time` in command)){
            command.err = true;
            command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,` (${this.botstr.err_text_WrongUseCommand_UnsetTime})`])}`;
        }
        else if(command.time == 0){
            command.err = true;
            command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,` (${this.botstr.err_text_WrongUseCommand_WrongTime})`])}`;
        }
    }
    else if(!command.err && /^add$/.test(command.cmd)){
        if(!(`name` in command)){
            command.err = true;
            command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,`(${this.botstr.err_text_WrongUseCommand_UnsetName})`])}`;
        }
        else if (!(`key` in command)){
            command.err = true;
            command.prm = `${this.botstr.err_text_Prefix} ${this.getText(this.botstr.err_text_WrongUseCommand, [command.cmd,`(${this.botstr.err_text_WrongUseCommand_UnsetKey})`])}`;
        }
    }
    
    if(command.err){
        //delete command.cmd;
        //delete command.scmd;
        delete command.id;
        delete command.time;
        delete command.name;
        delete command.key;
    }
    return command;
}

module.exports.checkCommand = instr => {
    let instrL = instr.toLowerCase().replace(new RegExp(`^${this.botstr.cmd_Prefix}`),"");
    let command = "";
    let subcmd = "";
    let error = false;

    if (/^help$/.test(instrL)) {
        command = `help`;
        subcmd = `help`;
    }
    else if (/^(helpshort|\?)$/.test(instrL)) {
        command = `help`;
        subcmd = `short`;
    }
    else if (/^about$/.test(instrL)) {
        command = `about`;
    }
    else if (/^status$/.test(instrL)) {
        command = `status`;
    }
    else if (/^ping$/.test(instrL)) {
        command = `ping`;
    }
    else if (/^addme$/.test(instrL)){
        command = `addme`;
    }
    else if (/^whereme$/.test(instrL)){
        command = `whereme`;
    }
    else if (/^(getkey|gk)$/.test(instrL)){
        command = `getkey`;
    }
    else if (/^(getcat|getrandomkey|getrkey|gc)$/.test(instrL)){
        command = `getrandomkey`;
    }
    else if (/^(show|sh|ls)$/.test(instrL)){
        command = `show`;
    }
    else if (/^(showmy|shmy|shm|sm|my)$/.test(instrL)){
        command = `show`;
        subcmd = `my`;
    }
    else if (/^(showkey|shkey|shk|sk|key)$/.test(instrL)){
        command = `show`;
        subcmd = `key`;
    }
    else if (/^(showlot|shlot|shl|sl|lottery|lot)$/.test(instrL)){
        command = `show`;
        subcmd = `lot`;
    }
    else if (/^(showlotrun|shlotrun|shlr|slr|lotteryrun|lotrun|run)$/.test(instrL)){
        command = `show`;
        subcmd = `lotrun`;
    }
    else if (/^(shownext|shnext|shn|sn|next)$/.test(instrL)){
        command = `show`;
        subcmd = `next`;
    }
    else if (/^(addkey|ak|add)$/.test(instrL)){
        command = `add`;
        subcmd = `key`;
    }
    else if (/^(addlot|al)$/.test(instrL)){
        command = `add`;
        subcmd = `lot`;
    }
    else if (/^(setkey|setk|stk)$/.test(instrL)){
        command = `set`;
        subcmd = `key`
    }
    else if (/^(setlot|setl|stl)$/.test(instrL)){
        command = `set`;
        subcmd = `lot`
    }
    else if (/^(delete|del|rm)$/.test(instrL)){
        command = `del`;
    }
    else if (/^(start|lottery)$/.test(instrL)){
        command = `start`;
    }
    else if (/^stop$/.test(instrL)){
        command = `stop`;
    }
    else{
        error = true;
        command = ``;
    }

    return {
        err : error,
        cmd : command,
        scmd : subcmd
    }
}

module.exports.getTimeOut = function (instr) {
    var command = "";
    var commandfull = "";

    var inms = 0;

    var cmdd = instr.match(/\d+[hms]/g);
    cmdd.forEach(element => {
        if (element.endsWith("h")) {
            inms += element.substr(0, element.length - 1) * 3600000;
        }
        else if (element.endsWith("m")) {
            inms += element.substr(0, element.length - 1) * 60000;
        }
        else if (element.endsWith("s")) {
            inms += element.substr(0, element.length - 1) * 1000;
        }
    }, this);

    if (inms > 86400000) { //24 часа максимум
        inms = 86400000;
    }
    else if (inms === 0) {
        return 0;
    }

    return inms;
}

module.exports.getIdRequest = function(inId = ""){
    if(inId == ``){
        return `id=0`;
    }

    let splstr = inId.split(/\s+/);
    let reqstr = ``;
    let reqstrIN = ``;
    let needIN = false;
    let reqstrBETWEEN = ``;
    
    splstr.forEach(element =>{
        if(/^\d+$/.test(element)){
            if(reqstrIN == ``){
                reqstrIN = `${element}`;
            }
            else{
                reqstrIN += `,${element}`
                needIN = true;
            }
        }
        else if (/^\d+-\d+$/.test(element)){
            let IDfrom = +element.substr(0,element.indexOf(`-`));
            let IDto = +element.substr(element.indexOf(`-`)+1);
            if(reqstrBETWEEN == ``){
                reqstrBETWEEN = `id BETWEEN ` + (IDfrom <= IDto?`${IDfrom} AND ${IDto}`:`${IDto} AND ${IDfrom}`);
            }
            else{
                reqstrBETWEEN += ` OR id BETWEEN ` + (IDfrom <= IDto?`${IDfrom} AND ${IDto}`:`${IDto} AND ${IDfrom}`);
            }
        }
    });

    if(reqstrIN != ``){
        if(needIN){
            reqstr = `id IN (${reqstrIN})`;
        }
        else{
            reqstr = `id=${reqstrIN}`;
        }

        if(reqstrBETWEEN != ``){
            reqstr += ` OR ${reqstrBETWEEN}`;
        }
    }
    else if (reqstrBETWEEN != ``){
        reqstr = `${reqstrBETWEEN}`;
    }
    else{
        reqstr = `id=0`;
    }
    
    return reqstr;
}

module.exports.getTimeOutStr = function (InTimeOut) {
    var inms = InTimeOut;

    if (inms > 86400000) { //24 часа максимум
        inms = 86400000;
    }
    else if (inms === 0) {
        return 0;
    }

    var outH = Math.floor(inms / 3600000);
    var outM = Math.floor((inms - outH * 3600000) / 60000);
    var outS = Math.floor((inms - outH * 3600000 - outM * 60000) / 1000);

    var outstr = "";
    if (outH > 0) {
        if (/(1[1234]|[5-9]|0)$/.test(outH)) {
            outstr += `${outH} часов `;
        }
        else if (/[234]$/.test(outH)) {
            outstr += `${outH} часа `;
        }
        else {
            outstr += `${outH} час `;
        }
    }

    if (outM > 0) {
        if (/(1[1234]|[5-9]|0)$/.test(outM)) {
            outstr += `${outM} минут `;
        }
        else if (/[234]$/.test(outM)) {
            outstr += `${outM} минуты `;
        }
        else {
            outstr += `${outM} минуту `;
        }
    }

    if (outS > 0) {
        if ((outH > 0) && (outM > 0)) {
            outstr += `и `;
        }
        if (/(1[1234]|[5-9]|0)$/.test(outS)) {
            outstr += `${outS} секунд`;
        }
        else if (/[234]$/.test(outS)) {
            outstr += `${outS} секунды`;
        }
        else {
            outstr += `${outS} секунду`;
        }
    }

    return outstr.trim();
}

module.exports.getTextErr = function (TextStr = "", InParam = "") {
    return `${this.botstr.err_text_Prefix} ${this.getText(TextStr,InParam)}`;
}

module.exports.getText = function (TextStr = "", InParam = "") {
    if (InParam === "")
        return TextStr.replace(/\${\d?}/g, "");

    var arrstr = TextStr.split(/(\${\d?})/g);
    var arrparam = [];
    if (Array.isArray(InParam)) {
        arrparam = InParam;
    }
    else {
        arrparam.push(InParam);
    }

    var j = 0;
    var num = 0;
    for (i = 0; i < arrstr.length; i++) {
        if (/\${}/.test(arrstr[i])) {
            arrstr[i] = arrparam[j];
            j == InParam.length - 1 ? j = 0 : j++;
        }
        else if (/\${\d}/.test(arrstr[i])) {
            num = arrstr[i].match(/\d/)[0];
            if (num < arrparam.length) {
                arrstr[i] = arrparam[num];
            }
            else {
                arrstr[i] = "";
            }
        }
    };

    return `${arrstr.join("")}`;
}

module.exports.getHelp =  incmd => {
    if (!incmd)
        return this.getHelpEmbed("help", this.botstr.help_text_Help);

    let command = "";
    if (typeof(incmd) == `string`){
        command = incmd || "";
    }
    else if (`scmd` in incmd) {
        command = incmd.scmd || "";
    }
    else {
        command = `help`;
    }

    switch (command) {
        case "short":
            //return { description: `${this.botstr.help_text_ShortHelp}` };
            return this.getHelpShortEmbed();
            break;
        case "addme":
            return this.getHelpEmbed("addme", this.botstr.help_text_Addme);
            break;
        case "whereme":
            return this.getHelpEmbed("whereme", this.botstr.help_text_Whereme);
            break;
        case "status":
            return this.getHelpEmbed("status", this.botstr.help_text_Status);
            break;
        case "getkey":
            return this.getHelpEmbed("getkey", this.botstr.help_text_Getkey);
            break;
        case "show":
            return this.getHelpEmbed("show", this.botstr.help_text_Show);
            break;
        case "showmy":
            return this.getHelpEmbed("showmy", this.botstr.help_text_Showmy);
            break;
        case "showkey":
            return this.getHelpEmbed("showkey", this.botstr.help_text_Showkey);
            break;
        case "showlot":
            return this.getHelpEmbed("showlot", this.botstr.help_text_Showlot);
            break;
        case "showlotrun":
            return this.getHelpEmbed("showlotrun", this.botstr.help_text_Showlotrun);
            break;
        case "shownext":
            return this.getHelpEmbed("shownext", this.botstr.help_text_Shownext);
            break;
        case "addkey":
            return this.getHelpEmbed("addkey", this.botstr.help_text_Addkey);
            break;
        case "addlot":
            return this.getHelpEmbed("addlot", this.botstr.help_text_Addlot);
            break;
        case "setkey":
            return this.getHelpEmbed("setkey", this.botstr.help_text_Setkey);
            break;
        case "setlot":
            return this.getHelpEmbed("setlot", this.botstr.help_text_Setlot);
            break;
        case "del":
            return this.getHelpEmbed("del", this.botstr.help_text_Del);
            break;
        case "start":
            return this.getHelpEmbed("start", this.botstr.help_text_Start);
            break;
        case "stop":
            return this.getHelpEmbed("stop", this.botstr.help_text_Stop);
            break;
        default:
            return this.getHelpEmbed("help", this.botstr.help_text_Help);
    }
}

module.exports.getHelpEmbed = function (Command = "", TextStr = "") {
    return {
        title: this.getText(this.botstr.help_text_TitleCommand, Command),
        description: `${this.botstr.help_text_DescriptionUsing}\n${TextStr}`
    };
}

module.exports.getHelpShortEmbed = () => {
    let ArrShortStr = this.botstr.help_text_ShortHelp.split(`|`);
    /*/
    let embed = {"fields" : []};
    for (let i = 0; i < ArrShortStr.length; i+=2){
        embed.fields.push({
            "name" : ArrShortStr[i],
            "value" : ArrShortStr[i+1]
        })
    }
    //* /
    let embed = {"description" : ""};
    embed.description = "```Markdown\n";
    for (let i = 0; i < ArrShortStr.length; i+=2){
        embed.description += `* ${ArrShortStr[i]}\n> ${ArrShortStr[i+1]}\n`;
    }
    embed.description += "```";
    //*/
    let embed = {"description" : ""};
    for (let i = 0; i < ArrShortStr.length; i+=2){
        embed.description += `\`${ArrShortStr[i]}\` - ${ArrShortStr[i+1]}\n`;
    }
    /*/
    let embed = {"description" : ""};
    for (let i = 0; i < ArrShortStr.length; i+=2){
        embed.description += `**${ArrShortStr[i]}** - ${ArrShortStr[i+1]}\n`;
    }
    //*/
    return embed;
}

module.exports.getStartEmbed = function (InParam = "") {
    return {
        title: this.botstr.start_text_LotteryStartedTitle,
        description: `${this.getText(this.botstr.start_text_LotteryStartedText, InParam)}`
    }
}

module.exports.getAboutEmbed = BotAvatarUrl => {
    return {
        "title": "Бот для раздачи ключей.",
        "description": "Этот бот предназначен для раздачи ключей, которые пользователи сами добавляют.\nЧтобы узнать доступные команды отправь боту команду __help__.",
        "color": 614259,
        "thumbnail": {
            "url": BotAvatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`
        },
        "fields": [
            {
                "name": "Исходный код",
                "value": "[GitHub](https://github.com/morozzini/KeysBot)"
            },
            {
                "name": "Разработчик",
                "value": "morozzini#7238 [Telegram](https://t.me/morozzini)"
            },
            {
                "name": "Тестеры",
                "value": "Den1sArt#5682, Jarek#3024, Templar Tassadar#3103, "
            }
        ]
    }
}