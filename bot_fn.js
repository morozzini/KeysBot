const botstr=require("./bot_string");

module.exports.getCommand = instr => {
    if(!instr)
        return `${botstr.err_text_Prefix} ${botstr.err_text_NotSetInStr}`;
    
    var clearstr;
    var splstr;
    if(/^<@\d{18}>,.+/.test(instr)){
        clearstr = instr.substr(22).replace(/\s{2,}/g," ").trim();
    }
    else if (/^<@\d{18}>.+/.test(instr)){
        clearstr = instr.substr(21).replace(/\s{2,}/g," ").trim();
    }
    else{
        clearstr = instr.replace(/\s{2,}/g," ").trim();
    }

    splstr = clearstr.toLowerCase().split(/\s+/);
    
    if(splstr.length == 1){
        if (/^help$/.test(splstr[0])){
            return `help`;
        }
        if (/^\?$/.test(splstr[0])){
            return `shorthelp`;
        }
        else if(/^(addme|whereme|show(my|key|lot|lotrun|next)?|ping)$/.test(splstr[0])){
            return `${splstr[0]}`;
        }
        else if(/^(getkey|del|(del|set|add)(key|lot)|start|stop)$/.test(splstr[0])){
            return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,[splstr[0],` (${botstr.err_text_WrongUseCommand_UnsetIndex})`])}`;
        }
        else{
            return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_UnknownCommand,splstr[0])}`;
        }
    }
    else if (splstr.length > 1){
        if (/^(help|\?)$/.test(splstr[0])){
            if(/^(addme|getkey|show(my|key|lot|lotrun)?|del|(del|set|add)(key|lot)|start|stop)$/.test(splstr[1])){
                return `help ${splstr[1]}`;
            }
            else{
                return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_UnknownCommand,splstr[1])}`;
            }
        }
        else if(/^(addme|whereme|show(my|key|lot|lotrun)?)$/.test(splstr[0])){
            if(/^(help|\?)$/.test(splstr[1])){
                return `help ${splstr[0]}`;
            }
            else{
                return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,splstr[0])}`;
            }
        }
        else if (/^(getkey|del|(del|set)(key|lot)|stop)$/.test(splstr[0])){
            if(/^(help|\?)$/.test(splstr[1])){
                return `help ${splstr[0]}`;
            }
            else if (/^\d+$/.test(splstr[1])){
                return `${splstr[0]} ${splstr[1]}`;
            }
            else{
                return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,splstr[0])}`;
            }
        }
        else if (/^(start)$/.test(splstr[0])){
            var Ind = -1;
            var TimeOut = 0;
            if(/^(help|\?)$/.test(splstr[1])){
                return `help ${splstr[0]}`;
            }
            else if (/^\d+$/.test(splstr[1])){
                //return `${splstr[0]} ${splstr[1]}`;
                Ind = splstr[1]
            }
            else if (/^\d+[hms]$/.test(splstr[1])){
                return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,[splstr[0],` (${botstr.err_text_WrongUseCommand_UnsetIndex})`])}`;
            }
            else{
                return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,splstr[0])}`;
            }

            if(splstr.length > 2){
                TimeOut = this.getTimeOut(clearstr.toLowerCase());
                if(TimeOut === 0){
                    return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,[splstr[0],` (${botstr.err_text_WrongUseCommand_WrongTime})`])}`;
                }
                else{
                    return `${splstr[0]} ${Ind} ${TimeOut}`
                }
            }
            else{
                return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_WrongUseCommand,[splstr[0],` (${botstr.err_text_WrongUseCommand_UnsetTime})`])}`;
            }
        }
        else if (/^(add(key|lot))$/.test(splstr[0])){
            if(/^(help|\?)$/.test(splstr[1])){
                return `help ${splstr[0]}`;
            }

            if(splstr.length > 2){
                return `${splstr[0]} ${clearstr.substr(splstr[0].length).trim()}`;
            }
        }
        else{
            return `${botstr.err_text_Prefix} ${this.getText(botstr.err_text_UnknownCommand,splstr[0])}`;
        }
    }
}

module.exports.getTimeOut = function(instr) {
    var command = "";
    var commandfull = "";
    
    var inms = 0;
    
    var cmdd = instr.match(/\d+[hms]/g);
    cmdd.forEach(element => {
        if(element.endsWith("h")){
            inms += element.substr(0,element.length-1)*3600000;
        }
        else if (element.endsWith("m")){
            inms += element.substr(0,element.length-1)*60000;
        }
        else if(element.endsWith("s")){
            inms += element.substr(0,element.length-1)*1000;
        }
    },this);
    
    if(inms > 86400000){ //24 часа максимум
        inms = 86400000;
    }
    else if(inms === 0){
        return 0;
    }
    
    return inms;
}

module.exports.getTimeOutStr = function(InTimeOut) {
    var inms = InTimeOut;
    
    if(inms > 86400000){ //24 часа максимум
        inms = 86400000;
    }
    else if(inms === 0){
        return 0;
    }
    
    var outH = Math.floor(inms/3600000);
    var outM = Math.floor((inms-outH*3600000)/60000);
    var outS = Math.floor((inms-outH*3600000-outM*60000)/1000);

    var outstr = "";
    if(outH > 0){
        if(/(1[1234]|[5-9]|0)$/.test(outH)){
            outstr+=`${outH} часов `;
        }
        else if(/[234]$/.test(outH)){
            outstr+=`${outH} часа `;
        }
        else{
            outstr+=`${outH} час `;
        }
    }

    if(outM > 0){
        if(/(1[1234]|[5-9]|0)$/.test(outM)){
            outstr+=`${outM} минут `;
        }
        else if(/[234]$/.test(outM)){
            outstr+=`${outM} минуты `;
        }
        else{
            outstr+=`${outM} минуту `;
        }
    }

    if(outS > 0){
        if((outH > 0) && (outM > 0)){
            outstr += `и `;
        }
        if(/(1[1234]|[5-9]|0)$/.test(outS)){
            outstr+=`${outS} секунд`;
        }
        else if(/[234]$/.test(outS)){
            outstr+=`${outS} секунды`;
        }
        else{
            outstr+=`${outS} секунду`;
        }
    }
    
    return outstr.trim();
}

module.exports.getHelp = instr => {
    if(!instr)
        return this.getHelpEmbed("help",botstr.help_text_Help);

    var strin = instr.toLowerCase().trim().split(" ");
    var embed;
    if(strin.length === 1){
        if(strin[0] === "help"){
            return this.getHelpEmbed("help",botstr.help_text_Help);
        }
        else if(strin[0] === "shorthelp"){
            return {description : `${botstr.help_text_ShortHelp}`};
        }
    }
    else if (strin.length > 1){
        var embed_comand;
        strin.forEach(element =>{
            switch(element){
                case "addme":
                    embed_comand = this.getHelpEmbed("addme",botstr.help_text_Addme);
                    break;
                case "getkey":
                    embed_comand = this.getHelpEmbed("getkey",botstr.help_text_Getkey);
                    break;
                case "show":
                    embed_comand = this.getHelpEmbed("show",botstr.help_text_Show);
                    break;
                case "showmy":
                    embed_comand = this.getHelpEmbed("showmy",botstr.help_text_Showmy);
                    break;
                case "start":
                    embed_comand = this.getHelpEmbed("start",botstr.help_text_Start);
                    break;
                case "stop":
                    embed_comand = this.getHelpEmbed("stop",botstr.help_text_Stop);
                    break;
                case "addkey":
                    embed_comand = this.getHelpEmbed("addkey",botstr.help_text_Addkey);
                    break;
                case "addlot":
                    embed_comand = this.getHelpEmbed("addlot",botstr.help_text_Addlot);
                    break;
                case "showkey":
                    embed_comand = this.getHelpEmbed("showkey",botstr.help_text_Showkey);
                    break;
                case "showlot":
                    embed_comand = this.getHelpEmbed("showlot",botstr.help_text_Showlot);
                    break;
                case "showlotrun":
                    embed_comand = this.getHelpEmbed("showlotrun",botstr.help_text_Showlotrun);
                    break;
                case "del":
                    embed_comand = this.getHelpEmbed("del",botstr.help_text_Del);
                    break;
                case "delkey":
                    embed_comand = this.getHelpEmbed("delkey",botstr.help_text_Delkey);
                    break;
                case "dellot":
                    embed_comand = this.getHelpEmbed("dellot",botstr.help_text_Dellot);
                    break;
                case "setkey":
                    embed_comand = this.getHelpEmbed("setkey",botstr.help_text_Setkey);
                    break;
                case "setlot":
                    embed_comand = this.getHelpEmbed("setlot",botstr.help_text_Setlot);  
                    break;
            }
            if(embed_comand){
                return;
            }
        },this);

        if(!embed_comand){
            return this.getHelpEmbed(botstr.help_text_Help);
        }
        else{
            return embed_comand;
        }
    }
    else{
        return this.getHelpEmbed(botstr.help_text_Help);
    }
    return embed;
}

module.exports.getText = function(TextStr="", InParam="") {
    if(InParam === "")
        return TextStr.replace(/\${\d?}/g,"");
    
    var arrstr = TextStr.split(/(\${\d?})/g);
    var arrparam = [];
    if(Array.isArray(InParam)){
        arrparam = InParam;
    }
    else{
        arrparam.push(InParam);
    }
 
    var j = 0;
    var num = 0;
    for (i = 0; i < arrstr.length; i++) {
        if(/\${}/.test(arrstr[i])){
            arrstr[i] = arrparam[j];
            j == InParam.length-1 ? j = 0:j++;
        }
        else if(/\${\d}/.test(arrstr[i])){
            num = arrstr[i].match(/\d/)[0];
            if(num < arrparam.length){
                arrstr[i] = arrparam[num];
            }
            else{
                arrstr[i] = "";
            }
        }
    };

    return `${arrstr.join("")}`;
}

module.exports.getHelpEmbed = function(Command="",TextStr="") {
    return {
        title : this.getText(botstr.help_text_TitleCommand,Command),
        description : `${botstr.help_text_DescriptionUsing}\n${TextStr}`
    };
}

module.exports.getStartEmbed = function(InParam="") {
    return {
        title : botstr.start_text_LotteryStartedTitle,
        description : `${this.getText(botstr.start_text_LotteryStartedText,InParam)}`
    }
}