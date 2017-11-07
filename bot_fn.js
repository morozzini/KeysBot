const botstr = require("./bot_string");

module.exports.getCommand = instr => {
    if (!instr)
        return `${botstr.err_text_Prefix} ${botstr.err_text_NotSetInStr}`;

    var command={err : false};

    let clearstr = instr.trim().replace(/^<@\d{18}>,?\s*/, "").replace(/\s{2,}/g, " ");;
    let splstr = clearstr.split(/\s+/);;
    
    let isHelp = false;
    let helpPrm = "";
    let iStart = 0;
    let iEnd = splstr.length;

    if(checkCommand(splstr[0]).cmd === `help`){
        helpPrm = checkCommand(splstr[0]).prm;
        isHelp = true;
        iStart++;
    }
    else if(checkCommand(splstr[iEnd-1]).cmd === `help`){
        helpPrm = checkCommand(splstr[iEnd-1]).prm;
        isHelp = true;
        iEnd--;
    }

    
    for (let i = iStart; i < iEnd; i++){
        comm = checkCommand(splstr[i]);
        
        if(!comm.err){
            if(!(`cmd` in command)){
                command.cmd = comm.cmd;
                if(comm.prm != ``){
                    command.prm = comm.prm;
                }
            }
            else if (/^add(key|lot)$/.test(command.cmd)){
                if (!(`name` in command)){
                    command.name = `${splstr[i]}`;
                }
                else{
                    command.name += ` ${splstr[i]}`;
                }
            }
            else{
                command.err = true;
                command.prm = /^([\d]+|undefined)$/.test(command.prm)?command.cmd:`${command.cmd}${command.prm}`;
                command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, `${command.prm}`)}`;
            }
        }
        else{
            if(!(`cmd` in command)){
                command.err = true;
                command.cmd = splstr[i];
                command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_UnknownCommand, splstr[i])}`;
            }
            else if((`cmd` in command) && !(`prm` in command) && (!checkCommand(`${command.cmd}${splstr[i]}`).err)){
                command.prm = splstr[i];
            }
            else if (/^(getkey|del|(del|set)(key|lot)|stop)$/.test(command.cmd)){
                if(/^\d+$/.test(splstr[i])){
                    if(!(`id` in command)){
                        command.id = splstr[i];
                        //command.prm = `id${splstr[i]}`;
                    }
                    else{
                        command.err = true;
                        command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,` (${botstr.err_text_WrongUseCommand_WrongIndex})`])}`;
                    }
                }
                else{
                    command.err = true;
                    command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, command.cmd)}`;
                }
            }
            else if (/^(start)$/.test(command.cmd)){
                if(/^\d+$/.test(splstr[i])){
                    if(!(`id` in command)){
                        command.id = splstr[i];
                        //command.prm = `id${splstr[i]}`;
                    }
                    else{
                        command.err = true;
                        command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,` (${botstr.err_text_WrongUseCommand_WrongIndex})`])}`;
                    }
                }
                else if (/^(\d+[hms]){1,3}$/.test(splstr[i])){
                    if(!(`time` in command)){
                        command.time = this.getTimeOut(splstr[i]);
                        //command.prm = `id${splstr[i]}`;
                    }
                    else if((`time` in command)){
                        command.time += this.getTimeOut(splstr[i]);
                        //command.prm = `id${splstr[i]}`;
                        if(command.time > 86400000)
                            command.time = 86400000;
                    }
                }
                else{
                    command.err = true;
                    command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, command.cmd)}`;
                }
            }
            else if (/^add(key|lot)$/.test(command.cmd)){
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
                command.cmd = /^([\d]+|undefined)$/.test(command.prm)?command.cmd:`${command.cmd}${command.prm}`;
                command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, `${command.cmd}`)}`;
            }
        }

        if(command.err){
            break;
        }
    }

    if(!command.err && /^(getkey|del|(del|set)(key|lot)|stop)$/.test(command.cmd)){
        if(!(`id` in command)){
            command.err = true;
            command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,` (${botstr.err_text_WrongUseCommand_UnsetIndex})`])}`;
        }
    }
    else if(!command.err && /^start$/.test(command.cmd)){
        if(!(`id` in command)){
            command.err = true;
            command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,` (${botstr.err_text_WrongUseCommand_UnsetIndex})`])}`;
        }
        else if (!(`time` in command)){
            command.err = true;
            command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,` (${botstr.err_text_WrongUseCommand_UnsetTime})`])}`;
        }
        else if(command.time == 0){
            command.err = true;
            command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,` (${botstr.err_text_WrongUseCommand_WrongTime})`])}`;
        }
    }
    else if(!command.err && /^add(key|lot)$/.test(command.cmd)){
        if(!(`name` in command)){
            command.err = true;
            command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,`(${botstr.err_text_WrongUseCommand_UnsetName})`])}`;
        }
        else if (!(`key` in command)){
            command.err = true;
            command.prm = `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand, [command.cmd,`(${botstr.err_text_WrongUseCommand_UnsetKey})`])}`;
        }
    }
    

    if(isHelp){
        if("cmd" in command){
            if(!checkCommand(`${command.cmd}${command.prm}`).err){
                command.prm = `${command.cmd}${command.prm}`;
                command.cmd = `help`;
                command.err = false;
            }
            else if(!checkCommand(command.cmd).err){
                command.prm = command.cmd;
                command.cmd = `help`;
                command.err = false;
            }
        }
        else{
            command.cmd = `help`;
            command.prm = helpPrm;
            command.err = false;
            
        }
    }

    if((command.err) || (isHelp)){
        delete command.id;
        delete command.time;
        delete command.name;
        delete command.key;
    }
    return command;
    ///^(addme|whereme|s(how(my|key|lot|lotrun|next)?|[hmkln]|lr)|getkey|del|(del|set|add)(key|lot)|start|stop)$/
   
}

