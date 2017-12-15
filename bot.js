
const DEBUG = true;
const BOTVERSION = "Keys Bot v.0.0.7b";

const config = require('./config.json');
const botstr = require(`./${config.lang}`);
const botfn = require('./bot_fn');
botfn.botstr = botstr;
const db = require("sqlite");
const Discord = require('discord.js');

const client = new Discord.Client();
var ArrLottery = [];
var ShowNextMap = new Map();

function DEBUGLOG(logstr) {
    if (DEBUG)
        console.log(`${new Date().toISOString().replace(/T/, ` `).replace(/\..+/, '')} ${logstr.replace("\n"," ")}`);
}

client.on('ready', () => {
    db.run("CREATE TABLE IF NOT EXISTS gamekeys (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id, getdiscord_nickname)");
    db.run("CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_channel, discord_nickname)");
    db.run("CREATE TABLE IF NOT EXISTS lottery (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_channel_id, lot_message_id, lot_endtime, lot_key_id, author_discord_id, author_discord_nickname, win_discord_id, win_discord_nickname)");
    //console.log(`${new Date().toISOString().replace(/T/, ` `).replace(/\..+/, '')} I am ready! ${BOTVERSION}`);
    let nameguilds = ``;
    for (let [key, value] of client.guilds) {
        //console.log(`${value.name}`);
        nameguilds+=`"${value.name}" `;
        // chnls = value.channels;
        // for (let [key, value] of chnls) {
        //     console.log(` |-(${value.type})${value.name}`);
        // }
    }
    console.log(`${new Date().toISOString().replace(/T/, ` `).replace(/\..+/, '')} I am ready! ${BOTVERSION}. Guilds: ${nameguilds}`);

    db.all(`SELECT discord_channel_id,lot_message_id,lot_endtime,lot_key_id,author_discord_id,author_discord_nickname FROM lottery WHERE win_discord_id IS NULL`).then(lotteryrow => {
        if(!lotteryrow || lotteryrow.length == 0){
            db.all(`SELECT id,discord_id,discord_channel FROM gamekeys WHERE getdiscord_id="lotrun"`).then(lotrow => {
                if (lotrow) {
                    if (lotrow.length > 0) {
                        DEBUGLOG(`INSIDE AFTERSTART Found Unckecked(not in lottery db) Run Lottery ${lotrow.length}`);
                        db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE getdiscord_id="lotrun"`);
                        let users = [];
        
                        for (let i = 0; i < lotrow.length; i++) {
                            if (users.length == 0) {
                                users.push({
                                    userid: lotrow[i].discord_id,
                                    lotid: `${lotrow[i].id}`
                                });
                            }
                            else {
                                let found = false;
                                for (let j = 0; j < users.length; j++) {
                                    if (users[j].userid == lotrow[i].discord_id) {
                                        users[j].lotid += `,${lotrow[i].id}`;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    users.push({
                                        userid: lotrow[i].discord_id,
                                        lotid: `${lotrow[i].id}`
                                    });
                                }
                            }
                        }
        
                        users.forEach(element => {
                            client.fetchUser(element.userid).then(user => {
                                DEBUGLOG(`OUT AFTERSTART Found lottery "${user.username}" [${element.lotid}]`)
                                user.send(botfn.getText(botstr.err_text_FoundLotteryRunAfterStart, element.lotid));
                            });
                        });
                    }
                }
            });
        }
        else{
            DEBUGLOG(`INSIDE AFTERSTART Found Run Lottery ${lotteryrow.length}. Start`);
            lotteryrow.forEach(element => {
                ArrLottery.push({
                    endtime: element.lot_endtime,
                    msgid: element.lot_message_id
                });
            })
        }
    })
});

client.on('message', message => {
    if (message.author === client.user) return;

    if (message.channel.type === "text") {
        if (message.content.startsWith(`${client.user}`) || (new RegExp(`^${botstr.cmd_Prefix}\\S+`).test(message.content))) {
            DEBUGLOG(`IN (${message.channel.type})[${message.guild.name}][${message.channel.name}]\$ ${message.author.username}: "${message.content}"`);
            var command = botfn.getCommand(message.content);

            if (command.err) {
                DEBUGLOG(`OUT ERROR "${command.prm}"`);
                message.reply(command.prm);
            }
            else if (command.cmd === "help") {
                DEBUGLOG(`OUT HELP Embed "${command.scmd}"`);
                message.author.send(new Discord.RichEmbed(botfn.getHelp(command)).setFooter(BOTVERSION));
            }
            else if (command.cmd === "ping") {
                DEBUGLOG(`OUT pong`);
                message.reply("pong");
            }
            else if (command.cmd === "about") {
                DEBUGLOG(`OUT ABOUT embed "${command.cmd}"`);
                message.author.send(new Discord.RichEmbed(botfn.getAboutEmbed(client.user.avatarURL)).setFooter(BOTVERSION));
            }
            else if (command.cmd === "addme") {
                db.get(`SELECT id,discord_id,discord_channel FROM authors WHERE discord_id="${message.author.id}"`).then(row => {
                    if (!row) {
                        db.run("INSERT INTO authors (discord_id, discord_channel, discord_nickname) VALUES (?,?,?)", [message.author.id, message.channel.id, message.author.username]);
                        DEBUGLOG(`OUT ADDME add to "authors" db [${message.author.id}][${message.author.username}]`);
                        message.author.send(botstr.addme_text_AddingSuccess);
                        //TODO добавить вывод короткого описания команд.
                    }
                    else {
                        if (row.discord_channel != message.channel.id) {
                            db.get(`UPDATE authors SET discord_channel="${message.channel.id}" WHERE discord_id="${message.author.id}"`)
                            DEBUGLOG(`OUT ADDME Update "authors" db [${message.author.id}][${message.author.username}]`)
                            message.author.send(botstr.addme_text_UpdateSuccess);
                        }
                        else {
                            DEBUGLOG(`OUT ADDME Nothing "authors" db [${message.author.id}][${message.author.username}]`);
                            message.author.send(botstr.addme_text_FoundInBase);
                        }
                    }
                });
                // .catch(() => {
                //   db.run("CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_channel, discord_nickname)").then(() => {
                //     db.run("INSERT INTO authors (discord_id, discord_channel, discord_nickname) VALUES (?,?,?)",[message.author.id,message.channel.id,message.author.username]);
                //     message.author.send("Ты добавлен в базу. А я готов принимать ключи.");
                //   });
                // });
            }
            else if (command.cmd === "show") {
                var request = "";
                var inSubCommand = command.scmd;

                var jarr = 0;
                var istart = 0;

                if (inSubCommand === "next" && ShowNextMap.has(message.channel.id)) {
                    istart = ShowNextMap.get(message.channel.id).num;
                    request = ShowNextMap.get(message.channel.id).req;
                }
                else if (inSubCommand === "my") {
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id IS NULL`;
                }
                else if ((inSubCommand === "lot") || (inSubCommand === "lotrun")) {
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and getdiscord_id="lotrun"`;
                }
                else {
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame FROM gamekeys WHERE discord_channel="${message.channel.id}" and getdiscord_id IS NULL`;
                }

                if (istart == 0) {
                    if (ShowNextMap.has(message.channel.id)) {
                        ShowNextMap.get(message.channel.id).num = 0;
                        ShowNextMap.get(message.channel.id).req = request;
                    }
                }

                db.all(request).then(row => {
                    if (!row) {
                        DEBUGLOG(`OUT SHOW Not found all key. (!row)`);
                        message.reply(botstr.err_text_KeyNotFound);
                    }
                    else {
                        var strshow = istart > 0 ? "...\n" : "";

                        for (var i = istart; i < row.length; i++) {
                            if (`${strshow}${botfn.getText(botstr.show_text_FormatNameAuthor, [row[i].id, row[i].NameOfGame, row[i].discord_nickname])}\n`.length < 1500) {
                                strshow += `${botfn.getText(botstr.show_text_FormatNameAuthor, [row[i].id, row[i].NameOfGame, row[i].discord_nickname])}\n`;
                            }
                            else {
                                if (ShowNextMap.has(message.channel.id)) {
                                    ShowNextMap.get(message.channel.id).num = i;
                                    ShowNextMap.get(message.channel.id).req = request;
                                }
                                else {
                                    ShowNextMap.set(message.channel.id, {
                                        num: i,
                                        req: request
                                    });
                                }
                                strshow += `...`;
                                break;
                            }
                        }

                        if (strshow === "") {
                            DEBUGLOG(`OUT SHOW Not found key.`);
                            message.channel.send(botstr.err_text_KeyNotFoundForChannel);
                        }
                        else {
                            DEBUGLOG(`OUT SHOW Found key.`);
                            message.channel.send(botfn.getText(botstr.show_text_KeyFound, strshow));
                        }
                    }
                });
            }
            else if (command.cmd === "getkey") {
                var inId = command.id;
                if (inId != "") {
                    db.get(`SELECT discord_id,NameOfGame,GameKey FROM gamekeys WHERE discord_channel="${message.channel.id}" and id="${inId}" and getdiscord_id IS NULL`).then(row => {
                        if (!row) {
                            DEBUGLOG(`OUT GETKEY not Found. (!row) [${inId}]`);
                            message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound, inId));
                        }
                        else {
                            db.run(`UPDATE gamekeys SET getdiscord_id="${message.author.id}",getdiscord_nickname="${message.author.username}" WHERE discord_channel="${message.channel.id}" and id="${inId}"`);
                            DEBUGLOG(`OUT GETKEY Key Found. [${inId}. ${row.NameOfGame}] [${message.author.id}][${message.author.username}]`);
                            message.channel.send(botfn.getText(botstr.getkey_text_KeyFoundSendChannel, [row.NameOfGame, `${message.author}`]));
                            strshow = botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [inId, row.NameOfGame, row.GameKey]));
                            message.author.send(botfn.getText(botstr.getkey_text_KeyFoundSendUser, [strshow, `<@${row.discord_id}>`]));
                        }
                    });
                }
            }
            else if (command.cmd === "start") {
                let inId = command.id;
                let reqId = botfn.getIdRequest(command.id);
                let allId = ``;
                let inTime = command.time;
                let TimeStr = botfn.getTimeOutStr(inTime);

                let limit = 20;

                db.all(`SELECT id,discord_nickname,discord_id,NameOfGame,GameKey FROM gamekeys WHERE (${reqId}) and discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lot"`).then(row => {
                    if (!row || row.length == 0) {
                        DEBUGLOG(`OUT START key not Found for chanel. (!row) [${inId}]`);
                        message.channel.send(botstr.err_text_KeyNotFoundForChannel);
                    }
                    else if (row.length > limit){
                        DEBUGLOG(`OUT START key Found for chanel. but over limit(${row.length}>${limit}) [${inId}]`);
                        message.channel.send(botfn.getText(botstr.err_text_LotteryOverLimitKeys,[row.length, limit]));
                    }
                    else {
                        
                        let EndTime = Date.now() + inTime;
                        let strshow = ``;
                        for (let i = 0; i < row.length; i++) {
                            strshow += `${botfn.getText(botstr.show_text_FormatNameAuthor, [row[i].id, row[i].NameOfGame, row[i].discord_nickname])}\n`;
                            allId += (allId == ``) ? `${row[i].id}` : `,${row[i].id}`;
                        }
                        var LotteryEmbed = new Discord.RichEmbed(botfn.getStartEmbed([TimeStr, `${botfn.getText(botstr.show_text_KeyFound, strshow)}`])).setColor(botstr.start_color_LotteryStarted);
                        
                        
                        message.channel.send("@here", LotteryEmbed).then(messagelot => {
                            DEBUGLOG(`OUT START Message [${messagelot.id}]. key Found. start lottery [${inId}]! EndTime [${new Date(EndTime).toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`);
                            db.run(`UPDATE gamekeys SET getdiscord_id="lotrun",getdiscord_nickname="${messagelot.id}" WHERE (${reqId}) and discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lot"`);
                            db.run("INSERT INTO lottery (discord_channel_id, lot_message_id, lot_endtime, lot_key_id, author_discord_id, author_discord_nickname) VALUES (?,?,?,?,?,?)", [message.channel.id, messagelot.id, EndTime, allId, message.author.id, message.author.username]);

                            ArrLottery.push({
                                endtime: EndTime,
                                msgid: messagelot.id
                            });
                            
                        });
                    }
                });
            }
            else if (command.cmd === "stop") {
                let request = "";
                let inId;
                let reqId;

                if (`id` in command) {
                    inId = command.id;
                    reqId = botfn.getIdRequest(command.id);
                    request = `
                        SELECT id,discord_nickname,discord_id,NameOfGame,getdiscord_nickname
                        FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun" and
                            getdiscord_nickname IN (SELECT getdiscord_nickname 
                                                    FROM gamekeys
                                                    WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id="lotrun")`;
                }
                else {
                    inId = `all`;
                    request = `SELECT id,discord_nickname,discord_id,NameOfGame,getdiscord_nickname FROM gamekeys WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun"`;
                }

                db.all(request).then(row => {
                    if (!row || row.length == 0) {
                        DEBUGLOG(`OUT STOP Key not Found. (!row)[${inId}]`);
                        message.reply(botfn.getTextErr(botstr.err_text_KeyLotteryRunNotFound));
                    }
                    else {
                        if (row.length == 1 && inId === `all`) {
                            inId = `${row[0].id}`;
                        }
                        let LotMsgId = ``;
                        if (ArrLottery.length > 0) {
                            for (let i = ArrLottery.length - 1; i >= 0; i--){
                                for (let j = 0; j < row.length; j++){
                                    if(ArrLottery[i].msgid == row[j].getdiscord_nickname){
                                        LotMsgId += (LotMsgId == '')?`"${ArrLottery[i].msgid}"`:`,"${ArrLottery[i].msgid}"`;
                                        client.channels.get(message.channel.id).fetchMessage(ArrLottery[i].msgid).then(lotmessage => {
                                            lotmessage.edit(new Discord.RichEmbed(lotmessage.embeds[0]).setColor(botstr.start_color_LotteryStopped));
                                        })
                                        ArrLottery[i].endtime = null;
                                        ArrLottery[i].msgid = null;
                                        break;
                                    }
                                }
                            }
                        }

                        if (LotMsgId != ``) {
                            db.run(`DELETE FROM lottery WHERE lot_message_id IN (${LotMsgId}) AND win_discord_id IS NULL`);
                        }

                        DEBUGLOG(`OUT STOP Key Found. Stopped [${inId}]`);
                        if (inId === `all`) {
                            db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun"`);
                            //strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor, [row.id, row.NameOfGame, row.discord_nickname])}`;
                            message.reply(botfn.getText(botstr.stop_text_ManyLotteryStopSuccess));
                        }
                        else if (row.length > 1) {
                            db.run(`UPDATE gamekeys
                                    SET getdiscord_id="lot",getdiscord_nickname=NULL
                                    WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and getdiscord_id="lotrun" and
                                            getdiscord_nickname IN (
                                                SELECT getdiscord_nickname 
                                                FROM gamekeys
                                                WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id="lotrun")`);
                            //strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor, [row.id, row.NameOfGame, row.discord_nickname])}`;
                            message.reply(botfn.getText(botstr.stop_text_ManyLotteryStopSuccess));
                        }
                        else {
                            db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE discord_channel="${message.channel.id}" and discord_id="${message.author.id}" and id="${inId}" and getdiscord_id="lotrun"`);
                            //strshow = `${botfn.getText(botstr.show_text_FormatNameAuthor, [row.id, row.NameOfGame, row.discord_nickname])}`;
                            message.reply(botfn.getText(botstr.stop_text_LotteryStopSuccess, inId));
                        }
                    }
                });
            }
            else if (command.cmd === "status") {
                let chanelId = ``;
                let channels = new Map();

                for (let [key, value] of client.guilds.get(message.channel.guild.id).channels) {
                    if (value.type == `text`) {
                        chanelId += (chanelId === ``) ? `"${key}"` : `,"${key}"`;
                        channels.set(key, {
                            name: value.name,
                            numkeys: 0,
                            numoutkeys: 0,
                            numrunlot: 0
                        });
                    }
                }

                db.all(`SELECT discord_id,discord_nickname,discord_channel,getdiscord_id FROM gamekeys WHERE discord_channel IN (${chanelId}) AND (getdiscord_id != "lot" OR getdiscord_id IS NULL)`).then(rows => {
                    if (!rows || rows.length == 0) {
                        DEBUGLOG(`OUT STATUS Key not Found. (!rows)`);
                        message.reply(botfn.getTextErr(botstr.err_text_KeyNotFound));
                    }
                    else {
                        let autors = new Map();
                        let NumKeys = 0;
                        let NumOutKeys = 0;
                        let NumRunLot = 0;

                        for (let i = 0; i < rows.length; i++) {
                            if (!autors.has(rows[i].discord_id)) {
                                autors.set(rows[i].discord_id, {
                                    nickname: rows[i].discord_nickname,
                                    numkeys: 0,
                                    numoutkeys: 0
                                });
                            }

                            if (rows[i].getdiscord_id == `lotrun`) {
                                channels.get(rows[i].discord_channel).numrunlot++;
                                NumRunLot++;
                            }
                            else if (rows[i].getdiscord_id != null) {
                                autors.get(rows[i].discord_id).numkeys++;
                                autors.get(rows[i].discord_id).numoutkeys++;
                                channels.get(rows[i].discord_channel).numoutkeys++;
                                NumOutKeys++;
                            }
                            else if (rows[i].getdiscord_id == null) {
                                autors.get(rows[i].discord_id).numkeys++;
                                channels.get(rows[i].discord_channel).numkeys++;
                                NumKeys++;
                            }

                        }

                        let statnumkeys = ``;
                        let statnumoutkeys = ``;
                        let statnumrunlot = ``;
                        for (let [key, value] of channels) {
                            if (value.numkeys > 0)
                                statnumkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numkeys])}\n`;
                            if (value.numoutkeys > 0)
                                statnumoutkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numoutkeys])}\n`;
                            if (value.numrunlot > 0)
                                statnumrunlot += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numrunlot])}\n`;
                        }
                        let Id_1, Val_1 = 0;
                        let Id_2, Val_2 = 0;
                        let Id_3, Val_3 = 0;
                        let statautors = ``;
                        for (let [key, value] of autors) {
                            if (value.numkeys > Val_1) {
                                Id_3 = Id_2;
                                Val_3 = Val_2;
                                Id_2 = Id_1;
                                Val_2 = Val_1;
                                Id_1 = key;
                                Val_1 = value.numkeys;
                            }
                            else if (value.numkeys > Val_2) {
                                Id_3 = Id_2;
                                Val_3 = Val_2;
                                Id_2 = key;
                                Val_2 = value.numkeys;
                            }
                            else if (value.numkeys > Val_3) {
                                Id_3 = key;
                                Val_3 = value.numkeys;
                            }
                        }
                        if (autors.get(Id_1)) {
                            statautors += `${botfn.getText(botstr.status_text_FormatAuthors, [autors.get(Id_1).nickname, autors.get(Id_1).numoutkeys, autors.get(Id_1).numkeys])}\n`;
                        }
                        if (autors.get(Id_2)) {
                            statautors += `${botfn.getText(botstr.status_text_FormatAuthors, [autors.get(Id_2).nickname, autors.get(Id_2).numoutkeys, autors.get(Id_2).numkeys])}\n`;
                        }
                        if (autors.get(Id_3)) {
                            statautors += `${botfn.getText(botstr.status_text_FormatAuthors, [autors.get(Id_3).nickname, autors.get(Id_3).numoutkeys, autors.get(Id_3).numkeys])}\n`;
                        }

                        let StatusRichEmbed = new Discord.RichEmbed();
                        StatusRichEmbed.setColor(botstr.status_color);
                        StatusRichEmbed.setTitle(botstr.status_text_Title);
                        StatusRichEmbed.setDescription(botfn.getText(botstr.status_text_Description, `${message.channel.guild.name}`));
                        StatusRichEmbed.setThumbnail(message.channel.guild.iconURL);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumKeys, `${NumKeys}`), statnumkeys || botstr.status_text_NoChannels, true);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumOutKeys, `${NumOutKeys}`), statnumoutkeys || botstr.status_text_NoChannels, true);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumLotRun, `${NumRunLot}`), statnumrunlot || botstr.status_text_NoChannels);
                        StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumAuthors, `${autors.size}`), statautors || botstr.status_text_NoAuthors);
                        DEBUGLOG(`OUT STATUS send status.`);
                        message.channel.send(StatusRichEmbed.setFooter(BOTVERSION));
                    }
                });
            }
            else {
                DEBUGLOG(`OUT ERROR Command not found! "${command.cmd}"`);
                message.reply(botfn.getText(botstr.err_text_WrongUseCommandOrUnknownCommand, command.cmd));
            }
        }
    }
    else if (message.channel.type === "dm") {
        DEBUGLOG(`IN (${message.channel.type})\$ ${message.author.username}: "${message.content}"`);
        var command = botfn.getCommand(message.content);

        if (command.err) {
            DEBUGLOG(`OUT ERROR "${command.prm}"`);
            message.reply(command.prm);
        }
        else if (command.cmd === "help") {
            DEBUGLOG(`OUT HELP embed "${command.scmd}"`);
            message.author.send(new Discord.RichEmbed(botfn.getHelp(command)).setFooter(BOTVERSION));
        }
        else if (command.cmd === "ping") {
            DEBUGLOG(`OUT pong"`);
            message.author.send("pong");
        }
        else if (command.cmd === "about") {
            DEBUGLOG(`OUT ABOUT embed "${command.cmd}"`);
            message.author.send(new Discord.RichEmbed(botfn.getAboutEmbed(client.user.avatarURL)).setFooter(BOTVERSION));
        }
        else {
            //Команды требующие предварительной авторизации
            db.get(`SELECT discord_id,discord_channel FROM authors WHERE discord_id="${message.author.id}"`).then(arow => {
                if (!arow) {
                    DEBUGLOG(`OUT You not in base. Send addme`);
                    message.reply(botstr.err_text_NotFoundInAuthorBase);
                }
                else if (command.cmd === "show") {
                    var request = "";
                    var inSubCommand = command.scmd;

                    var jarr = 0;
                    var istart = 0;

                    if (inSubCommand === "next" && ShowNextMap.has(message.channel.id)) {
                        istart = ShowNextMap.get(message.channel.id).num;
                        request = ShowNextMap.get(message.channel.id).req;
                    }
                    else if (inSubCommand === "my") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and discord_channel="${arow.discord_channel}" and (getdiscord_id IS NULL or getdiscord_id="lot" or getdiscord_id="lotrun")`;
                    }
                    else if (inSubCommand === "key") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id IS NULL)`;
                    }
                    else if (inSubCommand === "lot") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id="lot")`;
                    }
                    else if (inSubCommand === "lotrun") {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id="lotrun")`;
                    }
                    else {
                        request = `SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot" or getdiscord_id="lotrun")`;
                    }

                    if (istart == 0) {
                        if (ShowNextMap.has(message.channel.id)) {
                            ShowNextMap.get(message.channel.id).num = 0;
                            ShowNextMap.get(message.channel.id).req = request;
                        }
                    }

                    db.all(request).then(row => {
                        if (!row) {
                            DEBUGLOG(`OUT SHOW Not found all key. (!row)`);
                            message.reply(botstr.err_text_KeyNotFound);
                        }
                        else {
                            var strshow = istart > 0 ? "...\n" : "";

                            for (var i = istart; i < row.length; i++) {
                                if (`${strshow}${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey])}\n`.length < 1500) {
                                    showprefix = row[i].discord_channel != arow.discord_channel ? "*" : "";

                                    if (row[i].getdiscord_id === "lot") {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(L)`])}\n`;
                                    }
                                    else if (row[i].getdiscord_id === "lotrun") {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(R)`])}\n`;
                                    }
                                    else {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}`])}\n`;
                                    }
                                }
                                else {
                                    if (ShowNextMap.has(message.channel.id)) {
                                        ShowNextMap.get(message.channel.id).num = i;
                                        ShowNextMap.get(message.channel.id).req = request;
                                    }
                                    else {
                                        ShowNextMap.set(message.channel.id, {
                                            num: i,
                                            req: request
                                        });
                                    }
                                    strshow += `...`;
                                    break;
                                }
                            }

                            if (strshow === "") {
                                DEBUGLOG(`OUT SHOW Not found key.`);
                                message.reply(botstr.err_text_KeyNotFound);
                            }
                            else {
                                DEBUGLOG(`OUT SHOW Found key.`);
                                //message.reply(botfn.getText(botstr.show_text_KeyFound, strshow));
                                message.author.send(botfn.getText(botstr.show_text_KeyFound, strshow));
                            }
                        }
                    });
                }
                else if (command.cmd === "add") {
                    var inGameKey = command.key;
                    var inGameName = command.name.substr(0, 50);
                    var request = "";
                    let lott = command.scmd == `lot` ? `lot` : null;

                    if ((inGameKey != "") && (inGameName != "")) {
                        db.get(`SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}" and NameOfGame="${inGameName}" and GameKey="${inGameKey}"`).then(row => {
                            if (!row) {
                                db.run("INSERT INTO gamekeys (discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id) VALUES (?,?,?,?,?,?)", [message.author.id, message.author.username, arow.discord_channel, inGameName, inGameKey, lott]);
                                db.get("SELECT id,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE rowid=last_insert_rowid()").then(addrow => {
                                    if (addrow.getdiscord_id == "lot") {
                                        strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [addrow.id, addrow.NameOfGame, addrow.GameKey, `(L)`]))}`;
                                        DEBUGLOG(`OUT ADD added lot. ${strshow}`);
                                        message.reply(botfn.getText(botstr.addlot_text_AddKeySuccess, strshow));
                                    }
                                    else {
                                        strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [addrow.id, addrow.NameOfGame, addrow.GameKey]))}`;
                                        DEBUGLOG(`OUT ADD added key. ${strshow}`);
                                        message.reply(botfn.getText(botstr.addkey_text_AddKeySuccess, strshow));
                                    }

                                });
                            }
                            else {
                                if (row.getdiscord_id == "lot") {
                                    strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [row.id, row.NameOfGame, row.GameKey, `(L)`]))}`;
                                    DEBUGLOG(`OUT ADDKEY ERROR err Added lot. Found ${strshow}`);
                                    message.reply(botfn.getText(botstr.addlot_text_AddKeyFound, strshow));
                                }
                                else {
                                    strshow = `${botfn.getText(botstr.show_text_KeyFound, botfn.getText(botstr.show_text_FormatNameKey, [row.id, row.NameOfGame, row.GameKey]))}`;
                                    DEBUGLOG(`OUT ADDKEY ERROR err Added key. Found ${strshow}`);
                                    message.reply(botfn.getText(botstr.addkey_text_AddKeyFound, strshow));
                                }
                            }
                        });
                        // .catch(()=>{
                        //   //console.log("[Error Table]");
                        //   db.run("CREATE TABLE IF NOT EXISTS gamekeys (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, discord_id, discord_nickname, discord_channel, NameOfGame, GameKey, getdiscord_id, getdiscord_nickname)").then(()=>{
                        //     //console.log("[Tabel Added]");
                        //     db.run("INSERT INTO gamekeys (discord_id, discord_nickname, discord_channel, NameOfGame, GameKey) VALUES (?,?,?,?,?)",[message.author.id,message.author.username,arow.discord_channel,inGameName,inGameKey]);
                        //     db.get("SELECT id,NameOfGame,GameKey FROM gamekeys WHERE rowid=last_insert_rowid()").then(row => {
                        //       //console.log(`[Added] ${row.id} ${row.NameOfGame} ${row.GameKey}`);
                        //       message.reply("```Markdown\n# Добавлено\n"+row.id+". ["+row.NameOfGame+"]["+row.GameKey+"]```");
                        //     });
                        //   });
                        // });
                    }
                }
                else if (command.cmd === "set") {
                    var inId = command.id;
                    var lott = command.scmd == `lot` ? true : false;
                    var reqId = botfn.getIdRequest(inId);

                    if (inId != "") {
                        db.all(`SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE (${reqId}) and discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
                            if (!row) {
                                DEBUGLOG(`OUT SETKEY ERROR id Not Found. (!row) [${inId}]`);
                                message.reply(botstr.err_text_KeyNotFound);
                            }
                            else {

                                if (lott) {
                                    db.run(`UPDATE gamekeys SET getdiscord_id="lot" WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id IS NULL`);
                                }
                                else {
                                    db.run(`UPDATE gamekeys SET getdiscord_id=NULL WHERE (${reqId}) and discord_id="${message.author.id}" and getdiscord_id="lot"`);
                                }

                                var strshow = "";
                                for (var i = 0; i < row.length; i++) {
                                    showprefix = row[i].discord_channel != arow.discord_channel ? "*" : "";

                                    if (lott) {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(L)`])}\n`;
                                    }
                                    else {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}`])}\n`;
                                    }
                                }
                                if (strshow === "") {
                                    DEBUGLOG(`OUT SET Not found key.`);
                                    message.reply(botstr.err_text_KeyNotFound);
                                }
                                else {
                                    DEBUGLOG(`OUT SET Found key.`);
                                    if (row.length > 1) {
                                        message.reply(botfn.getText(botstr.set_text_UpdateKeySuccess_ManyKeys, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                    else {
                                        message.reply(botfn.getText(botstr.set_text_UpdateKeySuccess_OneKey, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                }
                            }
                        });
                    }
                }
                else if (command.cmd === "del") {
                    var inId = command.id;
                    var reqId = botfn.getIdRequest(inId);

                    if (inId != "") {
                        db.all(`SELECT id,discord_channel,NameOfGame,GameKey,getdiscord_id FROM gamekeys WHERE (${reqId}) and discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot")`).then(row => {
                            if (!row) {
                                DEBUGLOG(`OUT DEL Del key not found. (!row) [${inId}]`);
                                message.reply(botfn.getText(botstr.err_text_IndexKeyNotFound, inId));
                            }
                            else {
                                db.run(`DELETE FROM gamekeys WHERE (${reqId}) and discord_id="${message.author.id}" and (getdiscord_id IS NULL or getdiscord_id="lot")`);
                                var strshow = "";
                                for (var i = 0; i < row.length; i++) {
                                    showprefix = row[i].discord_channel != arow.discord_channel ? "*" : "";

                                    if (row[i].getdiscord_id === "lot") {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}(L)`])}\n`;
                                    }
                                    else {
                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey, `${showprefix}`])}\n`;
                                    }
                                }
                                if (strshow === "") {
                                    DEBUGLOG(`OUT DEL Not found key.`);
                                    message.reply(botstr.err_text_KeyNotFound);
                                }
                                else {
                                    DEBUGLOG(`OUT DEL Found key.`);
                                    if (row.length > 1) {
                                        message.reply(botfn.getText(botstr.del_text_DelSuccess_ManyKeys, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                    else {
                                        message.reply(botfn.getText(botstr.del_text_DelSuccess_OneKey, botfn.getText(botstr.show_text_KeyFound, strshow)));
                                    }
                                }
                            }
                        });
                    }
                }
                else if (command.cmd === "whereme") {
                    if (client.channels.get(arow.discord_channel)) {
                        DEBUGLOG(`OUT WHEREME Found: "${client.channels.get(arow.discord_channel).guild.name}"->"${client.channels.get(arow.discord_channel).name}"`);
                        message.reply(botfn.getText(botstr.whereme_text_FoundSuccess, [client.channels.get(arow.discord_channel).guild.name, client.channels.get(arow.discord_channel).name]));
                    }
                    else {
                        DEBUGLOG(`OUT WHEREME Channel or server Not Found`);
                        message.reply(botstr.err_text_AuthorNotFound);
                    }
                }
                else if (command.cmd === "status") {
                    db.all(`SELECT discord_channel,getdiscord_id FROM gamekeys WHERE discord_id="${message.author.id}"`).then(rows => {
                        if (!rows || rows.length == 0) {
                            DEBUGLOG(`OUT STATUS Key not Found. (!rows)`);
                            message.reply(botfn.getTextErr(botstr.err_text_KeyNotFound));
                        }
                        else {
                            let NumKeys = 0;
                            let NumOutKeys = 0;
                            let NumLot = 0;
                            let NumRunLot = 0;

                            let channels = new Map();

                            for (let i = 0; i < rows.length; i++) {
                                if (!channels.has(rows[i].discord_channel)) {
                                    channels.set(rows[i].discord_channel, {
                                        name: client.channels.get(rows[i].discord_channel).name,
                                        numkeys: 0,
                                        numoutkeys: 0,
                                        numlot: 0,
                                        numrunlot: 0
                                    });
                                }

                                if (rows[i].getdiscord_id == `lot`) {
                                    channels.get(rows[i].discord_channel).numlot++;
                                    NumLot++;
                                }
                                else if (rows[i].getdiscord_id == `lotrun`) {
                                    channels.get(rows[i].discord_channel).numrunlot++;
                                    NumRunLot++;
                                }
                                else if (rows[i].getdiscord_id != null) {
                                    channels.get(rows[i].discord_channel).numoutkeys++;
                                    NumOutKeys++;
                                }
                                else if (rows[i].getdiscord_id == null) {
                                    channels.get(rows[i].discord_channel).numkeys++;
                                    NumKeys++;
                                }
                            }

                            let statnumkeys = ``;
                            let statnumoutkeys = ``;
                            let statnumlot = ``;
                            let statnumrunlot = ``;

                            for (let [key, value] of channels) {
                                if (value.numkeys > 0)
                                    statnumkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numkeys])}\n`;
                                if (value.numoutkeys > 0)
                                    statnumoutkeys += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numoutkeys])}\n`;
                                if (value.numlot > 0)
                                    statnumlot += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numlot])}\n`;
                                if (value.numrunlot > 0)
                                    statnumrunlot += `${botfn.getText(botstr.status_text_FormatChannelKeys, [value.name, value.numrunlot])}\n`;
                            }


                            let StatusRichEmbed = new Discord.RichEmbed();
                            StatusRichEmbed.setColor(botstr.status_color);
                            StatusRichEmbed.setTitle(botstr.status_text_Title);
                            StatusRichEmbed.setDescription(botfn.getText(botstr.whereme_text_FoundSuccess, [client.channels.get(arow.discord_channel).guild.name, client.channels.get(arow.discord_channel).name]));
                            StatusRichEmbed.setThumbnail(message.author.avatarURL);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumKeys, `${NumKeys}`), statnumkeys || botstr.status_text_NoChannels, true);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumOutKeys, `${NumOutKeys}`), statnumoutkeys || botstr.status_text_NoChannels, true);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumLot, `${NumLot}`), statnumlot || botstr.status_text_NoChannels, true);
                            StatusRichEmbed.addField(botfn.getText(botstr.status_text_FieldNumLotRun, `${NumRunLot}`), statnumrunlot || botstr.status_text_NoChannels, true);

                            DEBUGLOG(`OUT STATUS send status.`);
                            message.author.send(StatusRichEmbed.setFooter(BOTVERSION));
                        }
                    });
                }
                else {
                    DEBUGLOG(`OUT ERROR. Command not found! "${command.cmd}"`);
                    message.reply(botfn.getText(botstr.err_text_WrongUseCommandOrUnknownCommand, command.cmd));
                }
            });
        }
    }
});