function checkCommand(instr){
    var instrL = instr.toLowerCase();
    var command = "";
    var param = "";
    var error = false;

    if (/^help$/.test(instrL)) {
        command = `help`;
    }
    else if (/^\?$/.test(instrL)) {
        command = `help`;
        param = `short`;
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
    else if (/^(show|sh)$/.test(instrL)){
        command = `show`;
    }
    else if (/^(showmy|showm|shm|sm)$/.test(instrL)){
        command = `show`;
        param = `my`
    }
    else if (/^(showkey|showk|shk|sk)$/.test(instrL)){
        command = `show`;
        param = `key`
    }
    else if (/^(showlot|showl|shl|sl)$/.test(instrL)){
        command = `show`;
        param = `lot`
    }
    else if (/^(showlotrun|showlr|shlr|slr)$/.test(instrL)){
        command = `show`;
        param = `lotrun`
    }
    else if (/^(shownext|shown|shn|sn)$/.test(instrL)){
        command = `show`;
        param = `next`
    }
    else if (/^(addkey|ak)$/.test(instrL)){
        command = `addkey`;
    }
    else if (/^(addlot|al)$/.test(instrL)){
        command = `addlot`;
    }
    else if (/^(setkey|sk)$/.test(instrL)){
        command = `setkey`;
    }
    else if (/^(setlot|sl)$/.test(instrL)){
        command = `setlot`;
    }
    else if (/^(del)$/.test(instrL)){
        command = `del`;
    }
    else if (/^(delkey|dk)$/.test(instrL)){
        command = `delkey`;
    }
    else if (/^(dellot|dl)$/.test(instrL)){
        command = `dellot`;
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
        prm : param
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
        return this.getHelpEmbed("help", botstr.help_text_Help);

    let command = "";
    if (typeof(incmd) == `string`){
        command = incmd || "";
    }
    else if (`prm` in incmd) {
        command = incmd.prm || "";
    }
    else {
        command = `help`;
    }

    switch (command) {
        case "short":
            return { description: `${botstr.help_text_ShortHelp}` };
            break;
        case "addme":
            return this.getHelpEmbed("addme", botstr.help_text_Addme);
            break;
        case "whereme":
            return this.getHelpEmbed("whereme", botstr.help_text_Whereme);
            break;
        case "getkey":
            return this.getHelpEmbed("getkey", botstr.help_text_Getkey);
            break;
        case "show":
            return this.getHelpEmbed("show", botstr.help_text_Show);
            break;
        case "showmy":
            return this.getHelpEmbed("showmy", botstr.help_text_Showmy);
            break;
        case "showkey":
            return this.getHelpEmbed("showkey", botstr.help_text_Showkey);
            break;
        case "showlot":
            return this.getHelpEmbed("showlot", botstr.help_text_Showlot);
            break;
        case "showlotrun":
            return this.getHelpEmbed("showlotrun", botstr.help_text_Showlotrun);
            break;
        case "shownext":
            return this.getHelpEmbed("shownext", botstr.help_text_Shownext);
            break;
        case "addkey":
            return this.getHelpEmbed("addkey", botstr.help_text_Addkey);
            break;
        case "addlot":
            return this.getHelpEmbed("addlot", botstr.help_text_Addlot);
            break;
        case "setkey":
            return this.getHelpEmbed("setkey", botstr.help_text_Setkey);
            break;
        case "setlot":
            return this.getHelpEmbed("setlot", botstr.help_text_Setlot);
            break;
        case "del":
            return this.getHelpEmbed("del", botstr.help_text_Del);
            break;
        case "delkey":
            return this.getHelpEmbed("delkey", botstr.help_text_Delkey);
            break;
        case "dellot":
            return this.getHelpEmbed("dellot", botstr.help_text_Dellot);
            break;
        case "start":
            return this.getHelpEmbed("start", botstr.help_text_Start);
            break;
        case "stop":
            return this.getHelpEmbed("stop", botstr.help_text_Stop);
            break;
        default:
            return this.getHelpEmbed("help", botstr.help_text_Help);
    }
}

module.exports.getHelpEmbed = function (Command = "", TextStr = "") {
    return {
        title: this.getText(botstr.help_text_TitleCommand, Command),
        description: `${botstr.help_text_DescriptionUsing}\n${TextStr}`
    };
}

module.exports.getStartEmbed = function (InParam = "") {
    return {
        title: botstr.start_text_LotteryStartedTitle,
        description: `${this.getText(botstr.start_text_LotteryStartedText, InParam)}`
    }
}