async function getPlayers(Reactions){
    let players = [];
    let players_name = '';

    for (let [key,value] of Reactions) {
        const usrs = await value.fetchUsers();

        for (let [ukey, value] of usrs) {
            if ((players.size == 0) || (players.indexOf(value.id) < 0)) {
                players.push(value.id);
                players_name += (players_name === ``) ? `"${value.username}"` : `,"${value.username}"`;
            }
        }
    }
    return [players,players_name];
}

client.setInterval(() => {
    for(let i = ArrLottery.length-1; i >= 0; i--){
        if(!ArrLottery[i].endtime && !ArrLottery.msgid){
            ArrLottery.splice(i, 1);
        }
    }
    
    if(ArrLottery.length > 0){
        let nowtime = Date.now();

        ArrLottery.forEach(element => {
            if((element.endtime!=null) && (element.endtime < nowtime)){
                //Значит лотерея закончена! Надо чтот делать
                let lotmess_id = element.msgid;

                DEBUGLOG(`INSIDE INTERVAL Message [${lotmess_id}]. Lottery ended!`);
                
                element.endtime = null;
                element.msgid = null;

                db.get(`SELECT discord_channel_id, lot_message_id, lot_endtime, lot_key_id, author_discord_id FROM lottery WHERE lot_message_id="${lotmess_id}" AND win_discord_id IS NULL`).then(lotrow => {
                    if(!lotrow){
                        DEBUGLOG(`INSIDE INTERVAL ERROR Message [${lotmess_id}]. [${botstr.err_text_LotteryStopped}]`);
                    }
                    else{
                        client.channels.get(lotrow.discord_channel_id).fetchMessage(lotrow.lot_message_id).then(lotmessage => {
                            DEBUGLOG(`INSIDE INTERVAL Message [${lotmess_id}]. found! lottery [${lotrow.lot_key_id}]. Reaction [${lotmessage.reactions.size}]`);
                            if(lotmessage.reactions.size > 0){
                                getPlayers(lotmessage.reactions).then(LotPlayers => {
                                    if(LotPlayers.length > 0){
                                        let winNum = Math.floor(Math.random() * LotPlayers[0].length);
                                        
                                        client.fetchUser(LotPlayers[0][winNum]).then(user => {
                                            db.all(`SELECT id,discord_nickname,discord_id,NameOfGame,GameKey FROM gamekeys WHERE getdiscord_nickname="${lotmess_id}" and getdiscord_id="lotrun"`).then(row => {
                                                if (!row || row.length == 0) {
                                                    DEBUGLOG(`OUT INTERVAL Message [${lotmess_id}]. key not Found for chanel. (!row) [${lotrow.lot_key_id}]`);
                                                    lotmessage.channel.send(`${botstr.err_text_Prefix} ${botfn.getText(botstr.err_text_LotteryKeyNotFound, lotrow.lot_key_id)}`);
                                                }
                                                else{
                                                    strshow = ``;
                                                    namegame = ``;
                                                    for (let i = 0; i < row.length; i++) {
                                                        strshow += `${botfn.getText(botstr.show_text_FormatNameKey, [row[i].id, row[i].NameOfGame, row[i].GameKey])}\n`;
                                                        namegame += `${(i == 0)?"":"`, `"}${row[i].NameOfGame}`;
                                                    }
                                                    DEBUGLOG(`OUT INTERVAL Message [${lotmess_id}]. Ended lot! players:${LotPlayers[1]}. Key sended to (${winNum}/${LotPlayers[0].length})[${user.id}][${user.username}] [\`${namegame}\`]`);
    
                                                    db.run(`UPDATE gamekeys SET getdiscord_id="${user.id}",getdiscord_nickname="${user.username}" WHERE getdiscord_nickname="${lotmess_id}" and getdiscord_id="lotrun"`);
                                                    db.run(`UPDATE lottery SET win_discord_id="${user.id}",win_discord_nickname="${user.username}" WHERE lot_message_id="${lotmess_id}" AND win_discord_id IS NULL`);
    
                                                    lotmessage.edit(new Discord.RichEmbed(lotmessage.embeds[0]).setColor(botstr.start_color_LotteryStopped));
                                                    lotmessage.channel.send(botfn.getText(`${botstr.start_text_LotteryStoppedSuccess} ${botstr.getkey_text_KeyFoundSendChannel}`, [namegame, `<@${user.id}>`]));
                                                    user.send(botfn.getText(botstr.getkey_text_KeyFoundSendUser, [botfn.getText(botstr.show_text_KeyFound, strshow), `<@${row[0].discord_id}>`]));
                                                }
                                            })
                                        })
                                        .catch(errmess =>{
                                            DEBUGLOG(`INSIDE INTERVAL ERROR Message [${lotmess_id}]. {${errmess}}`);
                                        });
                                    }
                                    else{
                                         DEBUGLOG(`INSIDE INTERVAL ERROR Message [${lotmess_id}]. Not Found Lot Players. [${lotrow.lot_key_id}]`);
                                    }
                                })
                            }
                            else{
                                DEBUGLOG(`OUT INTERVAL Message [${lotmess_id}]. Ended lottery! Not checked (not emoji). Lottery [${lotrow.lot_key_id}]`);

                                db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE getdiscord_nickname="${lotmess_id}" and getdiscord_id="lotrun"`);
                                db.run(`DELETE FROM lottery WHERE lot_message_id="${lotmess_id}" AND win_discord_id IS NULL`);
                                lotmessage.edit(new Discord.RichEmbed(lotmessage.embeds[0]).setColor(botstr.start_color_LotteryStopped));
                                lotmessage.channel.send(botfn.getText(botstr.start_text_LotteryStoppedNoReaction, `<@${lotrow.author_discord_id}>`));
                            }

                        })
                        .catch(() => {
                            DEBUGLOG(`INSIDE INTERVAL ERROR Message [${lotmess_id}]. not found or other error`);
                            db.run(`UPDATE gamekeys SET getdiscord_id="lot",getdiscord_nickname=NULL WHERE getdiscord_nickname="${lotmess_id}" and getdiscord_id="lotrun"`);
                            db.run(`DELETE FROM lottery WHERE lot_message_id="${lotmess_id}" AND win_discord_id IS NULL`);
                        });
                    }
                });
            }
        });
    }
},15000)

db.open(config.database);
client.login(config.token);

